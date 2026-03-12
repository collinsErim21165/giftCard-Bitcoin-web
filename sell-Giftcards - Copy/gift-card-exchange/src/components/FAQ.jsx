import { useState, useEffect, useRef } from "react";
import LOGO from "../assets/NairaNexus.png";

const Y  = "#FFF078";
const Y2 = "#FFE03A";
const O  = "#FF8A2B";
const G  = "#00E87B";
const BG = [
  "radial-gradient(ellipse 80% 55% at 50% -10%, rgba(0,0,0,0.12) 0%, transparent 65%)",
  "radial-gradient(ellipse 55% 45% at 95% 90%, rgba(0,0,0,0.08) 0%, transparent 60%)",
  "radial-gradient(ellipse 40% 35% at 5% 95%, rgba(0,0,0,0.04) 0%, transparent 55%)",
  "linear-gradient(175deg, #FFF078 0%, #FFE03A 55%, #FFD700 100%)",
].join(", ");

const useInView = (threshold = 0.1) => {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, v];
};

const Reveal = ({ children, delay = 0, style = {} }) => {
  const [ref, v] = useInView(0.06);
  return (
    <div ref={ref} style={{
      ...style,
      opacity: v ? 1 : 0,
      transform: v ? "none" : "translateY(32px)",
      transition: `opacity 0.9s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.9s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>{children}</div>
  );
};

const Btn = ({ children, primary, href = "#", style: s = {} }) => (
  <a href={href} style={{
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: "none", cursor: "pointer", transition: "all 0.35s cubic-bezier(.22,1,.36,1)", letterSpacing: "-0.01em",
    padding: primary ? "16px 36px" : "16px 28px",
    background: primary ? "linear-gradient(135deg, #111009, #000)" : "rgba(0,0,0,0.06)",
    color: primary ? Y : "rgba(0,0,0,0.6)",
    border: primary ? "none" : "1px solid rgba(0,0,0,0.09)",
    boxShadow: primary ? "0 8px 40px rgba(0,0,0,0.18)" : "none",
    ...s,
  }}>{children}</a>
);

const Label = ({ children }) => (
  <div style={{ fontSize: 12, fontWeight: 700, color: "#000", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>{children}</div>
);

/* ── Accordion Item ── */
const AccordionItem = ({ question, answer, accent = Y, delay = 0 }) => {
  const [open, setOpen] = useState(false);
  return (
    <Reveal delay={delay}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <button onClick={() => setOpen(!open)} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "20px 0", textAlign: "left" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: open ? accent : "#fff", transition: "color 0.25s", lineHeight: 1.5 }}>{question}</span>
          <span style={{ fontSize: 20, color: open ? accent : "rgba(255,255,255,0.3)", transition: "all 0.3s", transform: open ? "rotate(45deg)" : "none", flexShrink: 0, lineHeight: 1 }}>+</span>
        </button>
        <div style={{ maxHeight: open ? 400 : 0, overflow: "hidden", transition: "max-height 0.4s cubic-bezier(.22,1,.36,1)" }}>
          <p style={{ fontSize: 14, lineHeight: 1.85, color: "rgba(255,255,255,0.5)", paddingBottom: 20 }}>{answer}</p>
        </div>
      </div>
    </Reveal>
  );
};

/* ── FAQ Section Block ── */
const FaqSection = ({ icon, title, accent, items }) => (
  <div style={{ position: "relative", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "32px 28px", marginBottom: 24 }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "20px 20px 0 0", background: `linear-gradient(90deg, ${accent}, transparent)` }} />
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
      <span style={{ fontSize: 26, color: "rgba(255,255,255,0.8)" }}>{icon}</span>
      <h2 style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>{title}</h2>
    </div>
    <div style={{ marginTop: 8 }}>
      {items.map(([q, a], i) => (
        <AccordionItem key={q} question={q} answer={a} accent={accent} delay={i * 50} />
      ))}
    </div>
  </div>
);

const faqData = [
  {
    icon: "💬", title: "General Questions", accent: Y,
    items: [
      ["What does your platform do?", "Our platform allows users to sell gift cards and trade cryptocurrency quickly and securely. Once a transaction is verified, payment is credited directly to your wallet."],
      ["Do I need an account to start trading?", "Yes. You must create an account before submitting any gift card or cryptocurrency transaction. Creating an account is free and takes only a few minutes."],
      ["How long does it take to create an account?", "Creating an account takes only a few minutes. Once your account is set up, you can immediately begin submitting transactions."],
      ["Is the platform available to everyone in Nigeria?", "Yes. Our platform is available to all users in Nigeria with a valid bank account for withdrawals."],
    ],
  },
  {
    icon: "🎁", title: "Gift Card Transactions", accent: O,
    items: [
      ["What types of gift cards do you accept?", "We accept various popular gift cards including Amazon, Apple/iTunes, Steam, Google Play, Vanilla, and other supported brands. Check our Rates page for the full list."],
      ["How do I sell my gift card?", "Select the gift card type, enter the card details including country and value, upload a clear image of the gift card, and submit the transaction for verification."],
      ["How long does it take to process gift cards?", "Most gift card transactions are reviewed and processed quickly once submitted. Processing time may vary based on card type and transaction volume."],
      ["Why was my gift card rejected?", "Gift cards may be rejected if the card is already used, the image is unclear, or the details don't match. Contact support if you believe there was an error."],
    ],
  },
  {
    icon: "₿", title: "Cryptocurrency Transactions", accent: G,
    items: [
      ["Which cryptocurrencies are supported?", "Our platform supports a wide range of cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), USDT, BUSD, Tron (TRX), XRP, Litecoin (LTC), and more. We are continuously expanding our supported coins to give you more flexibility."],
      ["How do I sell cryptocurrency on the platform?", "Select the cryptocurrency you want to sell, generate a unique wallet address, send your coins to that address, then enter the amount on the sell page to complete the transaction."],
      ["When will I receive my payment after sending crypto?", "Once the transaction is confirmed on the blockchain, the equivalent Naira value is credited to your wallet. Confirmation times depend on the blockchain network."],
      ["Do I need to send the exact amount?", "Yes. Please send the exact amount to the generated wallet address and ensure you use the correct network to avoid any delays or loss of funds."],
    ],
  },
  {
    icon: "💰", title: "Payments and Withdrawals", accent: O,
    items: [
      ["Where do I receive my payment?", "Payments from all approved transactions are credited directly to your platform wallet balance, which you can view in your dashboard."],
      ["How can I withdraw my funds?", "You can withdraw your wallet balance directly to any registered Nigerian bank account through the Withdraw section in your dashboard."],
      ["Is there a minimum withdrawal amount?", "Minimum withdrawal limits may apply depending on the platform's current policies. You will see the minimum amount clearly displayed on the withdrawal page."],
      ["How long does a withdrawal take?", "Withdrawals are typically processed quickly. In most cases, funds reach your bank account within minutes to a few hours."],
    ],
  },
  {
    icon: "🔒", title: "Security and Account Safety", accent: G,
    items: [
      ["Is the platform secure?", "Yes. Our platform uses modern security systems and transaction verification processes to protect users and ensure every transaction is safe and legitimate."],
      ["Why do some transactions require manual verification?", "Manual verification helps prevent fraud and ensures that all transactions on the platform are legitimate. This is done to protect both users and the platform."],
      ["What is a transaction PIN?", "A transaction PIN is a personal security code you set up that is required before every withdrawal. This adds an extra layer of protection to your account."],
      ["What should I do if I notice suspicious activity on my account?", "Contact our support team immediately so we can investigate and secure your account. You can also change your password right away from your account settings."],
    ],
  },
];

export default function FAQ() {
  const [navSolid, setNavSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fn = () => setNavSolid(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "How it works", href: "/how-it-works" },
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ];
  const activePath = window.location.pathname;
  const isActive = (href) => (href.split("#")[0] || "/") === activePath;

  /* filter based on search */
  const filtered = search.trim()
    ? faqData.map(section => ({
        ...section,
        items: section.items.filter(([q, a]) =>
          q.toLowerCase().includes(search.toLowerCase()) ||
          a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(s => s.items.length > 0)
    : faqData;

  return (
    <div style={{ background: BG, backgroundAttachment: "fixed", color: "#111", minHeight: "100vh", fontFamily: "'Manrope', system-ui, sans-serif", overflowX: "hidden", position: "relative" }}>

      {/* grid overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "linear-gradient(rgba(0,0,0,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.07) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black 10%, transparent 70%)",
        maskImage: "radial-gradient(ellipse at 50% 0%, black 10%, transparent 70%)",
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        ::selection{background:#111;color:${Y}}
        .nh:hover{color:${O}!important}
        .srch:focus{border-color:rgba(0,0,0,0.3)!important;background:rgba(0,0,0,0.1)!important}
        @keyframes float-a{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        .fa{animation:float-a 7s ease-in-out infinite}
        .fb{animation:float-a 9s ease-in-out infinite 2s}
      `}</style>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ━━━ NAV ━━━ */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, transition: "all 0.4s", background: navSolid ? "rgba(255,224,0,0.96)" : "transparent", backdropFilter: navSolid ? "blur(24px) saturate(1.5)" : "none", borderBottom: navSolid ? "1px solid rgba(0,0,0,0.08)" : "none" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", height: 88, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href="/" style={{ display: "flex", alignItems: "center" }}><img src={LOGO} alt="NairaNexus" style={{ width: 300, height: "auto" }} /></a>
            <div className="hidden lg:flex" style={{ alignItems: "center", gap: 32 }}>
              {navLinks.map(({ label, href }) => {
                const active = isActive(href);
                return (
                  <a key={label} href={href} className="nh" style={{ position: "relative", fontSize: 13, fontWeight: 600, color: active ? "#000" : "rgba(0,0,0,0.4)", textDecoration: "none", transition: "color 0.25s", letterSpacing: "0.01em", paddingBottom: 6 }}>
                    {label}
                    {active && <span style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#000", boxShadow: "0 0 6px rgba(0,0,0,0.4)" }} />}
                  </a>
                );
              })}
            </div>
            <div className="hidden lg:flex" style={{ alignItems: "center", gap: 10 }}>
              <a href="/signin" className="nh" style={{ fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.5)", textDecoration: "none", padding: "10px 20px", transition: "color 0.25s" }}>Log In</a>
              <a href="/signup" style={{ fontSize: 13, fontWeight: 700, color: Y, background: "linear-gradient(135deg,#111009,#000)", borderRadius: 12, padding: "10px 24px", textDecoration: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.2)", transition: "all 0.3s" }}>Create Account</a>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden" style={{ background: "none", border: "none", cursor: "pointer", padding: 8, flexDirection: "column", gap: 5 }}>
              {[0, 1, 2].map(i => <span key={i} style={{ display: "block", width: 20, height: 1.5, borderRadius: 2, background: "#000", transition: "all 0.3s", transform: menuOpen ? (i === 0 ? "rotate(45deg) translate(3px,5px)" : i === 2 ? "rotate(-45deg) translate(3px,-5px)" : "scaleX(0)") : "none", opacity: menuOpen && i === 1 ? 0 : 1 }} />)}
            </button>
          </div>
          {menuOpen && (
            <div className="lg:hidden" style={{ background: "rgba(255,224,0,0.98)", padding: "16px 28px 24px", borderTop: "1px solid rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 8 }}>
              {navLinks.map(({ label, href }) => {
                const active = isActive(href);
                return (
                  <a key={label} href={href} onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: active ? 700 : 400, color: active ? "#000" : "rgba(0,0,0,0.5)", textDecoration: "none", padding: "8px 0", borderLeft: active ? "3px solid #000" : "3px solid transparent", paddingLeft: 10 }}>{label}</a>
                );
              })}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <a href="/signin" style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12, padding: "12px 0", textDecoration: "none" }}>Log In</a>
                <a href="/signup" style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 700, color: Y, background: "#111", borderRadius: 12, padding: "12px 0", textDecoration: "none" }}>Create Account</a>
              </div>
            </div>
          )}
        </nav>

        {/* ━━━ HERO ━━━ */}
        <section style={{ minHeight: "52vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: 140, paddingBottom: 80 }}>
          <div style={{ position: "absolute", top: "8%", left: "5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,0,0,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div className="fa" style={{ position: "absolute", top: "18%", right: "8%", fontSize: 72, opacity: 0.1, pointerEvents: "none" }}>❓</div>
          <div className="fb" style={{ position: "absolute", bottom: "18%", right: "22%", fontSize: 48, opacity: 0.08, pointerEvents: "none" }}>💬</div>

          <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 28px", width: "100%", textAlign: "center" }}>
            <Reveal>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px 6px 8px", borderRadius: 100, background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.09)", marginBottom: 28 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: G, boxShadow: `0 0 8px ${G}` }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,0.6)", letterSpacing: "0.02em" }}>Quick answers to common questions</span>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.05em", marginBottom: 20 }}>
                Frequently Asked <span style={{ color: O }}>Questions</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p style={{ fontSize: "clamp(1rem, 1.6vw, 1.1rem)", lineHeight: 1.75, color: "rgba(0,0,0,0.55)", maxWidth: 560, margin: "0 auto 36px" }}>
                Find answers to common questions about selling gift cards, trading cryptocurrency, and using our platform. Can't find what you're looking for? Contact our support team.
              </p>
            </Reveal>

            {/* search bar */}
            <Reveal delay={240}>
              <div style={{ position: "relative", maxWidth: 480, margin: "0 auto" }}>
                <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.4 }}>🔍</span>
                <input
                  className="srch"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search questions..."
                  style={{ width: "100%", background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 14, padding: "14px 16px 14px 44px", color: "#111", fontSize: 14, fontFamily: "'Manrope',sans-serif", outline: "none", transition: "all 0.25s" }}
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ━━━ FAQ SECTIONS ━━━ */}
        <section style={{ padding: "20px 0 100px" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 28px" }}>
            {filtered.length === 0 ? (
              <Reveal>
                <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(0,0,0,0.4)" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                  <p style={{ fontSize: 15 }}>No results found for "<strong style={{ color: O }}>{search}</strong>". Try different keywords.</p>
                </div>
              </Reveal>
            ) : (
              filtered.map(({ icon, title, accent, items }) => (
                <FaqSection key={title} icon={icon} title={title} accent={accent} items={items} />
              ))
            )}
          </div>
        </section>

        {/* ━━━ NEED MORE HELP ━━━ */}
        <section style={{ padding: "80px 0", background: "rgba(0,0,0,0.03)" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 28px", textAlign: "center" }}>
            <Reveal>
              <div style={{ fontSize: 48, marginBottom: 20 }}>🙋</div>
              <Label>Support</Label>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 16 }}>
                Need More <span style={{ color: O }}>Help?</span>
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(0,0,0,0.55)", marginBottom: 36 }}>
                If you cannot find the answer you are looking for, our support team is always ready to assist you quickly and professionally.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Btn primary href="mailto:support@nairanexus.com">Contact Support</Btn>
                <Btn href="/contact">Visit Contact Page</Btn>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ━━━ FOOTER ━━━ */}
        <footer style={{ borderTop: "1px solid rgba(0,0,0,0.08)", padding: "60px 28px 28px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div className="grid grid-cols-2 lg:grid-cols-5" style={{ gap: 36, marginBottom: 40 }}>
              <div className="col-span-2 lg:col-span-1">
                <img src={LOGO} alt="NairaNexus" style={{ width: 300, height: "auto", marginBottom: 14 }} />
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(0,0,0,0.45)", maxWidth: 220 }}>Nigeria's fastest gift card and crypto trading platform.</p>
              </div>
              {[
                ["Company", ["About Us", "How It Works", "Careers"]],
                ["Product", ["Sell Gift Cards", "Trade Crypto", "Wallet", "Rates"]],
                ["Support", ["Help Center", "Contact", "FAQ"]],
                ["Legal", ["Privacy Policy", "Terms & Conditions", "AML Policy"]],
              ].map(([title, links]) => (
                <div key={title}>
                  <h4 style={{ fontSize: 11, fontWeight: 800, color: "rgba(0,0,0,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>{title}</h4>
                  {links.map(l => <a key={l} href={l === "About Us" ? "/about" : l === "How It Works" ? "/how-it-works" : l === "Rates" ? "/rates" : l === "Contact" ? "/contact" : l === "FAQ" ? "/faq" : "#"} className="nh" style={{ display: "block", fontSize: 13, color: "rgba(0,0,0,0.5)", textDecoration: "none", padding: "3px 0", transition: "color 0.25s" }}>{l}</a>)}
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: 20, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, fontSize: 12, color: "rgba(0,0,0,0.35)" }}>
              <span>&copy; 2026 NairaNexus. All Rights Reserved.</span>
              <div style={{ display: "flex", gap: 16 }}>
                {["Twitter", "Instagram", "Telegram", "WhatsApp"].map(s => <a key={s} href="#" className="nh" style={{ color: "rgba(0,0,0,0.35)", textDecoration: "none", transition: "color 0.25s" }}>{s}</a>)}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
