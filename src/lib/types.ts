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
  driverAssigned?: boolean;
  createdAt: number; // epoch ms
}

// ── Reservations ──────────────────────────────────────────────────────────────

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "alternate-suggested";

export type OccasionType =
  | "none"
  | "anniversary"
  | "birthday"
  | "business"
  | "other";

export type PartySizeOption = "1-2" | "3-4" | "5-6" | "7-8" | "9+";

export interface Reservation {
  id: string;
  restaurantSlug: string;
  status: ReservationStatus;
  source?: "online" | "phone";
  name: string;
  email: string;
  phone: string;
  partySize: PartySizeOption;
  date: string;            // YYYY-MM-DD
  time: string;            // "4:00 PM"
  occasion: OccasionType;
  specialRequests?: string;
  customerId?: string;
  adminNote?: string;
  suggestedTime?: string;
  createdAt: number;
}

// ── Gift Cards ─────────────────────────────────────────────────────────────────

export type GiftCardStatus = "active" | "used" | "expired";

export interface GiftCard {
  id: string;
  code: string;
  restaurantSlug: string;
  source?: "online" | "phone";
  amountCents: number;
  balanceCents: number;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  message?: string;
  deliverAt?: string;      // ISO date string, empty/undefined = immediate
  status: GiftCardStatus;
  purchasedAt: number;
}

// ── Customer Profile ──────────────────────────────────────────────────────────

export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  savedAddresses: string[];
  favoriteItemIds: string[];
  createdAt: number;
}
