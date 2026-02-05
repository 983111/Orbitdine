import { Category, MenuItem, OrderStatus, Table, TableStatus } from './types';

export const CATEGORIES: Category[] = [
  { id: 'starters', name: 'Starters', icon: '🍟', description: 'The First Trial' },
  { id: 'mains', name: 'Main Course', icon: '🍔', description: 'The Grand Feast' },
  { id: 'desserts', name: 'Desserts', icon: '🍰', description: 'Sweet Victory' },
  { id: 'beverages', name: 'Beverages', icon: '🥤', description: 'Elixirs & Potions' },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Legendary Burger',
    description: 'Juicy beef, special sauce, crispy lettuce, brioche bun.',
    price: 349,
    category: 'mains',
    image: 'https://picsum.photos/400/300?random=1',
    rating: 5,
    isTopQuest: true,
  },
  {
    id: '2',
    name: 'Spicy Chicken Wings',
    description: '8 pcs, blazing hot sauce, served with ranch.',
    price: 299,
    category: 'starters',
    image: 'https://picsum.photos/400/300?random=2',
    rating: 4.5,
  },
  {
    id: '3',
    name: 'Golden Fries',
    description: 'Double fried, salted perfectly.',
    price: 99,
    category: 'starters',
    image: 'https://picsum.photos/400/300?random=3',
    rating: 4.2,
  },
  {
    id: '4',
    name: 'Lava Cake',
    description: 'Molten chocolate center with vanilla ice cream.',
    price: 199,
    category: 'desserts',
    image: 'https://picsum.photos/400/300?random=4',
    rating: 4.8,
  },
  {
    id: '5',
    name: 'Mystic Mojito',
    description: 'Mint, lime, soda, and secret syrup.',
    price: 149,
    category: 'beverages',
    image: 'https://picsum.photos/400/300?random=5',
    rating: 4.6,
  },
  {
    id: '6',
    name: 'Quest Pizza',
    description: 'Pepperoni, mushrooms, olives, extra cheese.',
    price: 499,
    category: 'mains',
    image: 'https://picsum.photos/400/300?random=6',
    rating: 4.7,
  }
];

export const TABLES: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  status: i === 0 ? TableStatus.NEW_ORDER : 
          i === 2 ? TableStatus.DINING : 
          i === 5 ? TableStatus.BILL_REQUESTED : 
          TableStatus.AVAILABLE,
  capacity: 4,
  currentOrderId: i === 0 ? 'ORD-1247' : undefined
}));

export const MOCK_ORDERS = [
  {
    id: 'ORD-1247',
    tableId: 1,
    status: OrderStatus.RECEIVED,
    total: 827,
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    items: [
      { ...MENU_ITEMS[0], cartId: 'a', quantity: 1, modifiers: ['Extra Cheese'] },
      { ...MENU_ITEMS[2], cartId: 'b', quantity: 2 }
    ]
  },
  {
    id: 'ORD-1240',
    tableId: 3,
    status: OrderStatus.PREPARING,
    total: 1200,
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    items: [
      { ...MENU_ITEMS[5], cartId: 'c', quantity: 2 }
    ]
  }
];