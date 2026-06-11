// Shared domain types for the Anthony's prototype.
// Multi-tenant from day one: every record is scoped to a restaurant (tenant).

export type Category =
  | "Appetizers"
  | "Soup & Salad"
  | "Pasta"
  | "Specialties"
  | "Desserts";

export const CATEGORY_ORDER: Category[] = [
  "Appetizers",
  "Soup & Salad",
  "Pasta",
  "Specialties",
  "Desserts",
];

export interface Modifier {
  id: string;
  name: string;
  priceCents: number;
  category?: "add-on" | "substitution" | "preparation";
}

export interface MenuItem {
  id: string;
  category: Category;
  name: string;
  description: string;
  priceCents: number;
  image?: string;
  tags?: Array<"vegetarian" | "vegan">;
  modifiers?: Modifier[];
  allowsSpecialRequests?: boolean;
  featured?: boolean;
  sortOrder: number;
}

export interface CartModifier {
  id: string;
  name: string;
  priceCents: number;
}

export interface CartLine {
  key: string;             // stable id: itemId[::sorted-modifier-ids]
  itemId: string;
  name: string;
  basePriceCents: number;
  priceCents: number;      // basePriceCents + sum(modifier prices)
  modifiers: CartModifier[];
  specialRequests?: string;
  qty: number;
  image?: string;
}

export type OrderStatus = "received" | "preparing" | "ready" | "completed";
export type OrderSource = "online" | "phone";
export type PaymentMethod = "card-on-pickup" | "cash-on-pickup" | "paid-online";

export interface OrderItem {
  name: string;
  qty: number;
  priceCents: number;      // unit price incl. modifiers
  modifiers: CartModifier[];
  specialRequests?: string;
}

export interface Order {
  id: string;
  shortCode: string;
  restaurantSlug: string;
  status: OrderStatus;
  source: OrderSource;
  customerFirstName: string;
  customerLastName: string;
  email: string;
  phone: string;
  items: OrderItem[];
  subtotalCents: number;
  taxCents: number;
  tipCents: number;
  totalCents: number;
  notes?: string;
  orderType: "pickup" | "delivery";
  deliveryAddress?: string;
  pickupTime?: string;
  paymentMethod: PaymentMethod;
  createdAt: number; // epoch ms
}
