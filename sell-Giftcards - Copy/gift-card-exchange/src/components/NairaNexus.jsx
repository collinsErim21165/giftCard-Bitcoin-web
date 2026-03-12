import { useState, useEffect, useRef } from "react";

import LOGO from "../assets/NairaNexus.png";
const Y = "#FFF078";
const Y2 = "#FFE03A";
const O = "#FF8A2B";
const G = "#00E87B";
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

const Badge = ({ children }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px 6px 8px", borderRadius: 100, background: "rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.12)" }}>
    <div style={{ width: 8, height: 8, borderRadius: "50%", background: G, boxShadow: `0 0 8px ${G}` }} />
    <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,0.6)", letterSpacing: "0.02em" }}>{children}</span>
  </div>
);

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

export default function NairaNexus() {
  const [tab, setTab] = useState("gift");
  const [navSolid, setNavSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (

    <div style={{ background: BG, backgroundAttachment: "fixed", color: "#111", minHeight: "100vh", fontFamily: "'Manrope', system-ui, sans-serif", overflowX: "hidden", position: "relative" }}>
      {/* Grid Overlay */}
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
        @keyframes float-a{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-20px) rotate(-2deg)}}
        @keyframes float-b{0%,100%{transform:translateY(0) rotate(4deg)}50%{transform:translateY(-16px) rotate(7deg)}}
        @keyframes float-c{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}
        @keyframes orbit{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:0.3}100%{transform:scale(2.5);opacity:0}}
        .fa{animation:float-a 7s ease-in-out infinite}
        .fb{animation:float-b 6s ease-in-out infinite}
        .fc{animation:float-c 5s ease-in-out infinite}
        .orb{animation:orbit 30s linear infinite}
        .orb-r{animation:orbit 40s linear infinite reverse}
        .ticker{animation:ticker 40s linear infinite}
        .font-mono{font-family:'JetBrains Mono',monospace}
        .gh:hover{background:#161616!important;border-color:rgba(255,255,255,0.1)!important;transform:translateY(-4px)!important;box-shadow:0 24px 64px rgba(0,0,0,0.5)!important}
        .nh:hover{color:${O}!important}
      `}</style>
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ━━━ NAV ━━━ */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, transition: "all 0.4s", background: navSolid ? "rgba(255,224,0,0.96)" : "transparent", backdropFilter: navSolid ? "blur(24px) saturate(1.5)" : "none", borderBottom: navSolid ? "1px solid rgba(0,0,0,0.08)" : "none" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", height: 88, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href="#" style={{ display: "flex", alignItems: "center" }}><img src={LOGO} alt="NairaNexus" style={{ width: 300, height: "auto" }} /></a>
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
        <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: 80, paddingBottom: 60 }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)", width: "140%", height: "80%", borderRadius: "50%", background: `radial-gradient(ellipse, rgba(0,0,0,0.07) 0%, transparent 65%)`, filter: "blur(60px)" }} />
            <div style={{ position: "absolute", bottom: "-30%", right: "-20%", width: "60%", height: "60%", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,0,0,0.04), transparent 70%)", filter: "blur(40px)" }} />
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }}>
              <defs><pattern id="dg" width="120" height="120" patternUnits="userSpaceOnUse">
                <circle cx="60" cy="60" r="0.7" fill="rgba(0,0,0,0.4)" />
              </pattern></defs>
              <rect width="100%" height="100%" fill="url(#dg)" />
            </svg>
          </div>

          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", width: "100%", position: "relative", zIndex: 2 }}>
            <div style={{ display: "grid", gap: 48, alignItems: "center" }} className="lg:grid-2">
              <div style={{ maxWidth: 560 }}>
                <Reveal><Badge>Sell Gift Cards & Crypto in under few minutes</Badge></Reveal>
                <Reveal delay={100}>
                  <h1 style={{ fontSize: "clamp(2.8rem, 5.8vw, 4.4rem)", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.05em", marginTop: 28, marginBottom: 24 }}>
                    Turn Your{" "}<span style={{ color: "#000" }}>Gift Cards</span>{" "}&amp;{" "}<span style={{ color: O }}>Crypto</span>{" "}Into Instant Cash
                  </h1>
                </Reveal>
                <Reveal delay={180}>
                  <p style={{ fontSize: 17, lineHeight: 1.75, color: "rgba(0,0,0,0.55)", maxWidth: 440, marginBottom: 40 }}>
                    Best rates in Nigeria. Payouts in under 2 minutes. Bank-grade security. No hidden fees.
                  </p>
                </Reveal>
                <Reveal delay={260}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 52 }}>
                    <Btn primary href="/signup">Create Account &rarr;</Btn>
                    <Btn href="/rates">Check Rates</Btn>
                  </div>
                </Reveal>
                <Reveal delay={360}>
                  <div style={{ display: "flex", gap: 48 }}>
                    {[
                      ["\u20A62.4T+", "Traded"],
                      ["50K+", "Users"],
                      ["<90s", "Payouts"],
                    ].map(([v, l]) => (
                      <div key={l}>
                        <div className="font-mono" style={{ fontSize: 22, fontWeight: 700, color: "#000", letterSpacing: "-0.03em" }}>{v}</div>
                        <div style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", marginTop: 4, fontWeight: 500 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>

              {/* Right: Dashboard mockup — stays dark for strong contrast against yellow BG */}
              <Reveal delay={200} className="hidden md:block">
                <div style={{ position: "relative", height: 520, perspective: 1200 }}>
                  <div style={{ position: "absolute", top: 20, left: 0, right: 0, background: "rgba(14,14,14,0.95)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, overflow: "hidden", backdropFilter: "blur(24px)", zIndex: 3, boxShadow: "0 48px 120px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.06)", transform: "rotateY(-2deg) rotateX(1deg)" }}>
                    <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      {["#ef4444", "#eab308", "#22c55e"].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.7 }} />)}
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginLeft: 12, fontWeight: 600, letterSpacing: "0.08em" }}>DASHBOARD</span>
                    </div>
                    <div style={{ padding: "24px 24px 20px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", marginBottom: 6 }}>WALLET BALANCE</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
                        <span className="font-mono" style={{ fontSize: 34, fontWeight: 700, color: Y, letterSpacing: "-0.04em" }}>{"\u20A6"}247,500</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: G, background: `${G}15`, padding: "3px 10px", borderRadius: 8 }}>+12.4%</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 22 }}>
                        {[["Sell Card", `linear-gradient(135deg,${Y},${Y2})`, "#000"], ["Sell Coins", "rgba(255,255,255,0.04)", "rgba(255,255,255,0.6)"], ["Withdraw", "rgba(255,255,255,0.04)", "rgba(255,255,255,0.6)"]].map(([l, bg, c]) => (
                          <div key={l} style={{ padding: "10px 0", borderRadius: 10, background: bg, color: c, fontSize: 11, fontWeight: 700, textAlign: "center", border: bg.includes("gradient") ? "none" : "1px solid rgba(255,255,255,0.04)" }}>{l}</div>
                        ))}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em", marginBottom: 10 }}>RECENT</div>
                      {[
                        { icon: "A", bg: "linear-gradient(135deg,#FF9900,#E67E00)", name: "Amazon Gift Card", time: "2m ago", amt: "+\u20A645,000", color: G },
                        { icon: "\u20BF", bg: "linear-gradient(135deg,#f7931a,#d97706)", name: "BTC Sell", time: "15m ago", amt: "+\u20A6120,000", color: G },
                        { icon: "\u2193", bg: "linear-gradient(135deg,#3b82f6,#2563eb)", name: "Withdrawal", time: "1h ago", amt: "-\u20A650,000", color: "#f87171" },
                      ].map((tx, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, background: tx.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>{tx.icon}</div>
                            <div><div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{tx.name}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{tx.time}</div></div>
                          </div>
                          <span className="font-mono" style={{ fontSize: 12, fontWeight: 700, color: tx.color }}>{tx.amt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Floating elements */}
                  <div className="fa" style={{ position: "absolute", top: -16, left: -24, zIndex: 5, width: 100, height: 62, borderRadius: 14, background: "linear-gradient(135deg,#FF9900,#E67E00)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 48px rgba(255,153,0,0.25)" }}>
                    <span style={{ fontSize: 20, color: "#fff", fontWeight: 800 }}>A</span>
                    <span style={{ fontSize: 7, color: "rgba(255,255,255,0.7)", fontWeight: 700, letterSpacing: "0.08em", marginTop: 1 }}>AMAZON</span>
                  </div>
                  <div className="fb" style={{ position: "absolute", top: -8, right: -16, zIndex: 5, width: 88, height: 56, borderRadius: 12, background: "linear-gradient(135deg,#444,#1a1a1a)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 16px 48px rgba(0,0,0,0.4)" }}>
                    <span style={{ fontSize: 18, color: "#fff" }}>{"\uF8FF"}</span>
                    <span style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "0.08em", marginTop: 1 }}>APPLE</span>
                  </div>
                  <div className="fc" style={{ position: "absolute", bottom: 30, left: -30, zIndex: 5, width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#f7931a,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 700, boxShadow: "0 12px 36px rgba(247,147,26,0.3)" }}>{"\u20BF"}</div>
                  <div className="fa" style={{ position: "absolute", bottom: 10, right: -12, zIndex: 5, width: 80, height: 52, borderRadius: 10, background: "linear-gradient(135deg,#1B2838,#2a475e)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 36px rgba(0,0,0,0.3)" }}>
                    <span style={{ fontSize: 16, color: "#fff", fontWeight: 700 }}>S</span>
                    <span style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.06em" }}>STEAM</span>
                  </div>
                  <div className="fb" style={{ position: "absolute", bottom: 60, right: 40, zIndex: 5, width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#26a17b,#1a8a68)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 700, boxShadow: "0 10px 30px rgba(38,161,123,0.25)" }}>T</div>
                </div>
              </Reveal>
            </div>
          </div>
          <style>{`@media(min-width:1024px){.lg\\:grid-2{grid-template-columns:1fr 1fr!important}}`}</style>
        </section>

        {/* ━━━ Ticker ━━━ */}
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "14px 0", overflow: "hidden" }}>
          <div className="ticker" style={{ display: "flex", gap: 48, width: "max-content" }}>
            {[...Array(2)].flatMap((_, j) => ["Amazon", "Apple", "Steam", "Google Play", "Bitcoin", "USDT", "Ethereum", "iTunes", "Nordstrom", "Sephora"].map((t, i) => (
              <span key={`${j}-${i}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, color: "rgba(0,0,0,0.3)", whiteSpace: "nowrap" }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#000", opacity: 0.25 }} />{t}
              </span>
            )))}
          </div>
        </div>

        {/* ━━━ 2. TRUST ━━━ */}
        <section style={{ padding: "56px 0", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "rgba(0,0,0,0.02)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 20 }}>
              {[
                ["\uD83D\uDD12", "Bank-Grade Security", "AES-256 encryption"],
                ["\u26A1", "Instant Payouts", "<2 min average"],
                ["\uD83D\uDCCA", "Best Rates", "Updated live"],
                ["\u2705", "Verified Platform", "50K+ users trust us"],
              ].map(([ico, t, s], i) => (
                <Reveal key={i} delay={i * 60}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 18px", borderRadius: 16, background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.3s" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{ico}</div>
                    <div><div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{t}</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{s}</div></div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ 3. HOW IT WORKS ━━━ */}
        <section id="how-it-works" style={{ padding: "100px 0", position: "relative", overflow: "hidden", background: "rgba(0,0,0,0.04)" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 60% at 15% 50%, rgba(0,232,123,0.06) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 85% 20%, rgba(0,0,0,0.03) 0%, transparent 60%)" }} />
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 52 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#000", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>HOW IT WORKS</div>
                <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.04em" }}>How It Works. <span style={{ color: O }}>Simply.</span></h2>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
                <div style={{ display: "inline-flex", borderRadius: 14, padding: 4, background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.1)" }}>
                  {[["gift", "\uD83C\uDF81 Gift Cards"], ["crypto", "\u20BF Crypto"]].map(([id, label]) => (
                    <button key={id} onClick={() => setTab(id)} style={{ padding: "12px 32px", borderRadius: 10, border: "none", background: tab === id ? "linear-gradient(135deg,#111009,#000)" : "transparent", color: tab === id ? Y : "rgba(0,0,0,0.45)", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.35s", fontFamily: "inherit" }}>{label}</button>
                  ))}
                </div>
              </div>
            </Reveal>
            <div className="grid sm:grid-cols-3" style={{ gap: 16, maxWidth: 940, margin: "0 auto" }}>
              {(tab === "gift" ? [
                ["Select Card", "Choose from Amazon, Apple, Steam, Google Play & 20+ brands.", "\uD83C\uDF81", Y],
                ["Upload & Verify", "Enter card value, code, and snap a photo. We verify fast.", "\uD83D\uDCF7", O],
                ["Get Paid", "Wallet credited in under 2 minutes. Withdraw to any bank.", "\uD83D\uDCB0", G],
              ] : [
                ["Select Coin", "BTC, USDT, ETH or any supported cryptocurrency.", "\u20BF", Y],
                ["Send Crypto", "Transfer to your unique secure deposit address.", "\uD83D\uDD10", O],
                ["Enter Amount", "Go to the sell page and input the amount you are selling.", "\uD83D\uDCDD", Y],
                ["Receive Naira", "Funds hit your wallet or bank in minutes.", "\uD83C\uDFE6", G],
              ]).map(([title, desc, icon, accent], i) => (
                <Reveal key={`${tab}-${i}`} delay={i * 100}>
                  <div className="gh" style={{ padding: 32, borderRadius: 20, background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.4s", cursor: "default", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                    <div style={{ fontSize: 40, marginBottom: 20, color: "rgba(255,255,255,0.8)" }}>{icon}</div>
                    <div className="font-mono" style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.12em", marginBottom: 10 }}>STEP 0{i + 1}</div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.02em", color: "#fff" }}>{title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.5)" }}>{desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ 4. FEATURES ━━━ */}
        <section id="features" style={{ padding: "100px 0", background: "rgba(0,0,0,0.03)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <Reveal>
              <div style={{ marginBottom: 52 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#000", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>FEATURES</div>
                <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 12 }}>Why <span style={{ color: O }}>NairaNexus?</span></h2>
                <p style={{ fontSize: 16, color: "rgba(0,0,0,0.5)", maxWidth: 420, lineHeight: 1.7 }}>Everything you need to trade with confidence.</p>
              </div>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 14 }}>
              {[
                ["\uD83D\uDCB0", "Competitive Rates", "Consistently the best gift card & crypto rates in Nigeria."],
                ["\uD83D\uDD10", "Secure Transactions", "Bank-grade encryption on every trade and withdrawal."],
                ["\uD83C\uDFE6", "Easy Withdrawals", "Send earnings to any Nigerian bank account instantly."],
                ["\uD83D\uDCDC", "Transaction History", "Full transparent record of every trade and deposit."],
                ["\uD83D\uDCF1", "Mobile Dashboard", "Trade on the go. Works flawlessly on any device."],
                ["\uD83D\uDD22", "PIN Protection", "Every withdrawal secured by your personal PIN."],
              ].map(([ico, t, d], i) => (
                <Reveal key={i} delay={i * 60}>
                  <div className="gh" style={{ padding: "28px 24px", borderRadius: 18, background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.4s", cursor: "default" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 18 }}>{ico}</div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.01em", color: "#fff" }}>{t}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.5)" }}>{d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ 5. RATES ━━━ */}
        <section id="rates" style={{ padding: "100px 0", position: "relative", overflow: "hidden", background: "rgba(255,138,43,0.07)" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 50% at 90% 50%, rgba(0,0,0,0.05) 0%, transparent 60%), radial-gradient(ellipse 45% 35% at 10% 80%, rgba(0,0,0,0.04) 0%, transparent 55%)" }} />
          <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 28px" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#000", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>RATES</div>
                <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 10 }}>Today's <span style={{ color: O }}>Rates</span></h2>
                <p style={{ fontSize: 15, color: "rgba(0,0,0,0.5)", lineHeight: 1.7 }}>No hidden charges. What you see is what you get.</p>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div style={{ borderRadius: 20, background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.35)" }}>
                <div style={{ padding: "12px 24px", display: "grid", gridTemplateColumns: "1fr auto", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>ASSET</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>RATE</span>
                </div>
                {[
                  { n: "Amazon (USA)", t: "Gift Card", r: "\u20A6580/$1", badge: "HOT", bc: "#ef444420", btc: "#ef4444" },
                  { n: "Apple", t: "Gift Card", r: "\u20A6550/$1" },
                  { n: "Steam", t: "Gift Card", r: "\u20A6520/$1" },
                  { n: "Google Play", t: "Gift Card", r: "\u20A6480/$1" },
                  { n: "Bitcoin (BTC)", t: "Crypto", r: "\u20A6142.5M/BTC", badge: "LIVE", bc: `${G}22`, btc: G },
                  { n: "USDT (Tether)", t: "Crypto", r: "\u20A61,580/USDT", badge: "LIVE", bc: `${G}22`, btc: G },
                ].map((r, i, a) => (
                  <div key={i} style={{ padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < a.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: r.t === "Crypto" ? "rgba(255,138,43,0.15)" : "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: r.t === "Crypto" ? O : "rgba(255,255,255,0.7)" }}>{r.t === "Crypto" ? "\u20BF" : "GC"}</div>
                      <div><div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{r.n}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{r.t}</div></div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="font-mono" style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{r.r}</span>
                      {r.badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: r.bc, color: r.btc }}>{r.badge}</span>}
                    </div>
                  </div>
                ))}
                <div style={{ padding: "14px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <a href="/rates" style={{ fontSize: 13, fontWeight: 700, color: Y, textDecoration: "none" }}>View All Rates &rarr;</a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ━━━ 6. SECURITY ━━━ */}
        <section id="security" style={{ padding: "100px 0", position: "relative", overflow: "hidden", background: "rgba(0,150,200,0.04)" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 65% 55% at 5% 30%, rgba(0,210,255,0.04) 0%, transparent 60%), radial-gradient(ellipse 50% 45% at 95% 70%, rgba(0,0,0,0.04) 0%, transparent 55%)" }} />
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <div className="grid lg:grid-cols-2" style={{ gap: 56, alignItems: "center" }}>
              <div>
                <Reveal>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#000", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>SECURITY</div>
                  <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 20 }}>Your Money.<br /><span style={{ color: O }}>Your Safety.</span></h2>
                  <p style={{ fontSize: 16, color: "rgba(0,0,0,0.5)", lineHeight: 1.7, marginBottom: 36, maxWidth: 400 }}>Multiple layers of defense protect every transaction you make.</p>
                </Reveal>
                {[
                  ["\uD83D\uDD10", "End-to-End Encryption", "AES-256 encryption for all data in transit and at rest."],
                  ["\uD83D\uDD22", "Transaction PIN", "Every withdrawal requires your personal authorization PIN."],
                  ["\uD83D\uDEE1\uFE0F", "Fraud Detection", "AI monitoring flags suspicious activity in real time."],
                  ["\u2705", "Manual Verification", "High-value trades verified by our security team."],
                ].map(([ico, t, d], i) => (
                  <Reveal key={i} delay={i * 70}>
                    <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.09)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{ico}</div>
                      <div><div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{t}</div><div style={{ fontSize: 14, color: "rgba(0,0,0,0.5)", lineHeight: 1.6 }}>{d}</div></div>
                    </div>
                  </Reveal>
                ))}
              </div>
              <Reveal delay={120} className="hidden lg:flex" style={{ justifyContent: "center" }}>
                <div style={{ position: "relative", width: 300, height: 300 }}>
                  <div className="orb" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.12)" }} />
                  <div className="orb-r" style={{ position: "absolute", inset: 40, borderRadius: "50%", border: "1px dashed rgba(0,0,0,0.08)" }} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 76, height: 76, borderRadius: "50%", background: "rgba(0,0,0,0.07)", boxShadow: `0 0 60px rgba(0,0,0,0.08)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>{"\uD83D\uDD12"}</div>
                  </div>
                  {[0, 72, 144, 216, 288].map((deg, i) => (
                    <div key={i} style={{ position: "absolute", top: "50%", left: "50%", transform: `rotate(${deg}deg) translateY(-130px)`, marginTop: -14, marginLeft: -14 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, transform: `rotate(-${deg}deg)` }}>
                        {["\uD83D\uDD10", "\uD83D\uDEE1\uFE0F", "\u2705", "\uD83D\uDD22", "\u26A1"][i]}
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ━━━ 7. TESTIMONIALS ━━━ */}
        <section style={{ padding: "100px 0", position: "relative", overflow: "hidden", background: "rgba(0,0,0,0.04)" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 75% 50% at 50% 100%, rgba(0,0,0,0.04) 0%, transparent 65%)" }} />
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#000", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>REVIEWS</div>
                <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.04em" }}>Loved by <span style={{ color: O }}>Traders</span></h2>
              </div>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 14 }}>
              {[
                ["Fastest payment ever. Sold my Amazon card and got paid in 90 seconds flat!", "Adebayo T.", "Lagos"],
                ["Rates are better than anywhere else. NairaNexus is now my daily driver.", "Chidinma O.", "Abuja"],
                ["Super reliable and secure. Been using it for months with zero issues.", "Emeka N.", "Port Harcourt"],
                ["Sent BTC and had Naira in my bank within 3 minutes. Incredible.", "Fatima A.", "Kano"],
              ].map(([text, name, city], i) => (
                <Reveal key={i} delay={i * 70}>
                  <div className="gh" style={{ padding: 24, borderRadius: 18, background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", height: "100%", transition: "all 0.4s", cursor: "default" }}>
                    <div style={{ color: O, fontSize: 12, letterSpacing: 2, marginBottom: 14 }}>{"\u2605\u2605\u2605\u2605\u2605"}</div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.6)", flex: 1, marginBottom: 20 }}>"{text}"</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,#333,#555)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: Y }}>{name[0]}</div>
                      <div><div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{name}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{city}</div></div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ 8. CTA ━━━ */}
        <section style={{ padding: "100px 28px" }}>
          <Reveal>
            <div style={{ maxWidth: 840, margin: "0 auto", textAlign: "center", padding: "72px 28px", borderRadius: 28, background: `linear-gradient(135deg, #111009, #000)`, position: "relative", overflow: "hidden", boxShadow: "0 48px 120px rgba(0,0,0,0.3)" }}>
              <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,240,56,0.15), transparent 70%)`, pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,138,43,0.1), transparent 70%)`, pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 2 }}>
                <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 800, color: Y, letterSpacing: "-0.04em", lineHeight: 1.15, marginBottom: 14 }}>Ready to Sell Gift Cards<br />or Trade Crypto?</h2>
                <p style={{ fontSize: 15, color: "rgba(255,240,120,0.6)", maxWidth: 380, margin: "0 auto 32px", lineHeight: 1.7 }}>Join thousands of Nigerians earning instantly. Free account in 60 seconds.</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                  <a href="/signup" style={{ padding: "16px 36px", borderRadius: 14, background: Y, color: "#000", fontWeight: 800, fontSize: 14, textDecoration: "none", boxShadow: `0 4px 20px rgba(255,240,56,0.3)`, transition: "all 0.3s" }}>Create Free Account &rarr;</a>
                  <a href="/rates" style={{ padding: "16px 28px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Check Rates</a>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ━━━ 9. FOOTER ━━━ */}
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
