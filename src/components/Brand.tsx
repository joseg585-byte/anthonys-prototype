import Link from "next/link";

// Wordmark monogram. The crest "A" nods to the chariot emblem on Anthony's
// signage without copying it; pairs with the Playfair wordmark.
export function Brand({
  variant = "light",
  href = "/",
}: {
  variant?: "light" | "dark";
  href?: string;
}) {
  const fg = variant === "light" ? "text-cream" : "text-espresso";
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-3"
      aria-label="Anthony's Restaurant & Lounge — home"
    >
      <span className="relative grid h-10 w-10 place-items-center rounded-full border border-gold/60 bg-crimson-deep shadow-inner">
        <span className="font-display text-xl font-bold text-gold">A</span>
        <span className="absolute inset-0 rounded-full ring-1 ring-gold/20" />
      </span>
      <span className="leading-none">
        <span
          className={`block font-display text-xl font-bold tracking-wide ${fg}`}
        >
          Anthony&rsquo;s
        </span>
        <span className="overline mt-0.5 block text-[0.58rem] text-gold">
          On Grand · Est. 1978
        </span>
      </span>
    </Link>
  );
}
