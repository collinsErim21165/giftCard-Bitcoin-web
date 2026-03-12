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

const Label = ({ children }) => (
  <div style={{ fontSize: 12, fontWeight: 700, color: "#000", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 12 }}>{children}</div>
);

const Card = ({ icon, title, desc, accent = Y, delay = 0 }) => (
  <Reveal delay={delay}>
    <div className="gh" style={{ position: "relative", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "32px 28px", transition: "all 0.35s" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "20px 20px 0 0", background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      <div style={{ fontSize: 36, marginBottom: 16, color: "rgba(255,255,255,0.8)" }}>{icon}</div>
      <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.02em", color: "#fff" }}>{title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.5)" }}>{desc}</p>
    </div>
  </Reveal>
);

export default function AboutUs() {
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
        <section style={{ minHeight: "70vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", paddingTop: 140, paddingBottom: 80 }}>
          <div style={{ position: "absolute", top: "10%", left: "8%", width: 420, height: 420, borderRadius: "50%", background: `radial-gradient(circle, rgba(0,0,0,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "6%", width: 320, height: 320, borderRadius: "50%", background: `radial-gradient(circle, rgba(0,232,123,0.06) 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div className="fa" style={{ position: "absolute", top: "18%", right: "10%", fontSize: 64, opacity: 0.12, pointerEvents: "none" }}>₿</div>
          <div className="fb" style={{ position: "absolute", top: "50%", right: "18%", fontSize: 48, opacity: 0.09, pointerEvents: "none" }}>🎁</div>
          <div className="fc" style={{ position: "absolute", bottom: "20%", left: "12%", fontSize: 52, opacity: 0.1, pointerEvents: "none" }}>🔒</div>

          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", width: "100%" }}>
            <Reveal><Badge>Trusted · Transparent · Fast</Badge></Reveal>
            <Reveal delay={100}>
              <h1 style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)", fontWeight: 800, lineHeight: 1.07, letterSpacing: "-0.05em", marginTop: 28, marginBottom: 24, maxWidth: 740 }}>
                About Our <span style={{ color: O }}>Platform</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", lineHeight: 1.75, color: "rgba(0,0,0,0.55)", maxWidth: 560, marginBottom: 36 }}>
                A trusted platform helping users convert gift cards and crypto into instant cash with speed, security, and transparency.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Btn primary href="/signup">Create Account</Btn>
                <Btn href="/signin">Log In</Btn>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 52 }}>
                {[["50K+", "Active Traders"], ["₦2B+", "Paid Out"], ["99.9%", "Uptime"], ["< 5 min", "Avg Payout"]].map(([n, l]) => (
                  <div key={l} style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 14, padding: "14px 22px" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#000", letterSpacing: "-0.04em" }}>{n}</div>
                    <div style={{ fontSize: 12, color: "rgba(0,0,0,0.45)", marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ━━━ 2. OUR STORY ━━━ */}
        <section id="our-story" style={{ padding: "100px 0", background: "rgba(0,0,0,0.03)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 64, alignItems: "center" }}>
              <div>
                <Reveal><Label>Our Story</Label></Reveal>
                <Reveal delay={80}>
                  <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 24 }}>
                    Built to Solve a <span style={{ color: O }}>Real Problem</span>
                  </h2>
                </Reveal>
                <Reveal delay={160}>
                  <p style={{ fontSize: 15, lineHeight: 1.85, color: "rgba(0,0,0,0.55)", marginBottom: 20 }}>
                    Our platform was built with one simple goal — to make selling gift cards and trading cryptocurrency <strong style={{ color: "rgba(0,0,0,0.8)" }}>fast, secure, and stress-free.</strong>
                  </p>
                </Reveal>
                <Reveal delay={220}>
                  <p style={{ fontSize: 15, lineHeight: 1.85, color: "rgba(0,0,0,0.55)" }}>
                    Many people struggle to find reliable platforms where they can convert their digital assets into cash without delays or unfair rates. We created NairaNexus to solve that problem — providing a transparent and user-friendly marketplace where you can easily sell gift cards and exchange crypto for instant payouts.
                  </p>
                </Reveal>
              </div>

              <Reveal delay={200}>
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 320 }}>
                  <div style={{ width: 240, height: 240, borderRadius: "50%", background: `radial-gradient(circle, rgba(0,0,0,0.07) 0%, transparent 70%)`, position: "absolute" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {[["₿", "Bitcoin", Y], ["💳", "Gift Cards", O], ["🔒", "Secure", G], ["⚡", "Instant", Y]].map(([icon, label, color]) => (
                      <div key={label} style={{ background: "#0a0a0a", border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 16, padding: "22px 20px", textAlign: "center" }}>
                        <div style={{ fontSize: 32, marginBottom: 8, color: "rgba(255,255,255,0.8)" }}>{icon}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: color, letterSpacing: "0.04em" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ━━━ 3. MISSION ━━━ */}
        <section id="mission" style={{ padding: "100px 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <Reveal style={{ textAlign: "center", marginBottom: 52 }}>
              <Label>Our Mission</Label>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.04em" }}>
                What Drives <span style={{ color: O }}>Everything We Do</span>
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 32, marginBottom: 40 }}>
              <Reveal delay={0}>
                <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "40px 36px", position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "20px 20px 0 0", background: `linear-gradient(90deg, ${Y}, transparent)` }} />
                  <div style={{ fontSize: 40, marginBottom: 20 }}>🎯</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14, letterSpacing: "-0.02em", color: "#fff" }}>Our Mission</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.85, color: "rgba(255,255,255,0.5)" }}>
                    Our mission is to provide a <strong style={{ color: "rgba(255,255,255,0.85)" }}>fast, secure, and reliable</strong> financial platform that empowers users to convert digital assets into cash with ease. We aim to simplify the process of selling gift cards and trading cryptocurrency while offering competitive rates and a seamless experience for every user.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "40px 36px", position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "20px 20px 0 0", background: `linear-gradient(90deg, ${G}, transparent)` }} />
                  <div style={{ fontSize: 40, marginBottom: 20 }}>🌍</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14, letterSpacing: "-0.02em", color: "#fff" }}>Our Vision</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.85, color: "rgba(255,255,255,0.5)" }}>
                    Our vision is to become one of the most trusted digital asset trading platforms, connecting users globally and making digital finance <strong style={{ color: "rgba(255,255,255,0.85)" }}>accessible to everyone.</strong> We strive to build a platform where users from different countries can confidently trade gift cards and cryptocurrency in a secure environment.
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 16 }}>
              {[["⚡", "Speed", "Instant payouts, no unnecessary delays.", O], ["🔒", "Security", "Your assets are always protected.", G], ["✦", "Simplicity", "Clean, intuitive experience.", Y], ["📊", "Reliability", "Consistent rates and uptime.", Y]].map(([icon, title, desc, color], i) => (
                <Reveal key={title} delay={i * 80}>
                  <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "24px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: 30, marginBottom: 12, color: "rgba(255,255,255,0.8)" }}>{icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: color, marginBottom: 8 }}>{title}</div>
                    <div style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.4)" }}>{desc}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ 4. WHAT WE OFFER ━━━ */}
        <section id="what-we-offer" style={{ padding: "100px 0", background: "rgba(0,0,0,0.03)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <Reveal style={{ textAlign: "center", marginBottom: 52 }}>
              <Label>What We Offer</Label>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.04em" }}>
                Everything You Need <span style={{ color: O }}>In One Place</span>
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 24 }}>
              <Card icon="🎁" title="Sell Gift Cards" desc="Easily sell different types of gift cards — Amazon, iTunes, Steam, Google Play and more — and receive instant payments directly to your wallet." accent={Y} delay={0} />
              <Card icon="₿" title="Crypto Trading" desc="Trade supported cryptocurrencies such as Bitcoin and USDT at competitive market rates with transparent pricing and no hidden fees." accent={O} delay={80} />
              <Card icon="💼" title="Secure Wallet" desc="Each user has a dedicated wallet where all transactions are recorded, managed, and visible in real time." accent={G} delay={160} />
              <Card icon="🏦" title="Easy Withdrawals" desc="Withdraw your funds directly to any Nigerian bank account quickly and without complications." accent={Y} delay={0} />
              <Card icon="📊" title="Transaction History" desc="Monitor every transaction through a detailed history dashboard. Full transparency at every step." accent={Y} delay={80} />
              <Card icon="🔔" title="Real-Time Updates" desc="Get instant status updates on every trade or gift card submission so you always know where your money is." accent={G} delay={160} />
            </div>
          </div>
        </section>

        {/* ━━━ 5. SECURITY ━━━ */}
        <section id="security" style={{ padding: "100px 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 64, alignItems: "center" }}>

              <Reveal>
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 340 }}>
                  <div style={{ width: 220, height: 220, borderRadius: "50%", border: `1px solid rgba(0,232,123,0.2)`, position: "absolute", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 160, height: 160, borderRadius: "50%", border: `1px solid rgba(0,232,123,0.3)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle, rgba(0,232,123,0.15) 0%, transparent 70%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>🛡️</div>
                    </div>
                  </div>
                  {[0, 72, 144, 216, 288].map((deg, i) => (
                    <div key={i} style={{ position: "absolute", width: "100%", height: "100%", transform: `rotate(${deg}deg)` }}>
                      <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 10, height: 10, borderRadius: "50%", background: G, boxShadow: `0 0 10px ${G}`, opacity: 0.7 }} />
                    </div>
                  ))}
                </div>
              </Reveal>

              <div>
                <Reveal><Label>Security</Label></Reveal>
                <Reveal delay={80}>
                  <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 20 }}>
                    Security You Can <span style={{ color: G }}>Trust</span>
                  </h2>
                </Reveal>
                <Reveal delay={140}>
                  <p style={{ fontSize: 15, lineHeight: 1.85, color: "rgba(0,0,0,0.55)", marginBottom: 28 }}>
                    Security is a top priority for us. Our platform uses modern security protocols and verification systems to ensure that all transactions are safe and protected.
                  </p>
                </Reveal>
                {[
                  ["🔐", "Encrypted Transactions", "All transaction data is encrypted end-to-end."],
                  ["✅", "Secure Authentication", "Multi-layer login protection for every account."],
                  ["🔑", "Transaction PIN", "Every withdrawal requires your personal PIN."],
                  ["🚨", "Fraud Prevention", "Automated systems flag suspicious activity instantly."],
                  ["👁️", "Manual Verification", "High-value trades are manually reviewed when needed."],
                ].map(([icon, title, desc], i) => (
                  <Reveal key={title} delay={i * 70}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18 }}>
                      <div style={{ fontSize: 20, minWidth: 32, marginTop: 2 }}>{icon}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{title}</div>
                        <div style={{ fontSize: 13, color: "rgba(0,0,0,0.5)", lineHeight: 1.6 }}>{desc}</div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ━━━ 6. WHY CHOOSE US ━━━ */}
        <section style={{ padding: "100px 0", background: "rgba(0,0,0,0.03)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <Reveal style={{ textAlign: "center", marginBottom: 52 }}>
              <Label>Why Choose Us</Label>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.04em" }}>
                Why Users <span style={{ color: O }}>Choose NairaNexus</span>
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-5" style={{ gap: 16 }}>
              {[
                ["⚡", "Fast Payments", "Get paid within minutes of every confirmed trade.", Y],
                ["💰", "Competitive Rates", "We offer some of the best market rates available.", O],
                ["🔒", "Secure Platform", "Advanced encryption protects every transaction.", G],
                ["📊", "Full Transparency", "No hidden charges. See every detail clearly.", Y],
                ["📱", "Easy Dashboard", "A clean, intuitive interface built for everyone.", Y],
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

        {/* ━━━ 7. COMMITMENT ━━━ */}
        <section style={{ padding: "100px 0" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 28px", textAlign: "center" }}>
            <Reveal><Label>Our Commitment</Label></Reveal>
            <Reveal delay={80}>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 24 }}>
                Our Commitment to <span style={{ color: O }}>Our Users</span>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p style={{ fontSize: "clamp(1rem, 1.6vw, 1.15rem)", lineHeight: 1.85, color: "rgba(0,0,0,0.55)", marginBottom: 40 }}>
                We are committed to providing a reliable and transparent platform that prioritizes user satisfaction. Our goal is to ensure that every transaction on our platform is smooth, secure, and efficient — every single time.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
                {["Fair Rates Always", "24/7 Support", "No Hidden Fees", "Instant Confirmations", "User-First Approach"].map(tag => (
                  <div key={tag} style={{ padding: "8px 18px", borderRadius: 100, background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.12)", fontSize: 13, fontWeight: 600, color: "rgba(0,0,0,0.6)" }}>{tag}</div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ━━━ 8. CTA ━━━ */}
        <section style={{ padding: "100px 0", background: "rgba(0,0,0,0.03)" }}>
          <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 28px", textAlign: "center" }}>
            <Reveal>
              <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 100, background: G, border: "1px solid rgba(0,0,0,0.08)", fontSize: 12, fontWeight: 700, color: "#000", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24 }}>Start Today</div>
            </Reveal>
            <Reveal delay={80}>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.05em", marginBottom: 20 }}>
                Join Our Platform <span style={{ color: O }}>Today</span>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(0,0,0,0.55)", marginBottom: 40 }}>
                Start selling your gift cards or trading cryptocurrency in minutes. Create an account and experience fast and secure transactions.
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
