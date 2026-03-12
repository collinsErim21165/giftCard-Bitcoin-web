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
    background: primary ? "linear-gradient(135deg, #111009, #000)" : "rgba(0,0,0,0.06)",
    color: primary ? Y : "rgba(0,0,0,0.6)",
    border: primary ? "none" : "1px solid rgba(0,0,0,0.09)",
    boxShadow: primary ? "0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)" : "none",
    ...s,
  }}>{children}</a>
);

const Label = ({ children }) => (
  <div style={{ fontSize: 12, fontWeight: 700, color: "#000", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>{children}</div>
);

const giftCards = [
  { name: "Amazon", country: "USA 🇺🇸", rate: "₦1,550", per: "/ $1", icon: "🛒" },
  { name: "Apple / iTunes", country: "USA 🇺🇸", rate: "₦1,480", per: "/ $1", icon: "🍎" },
  { name: "Steam", country: "USA 🇺🇸", rate: "₦1,420", per: "/ $1", icon: "🎮" },
  { name: "Google Play", country: "USA 🇺🇸", rate: "₦1,390", per: "/ $1", icon: "▶️" },
  { name: "Vanilla", country: "USA 🇺🇸", rate: "₦1,350", per: "/ $1", icon: "💳" },
  { name: "Nordstrom", country: "USA 🇺🇸", rate: "₦1,300", per: "/ $1", icon: "🏬" },
];

const cryptoRates = [
  { name: "Bitcoin", symbol: "BTC", icon: "₿", desc: "Market Rate", color: O },
  { name: "Tether", symbol: "USDT", icon: "💵", desc: "Market Rate", color: G },
];

export default function Rates() {
  const [navSolid, setNavSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [calcType, setCalcType] = useState("Amazon");
  const [calcValue, setCalcValue] = useState("");

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

  const rateMap = { Amazon: 1550, "Apple / iTunes": 1480, Steam: 1420, "Google Play": 1390, Vanilla: 1350, Nordstrom: 1300 };
  const estimatedPayout = calcValue && rateMap[calcType] ? (parseFloat(calcValue) * rateMap[calcType]).toLocaleString("en-NG") : null;

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
        .font-mono{font-family:'JetBrains Mono',monospace}
        .gh:hover{background:#161616!important;border-color:rgba(255,255,255,0.1)!important;transform:translateY(-4px)!important;box-shadow:0 24px 64px rgba(0,0,0,0.5)!important}
        .nh:hover{color:${O}!important}
        .rrow:hover{background:rgba(0,0,0,0.06)!important}
        .inp{background:rgba(0,0,0,0.06);border:1px solid rgba(0,0,0,0.1);border-radius:12px;padding:13px 16px;color:#111;font-size:14px;font-family:'Manrope',sans-serif;outline:none;transition:border-color 0.25s;width:100%}
        .inp:focus{border-color:rgba(0,0,0,0.3)!important;background:rgba(0,0,0,0.1)!important}
        @keyframes float-a{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        .fa{animation:float-a 6s ease-in-out infinite}
        .fb{animation:float-a 8s ease-in-out infinite 2s}
        @keyframes pulse-dot{0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.2)}}
        .pdot{animation:pulse-dot 2s ease-in-out infinite}
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

        {/* ━━━ 1. HERO ━━━ */}
        <section style={{ minHeight: "55vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: 140, paddingBottom: 80 }}>
          <div style={{ position: "absolute", top: "5%", left: "5%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,0,0,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div className="fa" style={{ position: "absolute", top: "20%", right: "8%", fontSize: 64, opacity: 0.13, pointerEvents: "none" }}>₦</div>
          <div className="fb" style={{ position: "absolute", bottom: "20%", right: "18%", fontSize: 52, opacity: 0.1, pointerEvents: "none" }}>₿</div>

          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", width: "100%" }}>
            <Reveal>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px 6px 8px", borderRadius: 100, background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.09)", marginBottom: 28 }}>
                <div className="pdot" style={{ width: 8, height: 8, borderRadius: "50%", background: G, boxShadow: `0 0 8px ${G}` }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,0.6)", letterSpacing: "0.02em" }}>Rates updated regularly</span>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h1 style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)", fontWeight: 800, lineHeight: 1.07, letterSpacing: "-0.05em", marginBottom: 24, maxWidth: 700 }}>
                Current <span style={{ color: O }}>Trading Rates</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p style={{ fontSize: "clamp(1rem, 1.8vw, 1.15rem)", lineHeight: 1.75, color: "rgba(0,0,0,0.55)", maxWidth: 540, marginBottom: 36 }}>
                We offer competitive market rates to ensure you receive the best value when trading your digital assets.
              </p>
            </Reveal>
            <Reveal delay={280}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Btn primary href="/signup">Start Trading</Btn>
                <Btn href="/how-it-works">How It Works</Btn>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ━━━ 2. GIFT CARD RATES ━━━ */}
        <section style={{ padding: "80px 0", background: "rgba(0,0,0,0.03)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <Reveal style={{ marginBottom: 40 }}>
              <Label>Gift Cards</Label>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.04em" }}>
                Gift Card <span style={{ color: O }}>Rates</span>
              </h2>
              <p style={{ fontSize: 14, color: "rgba(0,0,0,0.5)", marginTop: 10, maxWidth: 480 }}>
                Estimated payout rates per dollar value. Final rate shown at checkout inside your dashboard.
              </p>
            </Reveal>

            {/* table */}
            <Reveal delay={80}>
              <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
                {/* header */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr", padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)" }}>
                  {["Gift Card", "Country", "Est. Rate", "Action"].map(h => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</div>
                  ))}
                </div>
                {giftCards.map(({ name, country, rate, per, icon }, i) => (
                  <div key={name} className="rrow" style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr 1fr", padding: "18px 24px", borderBottom: i < giftCards.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.2s", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{name}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{country}</div>
                    <div>
                      <span style={{ fontSize: 15, fontWeight: 800, color: G }}>{rate}</span>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>{per}</span>
                    </div>
                    <a href="/signup" style={{ fontSize: 12, fontWeight: 700, color: Y, textDecoration: "none", padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", display: "inline-block", transition: "all 0.2s" }}>Sell Now</a>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ━━━ 3. CRYPTO RATES ━━━ */}
        <section style={{ padding: "80px 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <Reveal style={{ marginBottom: 40 }}>
              <Label>Cryptocurrency</Label>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.04em" }}>
                Cryptocurrency <span style={{ color: O }}>Rates</span>
              </h2>
              <p style={{ fontSize: 14, color: "rgba(0,0,0,0.5)", marginTop: 10, maxWidth: 500 }}>
                Crypto rates follow current market prices. The final conversion value is displayed before you complete your transaction.
              </p>
            </Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 20 }}>
              {cryptoRates.map(({ name, symbol, icon, desc, color }, i) => (
                <Reveal key={name} delay={i * 80}>
                  <div className="gh" style={{ position: "relative", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "32px 28px", transition: "all 0.35s", display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "20px 20px 0 0", background: `linear-gradient(90deg, ${color}, transparent)` }} />
                    <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.05)", border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, color: "#fff" }}>{name} <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.35)" }}>({symbol})</span></div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>Rate follows live market price</div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 50, background: `${color}15`, border: `1px solid ${color}30` }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color }}>{desc}</span>
                      </div>
                    </div>
                    <a href="/signup" style={{ fontSize: 12, fontWeight: 700, color: Y, textDecoration: "none", padding: "10px 18px", borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", whiteSpace: "nowrap", transition: "all 0.2s" }}>Sell Now</a>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ 4. CALCULATOR ━━━ */}
        <section style={{ padding: "80px 0", background: "rgba(0,0,0,0.03)" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 28px" }}>
            <Reveal style={{ textAlign: "center", marginBottom: 40 }}>
              <Label>Calculator</Label>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.04em" }}>
                Estimate Your <span style={{ color: O }}>Payout</span>
              </h2>
              <p style={{ fontSize: 14, color: "rgba(0,0,0,0.5)", marginTop: 10 }}>
                Get an estimated figure before you start your transaction.
              </p>
            </Reveal>
            <Reveal delay={80}>
              <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 24, padding: "36px 32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Select Gift Card</label>
                    <select className="inp" value={calcType} onChange={e => setCalcType(e.target.value)} style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, padding: "13px 16px", color: "#111", fontSize: 14, fontFamily: "'Manrope',sans-serif", outline: "none", width: "100%", cursor: "pointer" }}>
                      {giftCards.map(g => <option key={g.name} value={g.name} style={{ background: "#fff" }}>{g.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Gift Card Value ($)</label>
                    <input type="number" min="1" className="inp" value={calcValue} onChange={e => setCalcValue(e.target.value)} placeholder="e.g. 100" />
                  </div>

                  {estimatedPayout && (
                    <div style={{ background: "rgba(0,232,123,0.06)", border: "1px solid rgba(0,232,123,0.15)", borderRadius: 14, padding: "20px 24px" }}>
                      {[
                        ["Gift Card Value", `$${parseFloat(calcValue).toLocaleString()}`],
                        ["Estimated Rate", `${(rateMap[calcType]).toLocaleString("en-NG")} / $1`],
                        ["Estimated Payout", `₦${estimatedPayout}`],
                      ].map(([label, val], i) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < 2 ? "1px solid rgba(0,232,123,0.08)" : "none" }}>
                          <span style={{ fontSize: 13, color: "rgba(0,0,0,0.5)" }}>{label}</span>
                          <span style={{ fontSize: 14, fontWeight: 800, color: i === 2 ? G : "#111" }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Btn primary href="/signup" style={{ width: "100%", marginTop: 4 }}>Start Transaction →</Btn>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ━━━ 5. DISCLAIMER ━━━ */}
        <section style={{ padding: "60px 0" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 28px" }}>
            <Reveal>
              <div style={{ background: "rgba(255,130,20,0.05)", border: "1px solid rgba(255,130,20,0.15)", borderRadius: 18, padding: "28px 32px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>⚠️</div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: O, marginBottom: 8 }}>Rate Disclaimer</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(0,0,0,0.55)" }}>
                    Rates displayed on this page are <strong style={{ color: "rgba(0,0,0,0.8)" }}>estimates only</strong> and may change based on market conditions, card type, and transaction volume. The <strong style={{ color: "rgba(0,0,0,0.8)" }}>final rate will be shown during the transaction process</strong> inside your user dashboard before you confirm.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ━━━ 6. WHY CHOOSE US ━━━ */}
        <section style={{ padding: "80px 0", background: "rgba(0,0,0,0.03)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <Reveal style={{ textAlign: "center", marginBottom: 48 }}>
              <Label>Why Choose Us</Label>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.04em" }}>
                Why Our <span style={{ color: O }}>Rates Stand Out</span>
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-5" style={{ gap: 16 }}>
              {[
                ["💰", "Competitive Rates", "Consistently among the best in Nigeria.", Y],
                ["⚡", "Fast Processing", "Transactions completed in minutes.", O],
                ["🔒", "Secure Trading", "End-to-end encrypted and protected.", G],
                ["📊", "Transparent", "See every rate clearly before confirming.", Y],
                ["📱", "Easy Dashboard", "Simple to use, even for beginners.", Y],
              ].map(([icon, title, desc, color], i) => (
                <Reveal key={title} delay={i * 70}>
                  <div className="gh" style={{ position: "relative", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "28px 20px", textAlign: "center", transition: "all 0.35s" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "18px 18px 0 0", background: `linear-gradient(90deg, ${color}, transparent)` }} />
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6, color: "#fff" }}>{title}</div>
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
                Start Trading <span style={{ color: O }}>Today</span>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(0,0,0,0.55)", marginBottom: 40 }}>
                Create an account and start selling your gift cards or trading cryptocurrency with fast and secure payouts.
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
