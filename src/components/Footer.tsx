import { MapPin, Phone, Clock } from "lucide-react";
import { Brand } from "./Brand";
import { RESTAURANT } from "@/data/restaurant";

// Brand glyphs (lucide dropped these in this build) — minimal inline SVGs.
function InstagramGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
    </svg>
  );
}
function FacebookGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14.5 8.5V6.8c0-.8.3-1.3 1.4-1.3H17V2.7c-.5-.07-1.3-.2-2.2-.2-2.2 0-3.6 1.3-3.6 3.8v2.2H8.8v3h2.4V21h3.3v-9.5H17l.5-3z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Footer() {
  return (
    <footer
      id="visit"
      className="relative border-t border-gold/15 bg-charcoal text-cream"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-3">
        <div>
          <Brand variant="light" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/65">
            {RESTAURANT.tagline}. Authentic Italian dining in downtown Kansas
            City since {RESTAURANT.foundedYear}.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={RESTAURANT.social.instagram}
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-full border border-gold/30 text-cream/80 transition-colors hover:border-gold hover:text-gold"
            >
              <InstagramGlyph />
            </a>
            <a
              href={RESTAURANT.social.facebook}
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-full border border-gold/30 text-cream/80 transition-colors hover:border-gold hover:text-gold"
            >
              <FacebookGlyph />
            </a>
          </div>
        </div>

        <div>
          <h3 className="overline text-gold">Visit Us</h3>
          <ul className="mt-5 space-y-4 text-sm text-cream/80">
            <li className="flex gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-gold" />
              <span>
                {RESTAURANT.address.line1}
                <br />
                {RESTAURANT.address.city}, {RESTAURANT.address.state}{" "}
                {RESTAURANT.address.zip}
              </span>
            </li>
            <li className="flex gap-3">
              <Phone size={18} className="mt-0.5 shrink-0 text-gold" />
              <a href={RESTAURANT.phoneHref} className="hover:text-gold">
                {RESTAURANT.phone}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="overline text-gold">Hours</h3>
          <ul className="mt-5 space-y-3 text-sm text-cream/80">
            {RESTAURANT.hours.map((h) => (
              <li key={h.label} className="flex gap-3">
                <Clock size={18} className="mt-0.5 shrink-0 text-gold" />
                <span>
                  <span className="font-medium text-cream">{h.label}</span>
                  <br />
                  {h.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gold/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-cream/45 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {RESTAURANT.fullName}. All rights
            reserved.
          </p>
          <p>
            Prototype by{" "}
            <span className="text-gold/80">SeJo Labs</span> · a concept demo
          </p>
        </div>
      </div>
    </footer>
  );
}
