import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export interface HeaderNotif {
  id: number;
  text: string;
  sub: string;
  time: string;
  read: boolean;
}

const SEED: Record<string, HeaderNotif[]> = {
  Customer: [
    { id: 1, text: "DR-07 is 0.8 km away",         sub: "Order GID-88421",          time: "10:46", read: false },
    { id: 2, text: "TechGoods Store replied",       sub: "ETA approx. 4 minutes",    time: "10:45", read: false },
    { id: 3, text: "Order GID-88197 is preparing",  sub: "Expected pickup in 15 min", time: "10:32", read: true  },
  ],
  Seller: [
    { id: 1, text: "New order received",            sub: "GID-88462 — Jordan Lee",   time: "10:18", read: false },
    { id: 2, text: "Sam Rivera sent a message",     sub: "Can I add another item?",  time: "09:31", read: false },
    { id: 3, text: "DR-05 maintenance required",    sub: "Battery critical — 22%",   time: "08:28", read: true  },
  ],
  Support: [
    { id: 1, text: "High priority report filed",   sub: "RPT-4420 — Drone crash DR-05", time: "08:35", read: false },
    { id: 2, text: "Payment Gateway degraded",      sub: "P99 latency 340 ms",           time: "09:14", read: false },
    { id: 3, text: "Fleet API v2.4.1 deployed",     sub: "All systems nominal",           time: "10:00", read: true  },
  ],
};

interface DashHeaderProps {
  role: string;
  name: string;
  onLogout: () => void;
  accent: string;
}

export default function DashHeader({ role, name, onLogout, accent }: DashHeaderProps) {
  const { isDark, toggle } = useTheme();
  const [time, setTime] = useState(
    () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<HeaderNotif[]>(SEED[role] ?? []);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(
      () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })),
      1000
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const unread = notifs.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifs((p) => p.map((n) => ({ ...n, read: true })));
  }

  function dismiss(id: number) {
    setNotifs((p) => p.filter((n) => n.id !== id));
  }

  function markRead(id: number) {
    setNotifs((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  return (
    <header
      className="border-b px-4 py-3 flex items-center justify-between shrink-0 relative z-30"
      style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <div className="text-sm font-bold tracking-wide" style={{ color: accent }}>Get It Drone</div>
          <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--g-tx3)" }}>{role} Portal</div>
        </div>
      </div>

      {/* Live clock */}
      <div className="hidden md:flex items-center gap-5">
        <span className="font-mono text-[11px] tabular-nums" style={{ color: "var(--g-tx2)" }}>{time}</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#22c55e]">
          <span className="live-dot w-1.5 h-1.5 rounded-full bg-[#22c55e] inline-block" />
          Live
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5" ref={ref}>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors hover:opacity-80"
          style={{ borderColor: "var(--g-bd)", backgroundColor: "var(--g-s2)", color: "var(--g-tx2)" }}
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

        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => { setOpen((o) => !o); if (!open) markAllRead(); }}
            className="relative w-9 h-9 rounded-xl border flex items-center justify-center hover:opacity-80 transition-colors"
            style={{ borderColor: "var(--g-bd)", backgroundColor: "var(--g-s2)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4" style={{ color: "var(--g-tx2)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unread > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center font-mono text-[9px] font-bold"
                style={{ backgroundColor: accent, color: "#070b10" }}
              >
                {unread}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div
              className="absolute right-0 top-11 w-80 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.3)] overflow-hidden border z-50"
              style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}
            >
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--g-bd)" }}>
                <span className="text-sm font-semibold" style={{ color: "var(--g-tx)" }}>Notifications</span>
                <button onClick={markAllRead} className="text-xs hover:underline" style={{ color: accent }}>
                  Mark all read
                </button>
              </div>

              {notifs.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs" style={{ color: "var(--g-tx2)" }}>No notifications</div>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  {notifs.map((n) => (
                    <div
                      key={n.id}
                      className="flex gap-3 px-4 py-3 items-start group transition-colors border-b last:border-0"
                      style={{
                        borderColor: "var(--g-s2)",
                        backgroundColor: !n.read ? "color-mix(in srgb, var(--g-s2) 70%, transparent)" : "transparent",
                      }}
                      onClick={() => markRead(n.id)}
                    >
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 transition-colors" style={{ backgroundColor: n.read ? "var(--g-bd)" : accent }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug" style={{ color: "var(--g-tx)" }}>{n.text}</p>
                        <p className="font-mono text-xs mt-0.5 truncate" style={{ color: "var(--g-tx3)" }}>{n.sub}</p>
                      </div>
                      <span className="font-mono text-[9px] shrink-0" style={{ color: "var(--g-tx4)" }}>{n.time}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#1e2d40]/30"
                        style={{ color: "var(--g-tx2)" }}
                        title="Dismiss"
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor" className="w-2.5 h-2.5">
                          <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User */}
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold" style={{ color: "var(--g-tx)" }}>{name}</p>
          <p className="font-mono text-[10px]" style={{ color: "var(--g-tx3)" }}>{role}</p>
        </div>

        <button
          onClick={onLogout}
          className="text-sm px-3.5 py-1.5 rounded-xl border font-medium transition-colors hover:opacity-80"
          style={{ borderColor: "var(--g-bd2)", color: "var(--g-tx)" }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
