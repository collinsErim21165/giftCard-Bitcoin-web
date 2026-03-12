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

const inputStyle = {
  width: "100%", background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, padding: "14px 16px", color: "#111", fontSize: 14, fontFamily: "'Manrope', system-ui, sans-serif", outline: "none", transition: "border-color 0.25s",
};

export default function ContactUs() {
  const [navSolid, setNavSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
        .inp:focus{border-color:rgba(0,0,0,0.3)!important;background:rgba(0,0,0,0.1)!important}
        @keyframes float-a{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
        .fa{animation:float-a 6s ease-in-out infinite}
        .fb{animation:float-a 8s ease-in-out infinite 1.5s}
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
          <div style={{ position: "absolute", top: "10%", left: "5%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,0,0,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "5%", right: "6%", width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle, rgba(0,232,123,0.07) 0%, transparent 70%)`, pointerEvents: "none" }} />
          <div className="fa" style={{ position: "absolute", top: "20%", right: "8%", fontSize: 64, opacity: 0.14, pointerEvents: "none" }}>💬</div>
          <div className="fb" style={{ position: "absolute", bottom: "20%", right: "20%", fontSize: 48, opacity: 0.1, pointerEvents: "none" }}>📧</div>

          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", width: "100%" }}>
            <Reveal>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px 6px 8px", borderRadius: 100, background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.09)", marginBottom: 28 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: G, boxShadow: `0 0 8px ${G}` }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(0,0,0,0.6)", letterSpacing: "0.02em" }}>Support available · Response within 24 hrs</span>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h1 style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)", fontWeight: 800, lineHeight: 1.07, letterSpacing: "-0.05em", marginBottom: 24, maxWidth: 700 }}>
                Contact Our <span style={{ color: O }}>Support Team</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", lineHeight: 1.75, color: "rgba(0,0,0,0.55)", maxWidth: 520 }}>
                Need help with a transaction or have a question? Our support team is here to assist you quickly and professionally.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ━━━ 2. CONTACT OPTIONS ━━━ */}
        <section style={{ padding: "80px 0", background: "rgba(0,0,0,0.03)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <Reveal style={{ textAlign: "center", marginBottom: 52 }}>
              <Label>Reach Us</Label>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.04em" }}>
                How You Can <span style={{ color: O }}>Reach Us</span>
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 24 }}>
              {[
                {
                  icon: "📧", title: "Email Support", accent: "#000",
                  body: "Send us your inquiry or report a transaction issue directly to our support inbox.",
                  detail: "support@nairanexus.com",
                  note: "Include your transaction ID and details for a faster response.",
                },
                {
                  icon: "💬", title: "WhatsApp / Live Chat", accent: G,
                  body: "For urgent issues, reach our team instantly through WhatsApp or live chat.",
                  detail: "Available on WhatsApp",
                  note: "Best for time-sensitive transaction queries.",
                },
                {
                  icon: "⏱️", title: "Response Time", accent: O,
                  body: "Our support team is dedicated to getting back to you as fast as possible.",
                  detail: "Within 24 hours or less",
                  note: "Most queries are resolved same day.",
                },
              ].map(({ icon, title, accent, body, detail, note }, i) => (
                <Reveal key={title} delay={i * 90}>
                  <div className="gh" style={{ position: "relative", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "32px 28px", transition: "all 0.35s", height: "100%" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "20px 20px 0 0", background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                    <div style={{ fontSize: 38, marginBottom: 18 }}>{icon}</div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 10, letterSpacing: "-0.02em", color: "#fff" }}>{title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>{body}</p>
                    <div style={{ fontSize: 13, fontWeight: 700, color: accent, marginBottom: 6 }}>{detail}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>{note}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ 3. CONTACT FORM + SUPPORT TOPICS ━━━ */}
        <section style={{ padding: "100px 0" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 64, alignItems: "flex-start" }}>

              {/* contact form */}
              <div>
                <Reveal><Label>Message Us</Label></Reveal>
                <Reveal delay={80}>
                  <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 12 }}>
                    Send Us a <span style={{ color: O }}>Message</span>
                  </h2>
                </Reveal>
                <Reveal delay={140}>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(0,0,0,0.5)", marginBottom: 32 }}>
                    Fill out the form below and our team will get back to you as soon as possible.
                  </p>
                </Reveal>

                {submitted ? (
                  <Reveal>
                    <div style={{ background: "rgba(0,232,123,0.06)", border: "1px solid rgba(0,232,123,0.2)", borderRadius: 16, padding: "32px 28px", textAlign: "center" }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: G, marginBottom: 8 }}>Message Sent!</h3>
                      <p style={{ fontSize: 14, color: "rgba(0,0,0,0.55)" }}>We've received your message and will respond within 24 hours.</p>
                    </div>
                  </Reveal>
                ) : (
                  <Reveal delay={180}>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 16 }}>
                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Full Name</label>
                          <input required className="inp" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Doe" style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Email Address</label>
                          <input required type="email" className="inp" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" style={inputStyle} />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Subject</label>
                        <input required className="inp" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Transaction issue" style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Message</label>
                        <textarea required className="inp" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Describe your issue or question in detail..." style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }} />
                      </div>
                      <button type="submit" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "16px 36px", borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: "pointer", border: "none", background: "linear-gradient(135deg, #111009, #000)", color: Y, boxShadow: "0 8px 40px rgba(0,0,0,0.2)", transition: "all 0.35s", letterSpacing: "-0.01em" }}>
                        Send Message →
                      </button>
                    </form>
                  </Reveal>
                )}
              </div>

              {/* support topics + faq */}
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <Reveal>
                  <div style={{ position: "relative", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "32px 28px" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "20px 20px 0 0", background: `linear-gradient(90deg, ${Y}, transparent)` }} />
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, letterSpacing: "-0.02em", color: "#fff" }}>What We Can Help With</h3>
                    {[
                      ["🎁", "Gift card transaction inquiries"],
                      ["₿", "Cryptocurrency transaction support"],
                      ["✅", "Payment confirmation issues"],
                      ["🏦", "Withdrawal assistance"],
                      ["👤", "Account-related questions"],
                      ["🔒", "Security & account access"],
                    ].map(([icon, text]) => (
                      <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ fontSize: 18, minWidth: 28, color: "rgba(255,255,255,0.8)" }}>{icon}</span>
                        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </Reveal>

                {/* FAQ reminder */}
                <Reveal delay={100}>
                  <div style={{ position: "relative", background: G, border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20, padding: "28px 28px" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>💡</div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, color: "#000" }}>Check Our FAQ First</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.75, color: "rgba(0,0,0,0.6)", marginBottom: 20 }}>
                      You may find answers to common questions in our FAQ section before contacting support.
                    </p>
                    <Btn href="/faq" style={{ fontSize: 13, padding: "12px 24px" }}>View FAQ</Btn>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━ 4. TRUST SECTION ━━━ */}
        <section style={{ padding: "80px 0", background: "rgba(0,0,0,0.03)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
            <Reveal style={{ textAlign: "center", marginBottom: 48 }}>
              <Label>Our Commitment</Label>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.04em" }}>
                We Are Here <span style={{ color: O }}>to Help</span>
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(0,0,0,0.5)", maxWidth: 540, margin: "16px auto 0" }}>
                We are committed to providing reliable and responsive support to ensure every user has a smooth and secure experience on our platform.
              </p>
            </Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 20 }}>
              {[
                ["⚡", "Fast Responses", "Most support tickets are resolved within the same day.", Y],
                ["🎯", "Professional Service", "Our team is trained to handle all transaction and account queries.", G],
                ["🔒", "Secure & Private", "All communication and transaction details remain confidential.", O],
              ].map(([icon, title, desc, accent], i) => (
                <Reveal key={title} delay={i * 80}>
                  <div className="gh" style={{ position: "relative", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "28px 24px", textAlign: "center", transition: "all 0.35s" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "18px 18px 0 0", background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                    <div style={{ fontSize: 36, marginBottom: 14 }}>{icon}</div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, color: "#fff" }}>{title}</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.75, color: "rgba(255,255,255,0.45)" }}>{desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ 5. CTA ━━━ */}
        <section style={{ padding: "100px 0" }}>
          <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 28px", textAlign: "center" }}>
            <Reveal>
              <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 100, background: G, border: "1px solid rgba(0,0,0,0.08)", fontSize: 12, fontWeight: 700, color: "#000", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 24 }}>We're Ready</div>
            </Reveal>
            <Reveal delay={80}>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, letterSpacing: "-0.05em", marginBottom: 20 }}>
                Need <span style={{ color: O }}>Assistance?</span>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(0,0,0,0.55)", marginBottom: 40 }}>
                Our team is ready to help with any questions or transaction issues. Don't hesitate to reach out.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Btn primary href="mailto:support@nairanexus.com">Contact Support</Btn>
                <Btn href="/signup">Create an Account</Btn>
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
