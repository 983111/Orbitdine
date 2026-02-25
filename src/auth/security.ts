import crypto from "node:crypto";
import bcrypt from "bcryptjs";

const toBase64Url = (input: string | Buffer) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const fromBase64Url = (input: string) => {
  const padded = input.padEnd(Math.ceil(input.length / 4) * 4, "=").replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64").toString("utf8");
};

const jwtSecret = process.env.JWT_SECRET ?? "orbitdine-dev-secret";

export type AuthPayload = {
  sub: string;
  role: "manager" | "owner";
  username: string;
  exp: number;
};

export const signJwt = (payload: Omit<AuthPayload, "exp">, expiresInSeconds = 60 * 60 * 8) => {
  const header = { alg: "HS256", typ: "JWT" };
  const fullPayload: AuthPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac("sha256", jwtSecret).update(data).digest("base64url");

  return `${data}.${signature}`;
};

export const verifyJwt = (token: string): AuthPayload | null => {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto.createHmac("sha256", jwtSecret).update(data).digest("base64url");

  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as AuthPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

const fallbackHash = (password: string, salt?: string) => {
  const effectiveSalt = salt ?? crypto.randomBytes(16).toString("hex");
  const digest = crypto.pbkdf2Sync(password, effectiveSalt, 120_000, 64, "sha512").toString("hex");
  return `${effectiveSalt}:${digest}`;
};

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (password: string, storedHash: string) => {
  if (storedHash.includes(":")) {
    const [salt] = storedHash.split(":");
    return fallbackHash(password, salt) === storedHash;
  }

  return bcrypt.compare(password, storedHash);
};
