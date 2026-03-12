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

const Reveal = ({ children, delay = 0, className = "", style = {} }) => {
  const [ref, v] = useInView(0.08);
  return (
    <div ref={ref} className={className} style={{
      ...style,
      opacity: v ? 1 : 0,
      transform: v ? "none" : "translateY(40px)",
      transition: `opacity 1s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 1s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>{children}</div>
  );
};

const Btn = ({ children, primary, href = "#", style: s = {} }) => (
  <a href={href} style={{
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: "none", cursor: "pointer", transition: "all 0.35s cubic-bezier(.22,1,.36,1)", letterSpacing: "-0.01em",
    padding: primary ? "16px 36px" : "16px 28px",
    background: primary ? "linear-gradient(135deg, #111009, #000)" : "rgba(0,0,0,0.07)",
    color: primary ? Y : "rgba(0,0,0,0.6)",
    border: primary ? "none" : "1px solid rgba(0,0,0,0.12)",
    boxShadow: primary ? `0 8px 40px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)` : "none",
    ...s,
  }}>{children}</a>
);

const Label = ({ children }) => (
  <div style={{ fontSize: 12, fontWeight: 700, color: "#000", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>{children}</div>
);

export default function HowItWorks() {
  const [navSolid, setNavSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("gift");

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

  const giftSteps = [
    { icon: "🎁", step: "01", title: "Select Gift Card Type", desc: "Choose the type of gift card you want to sell — Amazon, Apple, Steam, Google Play and more." },
    { icon: "📝", step: "02", title: "Enter Gift Card Details", desc: "Provide the gift card country, value, and upload a clear image of the card." },
    { icon: "💱", step: "03", title: "Review Transaction Summary", desc: "The platform automatically calculates the Naira value based on the current exchange rate." },
    { icon: "📤", step: "04", title: "Submit Transaction", desc: "Your gift card is submitted and sent to our team for verification." },
    { icon: "💰", step: "05", title: "Get Paid", desc: "Once verified, payment is instantly credited to your wallet balance." },
  ];

  const cryptoSteps = [
    { icon: "₿", step: "01", title: "Select Cryptocurrency", desc: "Choose the coin you want to sell — Bitcoin (BTC), USDT, or any other supported cryptocurrency." },
    { icon: "🏦", step: "02", title: "Generate a Wallet Address", desc: "The platform generates a unique, secure deposit wallet address specifically for your transaction. This is where you will send your coins." },
    { icon: "📤", step: "03", title: "Send Coins to the Address", desc: "Transfer your cryptocurrency to the generated wallet address. Make sure to send the exact amount and use the correct network." },
    { icon: "📝", step: "04", title: "Enter Amount on Sell Page", desc: "Once your coins have been sent, go to the sell page and enter the amount you are selling to complete the transaction." },
    { icon: "✅", step: "05", title: "Receive Naira", desc: "After verification, the Naira equivalent is instantly credited to your wallet balance." },
  ];

  const accentFor = (i) => ["#000", O, G, "#333", "#000"][i % 5];

  return (
    <div style={{ background: BG, backgroundAttachment: "fixed", color: "#111", minHeight: "100vh", fontFamily: "'Manrope', system-ui, sans-serif", overflowX: "hidden", position: "relative" }}>

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
        .font-mono{font-family:'JetBrains Mono',monospace}
        .gh:hover{background:#161616!important;border-color:rgba(255,255,255,0.1)!important;transform:translateY(-4px)!important;box-shadow:0 24px 64px rgba(0,0,0,0.5)!important}
        .nh:hover{color:${O}!important}
        @keyframes float-a{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
        .fa{animation:float-a 6s ease-in-out infinite}
        .fb{animation:float-a 8s ease-in-out infinite 1s}
        .fc{animation:float-a 5s ease-in-out infinite 2s}
        @keyframes pulse{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
        .pulse{animation:pulse 2s ease-in-out infinite}
      `}</style>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ━━━ NAV ━━━ */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, transition: "all 0.4s", background: navSolid ? "rgba(255,224,0,0.96)" : "transparent", backdropFilter: navSolid ? "blur(24px) saturate(1.5)" : "none", borderBottom: navSolid ? "1px solid rgba(0,0,0,0.08)" : "none" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", height: 88, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href="/" style={{ display: "flex", alignItems: "center" }}><img src={LOGO} alt="NairaNexus" style={{ width: 300, height: "auto" }} /></a>
            <div className="hidden lg:flex" style={{ alignItems: "center", gap: 36 }}>
              {navLinks.map(({ label, href }) => {
                const active = isActive(href);
                return (
                  <a key={label} href={href} className="nh" style={{ position: "relative", fontSize: 13, fontWeight: 600, color: active ? "#000" : "rgba(0,0,0,0.45)", textDecoration: "none", transition: "color 0.25s", letterSpacing: "0.01em", paddingBottom: 6 }}>
                    {label}
                    {active && <span style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#000", boxShadow: `0 0 6px rgba(0,0,0,0.5)` }} />}
                  </a>
                );
              })}
            </div>
            <div className="hidden lg:flex" style={{ alignItems: "center", gap: 10 }}>
              <a href="/signin" className="nh" style={{ fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.55)", textDecoration: "none", padding: "10px 20px", transition: "color 0.25s" }}>Log In</a>
              <a href="/signup" style={{ fontSize: 13, fontWeight: 700, color: Y, background: "linear-gradient(135deg,#111009,#000)", borderRadius: 12, padding: "10px 24px", textDecoration: "none", boxShadow: `0 4px 24px rgba(0,0,0,0.2)`, transition: "all 0.3s" }}>Create Account</a>
            </div>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden" style={{ background: "none", border: "none", cursor: "pointer", padding: 8, flexDirection: "column", gap: 5 }}>
              {[0, 1, 2].map(i => <span key={i} style={{ display: "block", width: 20, height: 1.5, borderRadius: 2, background: "#000", transition: "all 0.3s", transform: menuOpen ? (i === 0 ? "rotate(45deg) translate(3px,5px)" : i === 2 ? "rotate(-45deg) translate(3px,-5px)" : "scaleX(0)") : "none", opacity: menuOpen && i === 1 ? 0 : 1 }} />)}
            </button>
          </div>
          {menuOpen && (
            <div className="lg:hidden" style={{ background: "rgba(255,224,0,0.98)", padding: "16px 28px 24px", borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 8 }}>
              {navLinks.map(({ label, href }) => {
                const active = isActive(href);
                return (
                  <a key={label} href={href} onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: active ? 700 : 400, color: active ? "#000" : "rgba(0,0,0,0.55)", textDecoration: "none", padding: "8px 0", borderLeft: active ? `3px solid #000` : "3px solid transparent", paddingLeft: 10 }}>{label}</a>
                );
              })}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <a href="/signin" style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.55)", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12, padding: "12px 0", textDecoration: "none" }}>Log In</a>
                <a href="/signup" style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 700, color: Y, background: "#000", borderRadius: 12, padding: "12px 0", textDecoration: "none" }}>Create Account</a>
              </div>
            </div>
          )}
        </nav>

        {/* ━━━ 1. HERO ━━━ */}
        <section style={{ minHeight: "65vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: 140, paddingBottom: 80 }}>
          <div style={{ position: "absolute", top: "10%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, rgba(0,0,0,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle, rgba(0,232,123,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div className="fa" style={{ position: "absolute", top: "20%", right: "8%", fontSize: 72, opacity: 0.1, pointerEvents: "none" }}>₿</div>
          <div className="fb" style={{ position: "absolute", top: "55%", right: "20%", fontSize: 52, opacity: 0.09, pointerEvents: "none" }}>🎁</div>
          <div className="fc" style={{ position: "absolute", bottom: "18%", left: "10%", fontSize: 48, opacity: 0.1, pointerEvents: "none" }}>💳</div>

          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", width: "100%" }}>
            <Reveal>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px 6px 8px", borderRadius: 100, background: "rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.12)", marginBottom: 28 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: G, boxShadow: `0 0 8px ${G}` }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,0.6)", letterSpacing: "0.02em" }}>Simple · Fast · Secure</span>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h1 style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)", fontWeight: 800, lineHeight: 1.07, letterSpacing: "-0.05em", marginBottom: 24, maxWidth: 720 }}>
                How Our <span style={{ color: O }}>Platform Works</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", lineHeight: 1.75, color: "rgba(0,0,0,0.55)", maxWidth: 540, marginBottom: 40 }}>
                Learn how to easily sell your gift cards or trade your cryptocurrency and receive payment quickly and securely.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Btn primary href="/signup">Create Account</Btn>
                <Btn href="/signin">Log In</Btn>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 52 }}>
                {[["🎁", "Gift Cards"], ["₿", "Bitcoin"], ["💵", "USDT"], ["🏦", "Bank Payout"], ["🔒", "Secure"]].map(([icon, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 50, padding: "8px 16px" }}>
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,0.5)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ━━━ 2. QUICK OVERVIEW ━━━ */}
        <section style={{ padding: "100px 0", background: "rgba(0,0,0,0.03)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
              <Label>Overview</Label>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.04em" }}>
                Sell Gift Cards or Trade Crypto<br /><span style={{ color: O }}>in Just a Few Steps</span>
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-4" style={{ gap: 20 }}>
              {[
                { step: "01", icon: "👤", title: "Create an Account", desc: "Sign up and create your secure account in minutes. No paperwork, no delays.", accent: Y },
                { step: "02", icon: "📤", title: "Submit Your Transaction", desc: "Choose whether you want to sell a gift card or trade cryptocurrency.", accent: O },
                { step: "03", icon: "🔍", title: "Verification Process", desc: "Our system reviews the transaction to ensure security and accuracy.", accent: G },
                { step: "04", icon: "💰", title: "Receive Your Payment", desc: "Once approved, funds are instantly credited to your wallet.", accent: Y },
              ].map(({ step, icon, title, desc, accent }, i) => (
                <Reveal key={step} delay={i * 90}>
                  <div className="gh" style={{ position: "relative", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "32px 24px", transition: "all 0.35s", height: "100%" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "20px 20px 0 0", background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                    <div className="font-mono" style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.14em", marginBottom: 16 }}>STEP {step}</div>
                    <div style={{ fontSize: 38, marginBottom: 16 }}>{icon}</div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.02em", color: "#fff" }}>{title}</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.75, color: "rgba(255,255,255,0.5)" }}>{desc}</p>
                    {i < 3 && (
                      <div className="hidden lg:block" style={{ position: "absolute", top: "50%", right: -18, transform: "translateY(-50%)", fontSize: 18, color: "rgba(255,255,255,0.2)", zIndex: 1 }}>→</div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ 3. DETAILED STEPS (TABBED) ━━━ */}
        <section id="how-it-works" style={{ padding: "100px 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <Reveal style={{ textAlign: "center", marginBottom: 40 }}>
              <Label>Step-by-Step</Label>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.04em" }}>
                Detailed <span style={{ color: O }}>Process Guide</span>
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 52 }}>
                {[["gift", "🎁", "Gift Cards"], ["crypto", "₿", "Cryptocurrency"]].map(([key, icon, label]) => (
                  <button key={key} onClick={() => setActiveTab(key)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 50, fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.3s", border: activeTab === key ? "none" : "1px solid rgba(0,0,0,0.12)", background: activeTab === key ? "linear-gradient(135deg,#111009,#000)" : "rgba(0,0,0,0.05)", color: activeTab === key ? Y : "rgba(0,0,0,0.5)", boxShadow: activeTab === key ? `0 4px 24px rgba(0,0,0,0.2)` : "none" }}>
                    <span>{icon}</span>{label}
                  </button>
                ))}
              </div>
            </Reveal>

            <div style={{ maxWidth: 800, margin: "0 auto" }}>
              {(activeTab === "gift" ? giftSteps : cryptoSteps).map(({ icon, step, title, desc }, i) => {
                const accent = accentFor(i);
                return (
                  <Reveal key={step} delay={i * 80}>
                    <div style={{ display: "flex", gap: 20, marginBottom: 20, alignItems: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 52 }}>
                        <div style={{ width: 52, height: 52, borderRadius: "50%", background: `rgba(255,255,255,0.05)`, border: `1px solid ${accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{icon}</div>
                        {i < (activeTab === "gift" ? giftSteps : cryptoSteps).length - 1 && (
                          <div style={{ width: 1, flex: 1, minHeight: 24, background: `linear-gradient(rgba(255,255,255,0.2), transparent)`, marginTop: 4 }} />
                        )}
                      </div>
                      <div className="gh" style={{ flex: 1, background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "22px 24px", position: "relative", transition: "all 0.35s" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, borderRadius: "16px 0 0 16px", background: accent }} />
                        <div className="font-mono" style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: "0.14em", marginBottom: 6 }}>STEP {step}</div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.02em", color: "#fff" }}>{title}</h3>
                        <p style={{ fontSize: 13, lineHeight: 1.75, color: "rgba(255,255,255,0.5)" }}>{desc}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ━━━ 4. WALLET & PAYMENTS ━━━ */}
        <section style={{ padding: "100px 0", background: "rgba(0,0,0,0.03)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 64, alignItems: "center" }}>
              {/* wallet visual — keep dark for contrast */}
              <Reveal>
                <div style={{ position: "relative", background: "rgba(14,14,14,0.95)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: 32, boxShadow: "0 32px 80px rgba(0,0,0,0.3)" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "24px 24px 0 0", background: `linear-gradient(90deg, ${G}, transparent)` }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Wallet Balance</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: Y, letterSpacing: "-0.04em", marginBottom: 24 }}>₦ 125,400.00</div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
                    <div style={{ flex: 1, background: `linear-gradient(135deg,${Y},${Y2})`, color: "#000", borderRadius: 10, padding: "10px 0", textAlign: "center", fontSize: 13, fontWeight: 700 }}>Withdraw</div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "10px 0", textAlign: "center", fontSize: 13, fontWeight: 700 }}>History</div>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Recent Transactions</div>
                    {[["Gift Card Sale", "+₦45,000", G], ["BTC Trade", "+₦38,500", Y], ["Withdrawal", "-₦20,000", O]].map(([label, amount, color]) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color }}>{amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <div>
                <Reveal><Label>Wallet & Payments</Label></Reveal>
                <Reveal delay={80}>
                  <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 20 }}>
                    Your <span style={{ color: O }}>Wallet & Payments</span>
                  </h2>
                </Reveal>
                <Reveal delay={140}>
                  <p style={{ fontSize: 15, lineHeight: 1.85, color: "rgba(0,0,0,0.55)", marginBottom: 28 }}>
                    Every user has a secure wallet where transaction payments are credited. Track your balance, view transaction history, and withdraw funds directly to your Nigerian bank account.
                  </p>
                </Reveal>
                {[
                  [G, "💼", "Wallet Balance", "See your current balance at a glance."],
                  ["#000", "📊", "Transaction History", "A full record of every trade you've made."],
                  [O, "🏦", "Bank Withdrawals", "Withdraw directly to any Nigerian bank account."],
                  ["#333", "🔑", "Transaction PIN", "Every withdrawal is protected by your personal PIN."],
                ].map(([color, icon, title, desc], i) => (
                  <Reveal key={title} delay={i * 70}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18 }}>
                      <div style={{ fontSize: 22, minWidth: 32 }}>{icon}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 3 }}>{title}</div>
                        <div style={{ fontSize: 13, color: "rgba(0,0,0,0.5)", lineHeight: 1.6 }}>{desc}</div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ━━━ 5. SECURITY ━━━ */}
        <section style={{ padding: "100px 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <Reveal style={{ textAlign: "center", marginBottom: 52 }}>
              <Label>Security</Label>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.04em" }}>
                Secure and <span style={{ color: G }}>Reliable Transactions</span>
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 20 }}>
              {[
                ["🔐", "Encrypted Transactions", "All data is encrypted end-to-end so your information is always private.", G],
                ["✅", "Secure Authentication", "Multi-layer login protection keeps your account safe.", Y],
                ["🚨", "Fraud Detection", "Automated systems monitor and flag suspicious activity in real time.", O],
                ["👁️", "Manual Verification", "High-value transactions are reviewed by our team before processing.", Y],
                ["🔑", "Transaction PIN", "Every withdrawal requires your personal PIN for authorisation.", G],
                ["🛡️", "Platform Security", "Built on modern security protocols trusted by leading fintech platforms.", Y],
              ].map(([icon, title, desc, accent], i) => (
                <Reveal key={title} delay={i * 70}>
                  <div className="gh" style={{ position: "relative", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "28px 24px", transition: "all 0.35s" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "18px 18px 0 0", background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                    <div style={{ fontSize: 34, marginBottom: 14 }}>{icon}</div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, color: "#fff" }}>{title}</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.75, color: "rgba(255,255,255,0.45)" }}>{desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ 6. WHY CHOOSE US ━━━ */}
        <section style={{ padding: "100px 0", background: "rgba(0,0,0,0.03)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <Reveal style={{ textAlign: "center", marginBottom: 52 }}>
              <Label>Why Choose Us</Label>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.04em" }}>
                Why Users Choose <span style={{ color: O }}>NairaNexus</span>
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-5" style={{ gap: 16 }}>
              {[
                ["⚡", "Fast Payments", "Get paid within minutes of every confirmed trade.", Y],
                ["💰", "Competitive Rates", "Best market rates updated in real time.", O],
                ["🔒", "Secure Platform", "Advanced encryption on every transaction.", G],
                ["📊", "Transparent", "No hidden charges — see every detail clearly.", Y],
                ["📱", "Easy Dashboard", "Clean, intuitive interface built for everyone.", Y],
              ].map(([icon, title, desc, color], i) => (
                <Reveal key={title} delay={i * 70}>
                  <div className="gh" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "28px 20px", textAlign: "center", transition: "all 0.35s", position: "relative" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "18px 18px 0 0", background: `linear-gradient(90deg, ${color}, transparent)` }} />
                    <div style={{ fontSize: 34, marginBottom: 14 }}>{icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.01em", color: "#fff" }}>{title}</div>
                    <div style={{ fontSize: 12, lineHeight: 1.7, color: "rgba(255,255,255,0.45)" }}>{desc}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ 7. CTA ━━━ */}
        <section style={{ padding: "100px 0" }}>
          <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 28px", textAlign: "center" }}>
            <Reveal>
              <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 100, background: G, border: "1px solid rgba(0,0,0,0.08)", fontSize: 12, fontWeight: 700, color: "#000", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24 }}>Start Now</div>
            </Reveal>
            <Reveal delay={80}>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.05em", marginBottom: 20 }}>
                Ready to Start <span style={{ color: O }}>Trading?</span>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(0,0,0,0.55)", marginBottom: 40 }}>
                Create your account today and start selling your gift cards or cryptocurrency quickly and securely.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Btn primary href="/signup">Create Account</Btn>
                <Btn href="/signin">Log In</Btn>
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
