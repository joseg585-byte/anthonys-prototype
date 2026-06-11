"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  Gift,
  CreditCard,
  Plus,
  Trash2,
  ArrowLeft,
  LogOut,
  Check,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { useOrders } from "@/lib/orders";
import { useGiftCards } from "@/lib/giftCards";
import { useHasMounted } from "@/lib/useHasMounted";
import { formatPrice } from "@/lib/format";
import { MENU_BY_ID } from "@/data/menu";

type Tab = "account" | "orders" | "addresses" | "favorites" | "gift-cards" | "payment";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "account", label: "Account", icon: User },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "gift-cards", label: "Gift Cards", icon: Gift },
  { id: "payment", label: "Payment", icon: CreditCard },
];

export default function ProfilePage() {
  const router = useRouter();
  const mounted = useHasMounted();
  const profile = useAuth((s) => s.profile);
  const logout = useAuth((s) => s.logout);
  const openModal = useAuth((s) => s.openModal);
  const updateProfile = useAuth((s) => s.updateProfile);
  const addAddress = useAuth((s) => s.addAddress);
  const removeAddress = useAuth((s) => s.removeAddress);
  const toggleFavorite = useAuth((s) => s.toggleFavorite);

  const allOrders = useOrders((s) => s.orders);
  const allGiftCards = useGiftCards((s) => s.giftCards);

  const [tab, setTab] = useState<Tab>("account");
  const [newAddress, setNewAddress] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      });
    }
  }, [profile]);

  if (!mounted) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-parchment" />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-parchment px-6 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-cream-deep text-gold-deep">
            <User size={28} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-espresso">
              Sign in to view your account
            </h1>
            <p className="mt-2 text-sm text-espresso-soft/70">
              Create an account to save your order history, addresses, and
              favorite dishes.
            </p>
          </div>
          <button
            onClick={openModal}
            className="rounded-full bg-crimson px-8 py-3 text-sm font-semibold text-cream transition-colors hover:bg-crimson-deep"
          >
            Sign In / Create Account
          </button>
          <Link
            href="/"
            className="text-sm text-espresso-soft/60 underline"
          >
            Back to menu
          </Link>
        </div>
      </>
    );
  }

  const myOrders = allOrders.filter(
    (o) => o.email.toLowerCase() === profile.email.toLowerCase(),
  );

  const myGiftCards = allGiftCards.filter(
    (gc) =>
      gc.recipientEmail.toLowerCase() === profile.email.toLowerCase() ||
      gc.senderEmail.toLowerCase() === profile.email.toLowerCase(),
  );

  const favoriteItems = profile.favoriteItemIds
    .map((id) => MENU_BY_ID[id])
    .filter(Boolean);

  const handleSaveProfile = () => {
    updateProfile({
      firstName: editForm.firstName.trim(),
      lastName: editForm.lastName.trim(),
      phone: editForm.phone.trim(),
    });
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-parchment pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-5">
          {/* Page header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <Link
                href="/"
                className="mb-3 inline-flex items-center gap-1.5 text-sm text-espresso-soft/60 transition-colors hover:text-espresso"
              >
                <ArrowLeft size={14} />
                Back to site
              </Link>
              <h1 className="font-display text-3xl font-bold text-espresso">
                Hello, {profile.firstName}!
              </h1>
              <p className="mt-1 text-sm text-espresso-soft/65">
                {profile.email}
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-4 py-2 text-sm text-espresso-soft/70 transition-colors hover:border-crimson/50 hover:text-crimson"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Sidebar tabs */}
            <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto lg:w-52 lg:flex-col">
              {TABS.map((t) => {
                const Icon = t.icon;
                const isActive = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-all lg:w-full ${
                      isActive
                        ? "bg-crimson text-cream shadow-sm"
                        : "text-espresso-soft/70 hover:bg-cream-deep hover:text-espresso"
                    }`}
                  >
                    <Icon size={15} />
                    {t.label}
                    {t.id === "orders" && myOrders.length > 0 && (
                      <span
                        className={`ml-auto rounded-full px-1.5 text-xs font-bold ${
                          isActive
                            ? "bg-cream/20 text-cream"
                            : "bg-espresso/10 text-espresso-soft"
                        }`}
                      >
                        {myOrders.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Content */}
            <div className="flex-1">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* ── Account ── */}
                {tab === "account" && (
                  <div className="rounded-2xl border border-gold/20 bg-cream p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="font-display text-xl font-bold text-espresso">
                        Account Info
                      </h2>
                      {saved && (
                        <span className="flex items-center gap-1 text-xs text-basil">
                          <Check size={13} />
                          Saved
                        </span>
                      )}
                      <button
                        onClick={() =>
                          editMode ? handleSaveProfile() : setEditMode(true)
                        }
                        className="text-sm font-medium text-crimson underline"
                      >
                        {editMode ? "Save" : "Edit"}
                      </button>
                    </div>
                    <dl className="space-y-4">
                      <div>
                        <dt className="overline text-[0.62rem] text-espresso-soft/55">
                          Name
                        </dt>
                        {editMode ? (
                          <div className="mt-1.5 grid grid-cols-2 gap-3">
                            <input
                              value={editForm.firstName}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  firstName: e.target.value,
                                })
                              }
                              placeholder="First"
                              className="focus-gold rounded-lg border border-gold/25 bg-cream/70 px-3 py-2 text-sm text-espresso"
                            />
                            <input
                              value={editForm.lastName}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  lastName: e.target.value,
                                })
                              }
                              placeholder="Last"
                              className="focus-gold rounded-lg border border-gold/25 bg-cream/70 px-3 py-2 text-sm text-espresso"
                            />
                          </div>
                        ) : (
                          <dd className="mt-0.5 text-sm text-espresso">
                            {profile.firstName} {profile.lastName}
                          </dd>
                        )}
                      </div>
                      <div>
                        <dt className="overline text-[0.62rem] text-espresso-soft/55">
                          Email
                        </dt>
                        <dd className="mt-0.5 text-sm text-espresso">
                          {profile.email}
                        </dd>
                      </div>
                      <div>
                        <dt className="overline text-[0.62rem] text-espresso-soft/55">
                          Phone
                        </dt>
                        {editMode ? (
                          <input
                            value={editForm.phone}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                phone: e.target.value,
                              })
                            }
                            placeholder="(816) 555-0000"
                            type="tel"
                            className="focus-gold mt-1.5 w-full rounded-lg border border-gold/25 bg-cream/70 px-3 py-2 text-sm text-espresso"
                          />
                        ) : (
                          <dd className="mt-0.5 text-sm text-espresso">
                            {profile.phone || (
                              <span className="text-espresso-soft/40 italic">
                                Not set
                              </span>
                            )}
                          </dd>
                        )}
                      </div>
                    </dl>
                  </div>
                )}

                {/* ── Orders ── */}
                {tab === "orders" && (
                  <div className="rounded-2xl border border-gold/20 bg-cream p-6 shadow-sm">
                    <h2 className="mb-5 font-display text-xl font-bold text-espresso">
                      Order History
                    </h2>
                    {myOrders.length === 0 ? (
                      <div className="py-10 text-center">
                        <ShoppingBag
                          size={32}
                          className="mx-auto mb-3 text-gold/40"
                        />
                        <p className="text-sm text-espresso-soft/60">
                          No orders yet. Your history will appear here after
                          you place an order.
                        </p>
                        <Link
                          href="/#menu"
                          className="mt-4 inline-block rounded-full bg-crimson px-6 py-2.5 text-sm font-semibold text-cream"
                        >
                          Browse the Menu
                        </Link>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {myOrders.map((order) => (
                          <li
                            key={order.id}
                            className="rounded-xl border border-gold/15 bg-cream-deep p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-display text-lg font-bold text-crimson">
                                  {order.shortCode}
                                </p>
                                <p className="text-xs text-espresso-soft/60">
                                  {new Date(order.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )}
                                  {" · "}
                                  {order.orderType === "delivery"
                                    ? "Delivery"
                                    : "Pickup"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-display font-bold text-espresso">
                                  {formatPrice(order.totalCents)}
                                </p>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide ${
                                    order.status === "completed"
                                      ? "bg-basil/15 text-basil"
                                      : "bg-gold/15 text-gold-deep"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </div>
                            </div>
                            <ul className="mt-2 space-y-0.5">
                              {order.items.map((it, i) => (
                                <li
                                  key={i}
                                  className="flex justify-between text-xs text-espresso-soft/70"
                                >
                                  <span>
                                    {it.qty}× {it.name}
                                  </span>
                                  <span>
                                    {formatPrice(it.priceCents * it.qty)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            <button
                              onClick={() => {
                                // Reorder: add all items to cart
                                import("@/lib/store").then(
                                  ({ useCart }) => {
                                    import("@/data/menu").then(
                                      ({ MENU_BY_ID: menu }) => {
                                        const { add, open } =
                                          useCart.getState();
                                        order.items.forEach((item) => {
                                          const menuItem = menu[
                                            Object.keys(menu).find(
                                              (k) => menu[k].name === item.name,
                                            ) ?? ""
                                          ];
                                          if (menuItem) {
                                            add(
                                              menuItem,
                                              item.modifiers,
                                              item.specialRequests,
                                              item.qty,
                                            );
                                          }
                                        });
                                        open();
                                      },
                                    );
                                  },
                                );
                              }}
                              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-4 py-1.5 text-xs font-medium text-espresso-soft transition-colors hover:border-gold hover:text-espresso"
                            >
                              Reorder
                              <ChevronRight size={12} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* ── Addresses ── */}
                {tab === "addresses" && (
                  <div className="rounded-2xl border border-gold/20 bg-cream p-6 shadow-sm">
                    <h2 className="mb-5 font-display text-xl font-bold text-espresso">
                      Saved Addresses
                    </h2>
                    {profile.savedAddresses.length === 0 && (
                      <p className="mb-5 text-sm text-espresso-soft/60">
                        Save delivery addresses for faster checkout.
                      </p>
                    )}
                    <ul className="mb-4 space-y-2">
                      {profile.savedAddresses.map((addr) => (
                        <li
                          key={addr}
                          className="flex items-center gap-3 rounded-xl border border-gold/15 bg-cream-deep px-4 py-3"
                        >
                          <MapPin
                            size={14}
                            className="shrink-0 text-gold-deep"
                          />
                          <span className="flex-1 text-sm text-espresso">
                            {addr}
                          </span>
                          <button
                            onClick={() => removeAddress(addr)}
                            className="text-espresso-soft/40 transition-colors hover:text-crimson"
                          >
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newAddress.trim()) {
                            addAddress(newAddress.trim());
                            setNewAddress("");
                          }
                        }}
                        placeholder="Add delivery address"
                        className="focus-gold flex-1 rounded-lg border border-gold/25 bg-cream/70 px-3.5 py-2.5 text-sm text-espresso placeholder:text-espresso-soft/40"
                      />
                      <button
                        onClick={() => {
                          if (newAddress.trim()) {
                            addAddress(newAddress.trim());
                            setNewAddress("");
                          }
                        }}
                        disabled={!newAddress.trim()}
                        className="grid h-10 w-10 place-items-center rounded-lg bg-crimson text-cream transition-all hover:bg-crimson-deep disabled:opacity-40"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Favorites ── */}
                {tab === "favorites" && (
                  <div className="rounded-2xl border border-gold/20 bg-cream p-6 shadow-sm">
                    <h2 className="mb-5 font-display text-xl font-bold text-espresso">
                      Favorite Dishes
                    </h2>
                    {favoriteItems.length === 0 ? (
                      <div className="py-10 text-center">
                        <Heart size={32} className="mx-auto mb-3 text-gold/40" />
                        <p className="text-sm text-espresso-soft/60">
                          No favorites yet. Tap the heart on any menu item to
                          save it here.
                        </p>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {favoriteItems.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-gold/15 bg-cream-deep px-4 py-3"
                          >
                            <div>
                              <p className="font-display text-sm font-semibold text-espresso">
                                {item.name}
                              </p>
                              <p className="text-xs text-espresso-soft/60">
                                {item.category} · {formatPrice(item.priceCents)}
                              </p>
                            </div>
                            <button
                              onClick={() => toggleFavorite(item.id)}
                              className="text-crimson transition-colors hover:text-espresso-soft/40"
                            >
                              <Heart size={16} fill="currentColor" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* ── Gift Cards ── */}
                {tab === "gift-cards" && (
                  <div className="rounded-2xl border border-gold/20 bg-cream p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="font-display text-xl font-bold text-espresso">
                        Gift Cards
                      </h2>
                      <Link
                        href="/gift-cards"
                        className="text-sm font-medium text-crimson underline"
                      >
                        Send a gift card
                      </Link>
                    </div>
                    {myGiftCards.length === 0 ? (
                      <div className="py-10 text-center">
                        <Gift size={32} className="mx-auto mb-3 text-gold/40" />
                        <p className="text-sm text-espresso-soft/60">
                          No gift cards yet.
                        </p>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {myGiftCards.map((gc) => {
                          const isRecipient =
                            gc.recipientEmail.toLowerCase() ===
                            profile.email.toLowerCase();
                          return (
                            <li
                              key={gc.id}
                              className="rounded-xl border border-gold/15 bg-cream-deep p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-display font-bold text-espresso">
                                    {formatPrice(gc.balanceCents)}{" "}
                                    <span className="text-sm font-normal text-espresso-soft/60">
                                      remaining of {formatPrice(gc.amountCents)}
                                    </span>
                                  </p>
                                  <p className="mt-0.5 text-xs text-espresso-soft/60">
                                    {isRecipient
                                      ? `From ${gc.senderName}`
                                      : `Sent to ${gc.recipientName}`}
                                  </p>
                                </div>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide ${
                                    gc.status === "active"
                                      ? "bg-basil/15 text-basil"
                                      : "bg-espresso/10 text-espresso-soft/60"
                                  }`}
                                >
                                  {gc.status}
                                </span>
                              </div>
                              {isRecipient && (
                                <div className="mt-3 rounded-lg bg-espresso/5 px-3 py-2">
                                  <p className="font-mono text-sm font-bold tracking-[0.15em] text-espresso">
                                    {gc.code}
                                  </p>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}

                {/* ── Payment Methods ── */}
                {tab === "payment" && (
                  <div className="rounded-2xl border border-gold/20 bg-cream p-6 shadow-sm">
                    <h2 className="mb-5 font-display text-xl font-bold text-espresso">
                      Saved Payment Methods
                    </h2>
                    <div className="rounded-xl border border-gold/15 bg-cream-deep p-5 text-center">
                      <CreditCard
                        size={32}
                        className="mx-auto mb-3 text-gold/40"
                      />
                      <p className="text-sm font-medium text-espresso-soft/70">
                        Secure payment methods
                      </p>
                      <p className="mt-1 text-xs text-espresso-soft/50">
                        Stripe integration live at launch — cards saved here
                        for 1-tap checkout.
                      </p>
                      <button
                        disabled
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/25 px-5 py-2 text-sm text-espresso-soft/40 opacity-60 cursor-not-allowed"
                      >
                        <Plus size={14} />
                        Add Payment Method
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
