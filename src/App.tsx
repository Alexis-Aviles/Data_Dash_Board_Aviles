import { useState } from "react";
import logo from "@/imports/image.png";
import { TicketProvider } from "@/context/TicketContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import CustomerDashboard from "@/components/CustomerDashboard";
import SellerDashboard from "@/components/SellerDashboard";
import SupportDashboard from "@/components/SupportDashboard";

type Role = "customer" | "seller" | "support" | null;

const ROLES: { id: Role; label: string; desc: string; color: string }[] = [
  { id: "customer", label: "Customer", desc: "Track orders & deliveries", color: "#00d4ff" },
  { id: "seller",   label: "Seller",   desc: "Manage orders & fleet",    color: "#f59e0b" },
  { id: "support",  label: "Support",  desc: "Ops & system control",     color: "#a78bfa" },
];

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

function AppInner() {
  const { isDark, toggle } = useTheme();
  const [role, setRole] = useState<Role>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [showPassword, setShowPassword] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRole) return;
    setLoggingIn(true);
    setTimeout(() => { setRole(selectedRole); setLoggingIn(false); }, 900);
  }

  const accent = ROLES.find((r) => r.id === selectedRole)?.color ?? "#00d4ff";

  if (role)
    return (
      <TicketProvider>
        {role === "customer" && <CustomerDashboard onLogout={() => setRole(null)} />}
        {role === "seller"   && <SellerDashboard   onLogout={() => setRole(null)} />}
        {role === "support"  && <SupportDashboard  onLogout={() => setRole(null)} />}
      </TicketProvider>
    );

  return (
    <div className="min-h-full flex flex-col md:flex-row" style={{ backgroundColor: "var(--g-bg)" }}>
      {/* Subtle grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.025) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: isDark ? 1 : 0.4,
        }}
      />

      {/* Theme toggle — top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors hover:opacity-80"
          style={{ borderColor: "var(--g-tx2)", backgroundColor: "var(--g-s1)", color: "var(--g-tx)" }}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </button>
      </div>

      {/* ── LEFT — logo panel ── */}
      <div className="relative flex flex-col items-center justify-center flex-1 p-8 md:p-16 min-h-[40vh] md:min-h-full">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 50%, ${accent}14 0%, transparent 70%)`, transition: "background 0.6s" }}
        />

        <div className="relative flex flex-col items-center text-center">
          <div
            className="mb-8"
            style={{ filter: `drop-shadow(0 0 48px ${accent}66)`, transition: "filter 0.6s" }}
          >
            <img src={logo} alt="Get It Drone" className="w-56 h-56 md:w-72 md:h-72 object-contain" />
          </div>
          <div className="hidden md:flex flex-col gap-3 text-left w-full max-w-xs">
            {[
              { icon: "🚁", text: "Real-time drone tracking" },
              { icon: "📦", text: "Live order status updates" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-sm" style={{ color: "var(--g-tx2)" }}>
                <span className="text-lg">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vertical divider on desktop */}
      <div className="hidden md:block w-px self-stretch" style={{ backgroundColor: "var(--g-bd)" }} />
      {/* Horizontal divider on mobile */}
      <div className="md:hidden h-px mx-6" style={{ backgroundColor: "var(--g-bd)" }} />

      {/* ── RIGHT — sign-in panel ── */}
      <div className="relative flex flex-col justify-center w-full md:w-[420px] shrink-0 p-6 md:p-12">
        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-xl font-bold mb-1" style={{ color: "var(--g-tx)" }}>Sign in</h2>
          <p className="text-sm mb-7" style={{ color: "var(--g-tx2)" }}>Choose your account type to continue</p>

          {/* Role picker */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {ROLES.map((r) => (
              <button
                key={String(r.id)}
                onClick={() => setSelectedRole(r.id)}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-200"
                style={
                  selectedRole === r.id
                    ? { borderColor: r.color, backgroundColor: r.color + "18", color: r.color }
                    : { borderColor: "var(--g-bd)", backgroundColor: "var(--g-s2)", color: "var(--g-tx2)" }
                }
              >
                <RoleIcon id={r.id!} />
                <span className="text-xs font-semibold">{r.label}</span>
                <span className="text-[9px] leading-tight text-center opacity-70">{r.desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--g-tx2)" }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@getitdrone.com"
                className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = accent + "66")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--g-bd)")}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--g-tx2)" }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none transition-colors"
                  style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = accent + "66")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--g-bd)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                  style={{ color: "var(--g-tx2)" }}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <button type="button" className="text-xs transition-colors hover:opacity-80" style={{ color: "var(--g-tx2)" }}>Forgot password?</button>
              </div>
            </div>

            {!selectedRole && (
              <p className="text-xs text-[#f59e0b] text-center">Please select an account type above</p>
            )}

            <button
              type="submit"
              disabled={!selectedRole || loggingIn}
              className="w-full rounded-xl py-3 text-sm font-bold tracking-wide transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: accent, color: "#070b10" }}
            >
              {loggingIn ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t flex items-center justify-between" style={{ borderColor: "var(--g-bd)" }}>
            <span className="text-[10px] font-mono" style={{ color: "var(--g-tx4)" }}>v2.4.1</span>
            <span className="flex items-center gap-1.5 text-[10px] text-[#22c55e] font-mono">
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-[#22c55e] inline-block" />
              All systems nominal
            </span>
          </div>

          <p className="mt-5 text-xs text-center" style={{ color: "var(--g-tx4)" }}>
            New customer?{" "}
            <button className="text-[#00d4ff] hover:underline">Create an account</button>
          </p>

        </div>
      </div>
    </div>
  );
}

function RoleIcon({ id }: { id: string }) {
  if (id === "customer")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
      </svg>
    );
  if (id === "seller")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
    </svg>
  );
}
