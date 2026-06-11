"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, User, Phone, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";

type Step = "email" | "signup" | "sent";

export function AuthModal() {
  const modalOpen = useAuth((s) => s.modalOpen);
  const closeModal = useAuth((s) => s.closeModal);
  const checkIsNewUser = useAuth((s) => s.checkIsNewUser);
  const sendMagicLink = useAuth((s) => s.sendMagicLink);
  const verifyDemo = useAuth((s) => s.verifyDemo);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [emailErr, setEmailErr] = useState("");
  const [signupErr, setSignupErr] = useState("");

  useEffect(() => {
    if (!modalOpen) {
      // Reset on close with slight delay so exit animation plays clean
      const t = setTimeout(() => {
        setStep("email");
        setEmail("");
        setFirstName("");
        setLastName("");
        setPhone("");
        setEmailErr("");
        setSignupErr("");
      }, 350);
      return () => clearTimeout(t);
    }
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [modalOpen, closeModal]);

  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const handleEmailContinue = () => {
    if (!isValidEmail(email)) {
      setEmailErr("Enter a valid email address");
      return;
    }
    setEmailErr("");
    const isNew = checkIsNewUser(email);
    if (isNew) {
      setStep("signup");
    } else {
      sendMagicLink(email.trim());
      setStep("sent");
    }
  };

  const handleSignup = () => {
    if (!firstName.trim()) {
      setSignupErr("First name is required");
      return;
    }
    setSignupErr("");
    sendMagicLink(email.trim(), firstName.trim(), lastName.trim(), phone.trim());
    setStep("sent");
  };

  const handleVerifyDemo = () => {
    verifyDemo(email.trim());
  };

  return (
    <AnimatePresence>
      {modalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeModal}
            className="fixed inset-0 z-[70] bg-charcoal/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed inset-x-4 top-[12vh] z-[71] mx-auto max-w-md rounded-2xl bg-parchment shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Sign in to Anthony's"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gold/15 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-crimson-deep font-display text-sm font-bold text-gold">
                  A
                </span>
                <p className="font-display text-base font-semibold text-espresso">
                  {step === "email" && "Welcome back"}
                  {step === "signup" && "Create your account"}
                  {step === "sent" && "Check your email"}
                </p>
              </div>
              <button
                onClick={closeModal}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full text-espresso-soft/50 transition-colors hover:text-espresso"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5">
              {/* ── Step: Email ── */}
              {step === "email" && (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-espresso-soft/75">
                    Enter your email to sign in or create an account. We&rsquo;ll
                    send you a magic link — no password needed.
                  </p>
                  <label className="block">
                    <span className="overline text-[0.62rem] text-espresso-soft/60">
                      Email Address
                    </span>
                    <div className="relative mt-1.5">
                      <Mail
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso-soft/40"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailErr) setEmailErr("");
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleEmailContinue()
                        }
                        placeholder="you@example.com"
                        autoFocus
                        className={`focus-gold w-full rounded-lg border bg-cream/70 py-2.5 pl-10 pr-4 text-sm text-espresso placeholder:text-espresso-soft/35 ${
                          emailErr ? "border-crimson/60" : "border-gold/25"
                        }`}
                      />
                    </div>
                    {emailErr && (
                      <p className="mt-1 text-xs text-crimson">{emailErr}</p>
                    )}
                  </label>

                  <button
                    onClick={handleEmailContinue}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-crimson py-3 text-sm font-semibold text-cream transition-all hover:bg-crimson-deep active:scale-95"
                  >
                    Continue
                    <ArrowRight size={15} />
                  </button>
                </motion.div>
              )}

              {/* ── Step: Signup ── */}
              {step === "signup" && (
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-espresso-soft/75">
                    First time here? Tell us your name to finish creating your
                    account.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="overline text-[0.62rem] text-espresso-soft/60">
                        First Name
                      </span>
                      <div className="relative mt-1.5">
                        <User
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-soft/40"
                        />
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            if (signupErr) setSignupErr("");
                          }}
                          placeholder="Maria"
                          autoFocus
                          className={`focus-gold w-full rounded-lg border bg-cream/70 py-2.5 pl-9 pr-3 text-sm text-espresso placeholder:text-espresso-soft/35 ${
                            signupErr ? "border-crimson/60" : "border-gold/25"
                          }`}
                        />
                      </div>
                    </label>
                    <label className="block">
                      <span className="overline text-[0.62rem] text-espresso-soft/60">
                        Last Name
                      </span>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Russo"
                        className="focus-gold mt-1.5 w-full rounded-lg border border-gold/25 bg-cream/70 px-3.5 py-2.5 text-sm text-espresso placeholder:text-espresso-soft/35"
                      />
                    </label>
                  </div>
                  {signupErr && (
                    <p className="-mt-1 text-xs text-crimson">{signupErr}</p>
                  )}
                  <label className="block">
                    <span className="overline text-[0.62rem] text-espresso-soft/60">
                      Phone (optional)
                    </span>
                    <div className="relative mt-1.5">
                      <Phone
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-espresso-soft/40"
                      />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSignup()
                        }
                        placeholder="(816) 555-0148"
                        className="focus-gold w-full rounded-lg border border-gold/25 bg-cream/70 py-2.5 pl-9 pr-3.5 text-sm text-espresso placeholder:text-espresso-soft/35"
                      />
                    </div>
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep("email")}
                      className="rounded-full border border-gold/30 px-4 py-2.5 text-sm font-medium text-espresso-soft transition-colors hover:border-gold hover:text-espresso"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSignup}
                      className="flex-1 rounded-full bg-crimson py-2.5 text-sm font-semibold text-cream transition-all hover:bg-crimson-deep active:scale-95"
                    >
                      Create Account &amp; Send Link
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Step: Sent ── */}
              {step === "sent" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 text-center"
                >
                  <div className="flex justify-center">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 16,
                      }}
                      className="grid h-16 w-16 place-items-center rounded-full bg-basil/15 text-basil"
                    >
                      <CheckCircle size={32} />
                    </motion.span>
                  </div>
                  <div>
                    <p className="font-display text-lg font-semibold text-espresso">
                      Link sent to
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-crimson">
                      {email}
                    </p>
                  </div>
                  <p className="text-sm text-espresso-soft/70">
                    Check your inbox and click the link to sign in. (The link is
                    logged to the browser console for this demo.)
                  </p>

                  <div className="rounded-xl border border-gold/25 bg-cream p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gold-deep">
                      <Sparkles size={13} />
                      Demo shortcut
                    </div>
                    <p className="mt-1.5 text-xs text-espresso-soft/70">
                      In production the link arrives by email. For this demo,
                      click below to auto-verify instantly.
                    </p>
                    <button
                      onClick={handleVerifyDemo}
                      className="mt-3 w-full rounded-full bg-gold py-2.5 text-sm font-bold text-espresso transition-all hover:bg-gold-light active:scale-95"
                    >
                      Verify &amp; Sign In Now →
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
