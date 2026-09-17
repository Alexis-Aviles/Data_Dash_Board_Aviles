import { useState } from "react";
import logo from "@/imports/image.png";
import DashHeader from "@/components/DashHeader";
import DroneMap, { type MapDrone } from "@/components/DroneMap";
import WeatherPanel from "@/components/WeatherPanel";
import { useTickets } from "@/context/TicketContext";
import { useTheme } from "@/context/ThemeContext";

const TABS = [
  { id: "orders",    label: "📦 Orders"            },
  { id: "fleet",     label: "🚁 Fleet & Tracking"  },
  { id: "weather",   label: "🌤 Weather"           },
  { id: "chat",      label: "💬 Customers"         },
  { id: "analytics", label: "📊 Analytics"         },
  { id: "support",   label: "🆘 Support"           },
];

const ORDERS = [
  { id: "GID-88421", customer: "Alex Morgan",  item: "Wireless Earbuds Pro",    status: "In Flight",  drone: "DR-07", eta: "4 min",  value: "$89.99"  },
  { id: "GID-88445", customer: "Sam Rivera",   item: "Bamboo Cutting Board",    status: "Preparing",  drone: "DR-12", eta: "18 min", value: "$34.50"  },
  { id: "GID-88462", customer: "Jordan Lee",   item: "Plant-Based Protein ×2",  status: "Queued",     drone: "—",     eta: "45 min", value: "$52.00"  },
  { id: "GID-88390", customer: "Casey Wu",     item: "Noise-Cancel Headphones", status: "Delivered",  drone: "DR-03", eta: "—",      value: "$149.00" },
  { id: "GID-88317", customer: "Taylor Kim",   item: "Vitamin D3 Pack",         status: "Delivered",  drone: "DR-09", eta: "—",      value: "$18.00"  },
  { id: "GID-88201", customer: "Morgan Blake", item: "Ceramic Mug Set",         status: "Failed",     drone: "DR-05", eta: "—",      value: "$44.00"  },
];

const STATUS_COLOR: Record<string, string> = {
  "In Flight": "#00d4ff", Preparing: "#f59e0b", Queued: "#a78bfa",
  Delivered: "#22c55e", Failed: "#ef4444",
};

const FLEET: MapDrone[] = [
  { id: "DR-07", x: 55, y: 42, altitude: 82, speed: 14.2, battery: 68, status: "in_flight"   },
  { id: "DR-12", x: 20, y: 78, altitude: 0,  speed: 0,    battery: 91, status: "loading"     },
  { id: "DR-03", x: 70, y: 72, altitude: 0,  speed: 0,    battery: 100,status: "standby"     },
  { id: "DR-09", x: 80, y: 65, altitude: 0,  speed: 0,    battery: 87, status: "standby"     },
  { id: "DR-05", x: 45, y: 80, altitude: 0,  speed: 0,    battery: 22, status: "maintenance" },
];

const DRONE_STATUS_COLOR: Record<string, string> = {
  in_flight: "#00d4ff", standby: "#22c55e", loading: "#f59e0b", maintenance: "#ef4444",
};

const THREADS = [
  { name: "Alex Morgan", order: "GID-88421", time: "10:44", unread: 1 },
  { name: "Sam Rivera",  order: "GID-88445", time: "09:31", unread: 2 },
  { name: "Casey Wu",    order: "GID-88390", time: "Yesterday", unread: 0 },
];

const INIT_CHATS: Record<number, { from: string; text: string; time: string }[]> = {
  0: [{ from: "customer", text: "Hi, about how long until my order arrives?", time: "10:44" }],
  1: [{ from: "customer", text: "Can I add another item to my order?",         time: "09:31" }],
  2: [{ from: "customer", text: "Package received, thank you!",                time: "Yesterday" }],
};

const ISSUE_TYPES = ["Drone malfunction", "Delivery failure", "Billing issue", "Account access", "Other"];

// ── Mini chart helpers ────────────────────────────────────
function MiniBarChart({ data, color }: { data: { label: string; value: number; sub?: string }[]; color: string }) {
  const [hov, setHov] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2" style={{ height: 88 }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        const isH = hov === i;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 relative cursor-pointer"
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
          >
            {isH && (
              <div
                className="absolute bottom-full mb-1.5 px-2 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap pointer-events-none z-10"
                style={{ backgroundColor: color, color: "#070b10", fontWeight: 700, left: "50%", transform: "translateX(-50%)" }}
              >
                {d.sub ?? d.value}
              </div>
            )}
            <div
              className="w-full rounded-t transition-all duration-150"
              style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: color, opacity: isH ? 1 : 0.6, boxShadow: isH ? `0 0 12px ${color}55` : "none" }}
            />
            <span className="font-mono text-[9px] truncate max-w-full" style={{ color: isH ? color : "var(--g-tx2)" }}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SuccessArc({ success, total, color }: { success: number; total: number; color: string }) {
  const pct = total > 0 ? success / total : 1;
  const R = 40; const CX = 50; const CY = 50; const stroke = 10;
  const circ = 2 * Math.PI * R;
  const dash = pct * circ;
  return (
    <div className="flex items-center gap-5">
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--g-s2)" strokeWidth={stroke} />
        <circle
          cx={CX} cy={CY} r={R} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: "stroke-dasharray 0.5s" }}
        />
        <text x={CX} y={CY + 5} textAnchor="middle" fontSize={13} fontWeight={700} fill={color} fontFamily="'JetBrains Mono', monospace">
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <div className="space-y-2 text-xs">
        <div><span style={{ color: "var(--g-tx2)" }}>Success  </span><span className="font-mono font-bold" style={{ color: "#22c55e" }}>{success}</span></div>
        <div><span style={{ color: "var(--g-tx2)" }}>Failed   </span><span className="font-mono font-bold" style={{ color: "#ef4444" }}>{total - success}</span></div>
        <div><span style={{ color: "var(--g-tx2)" }}>Total    </span><span className="font-mono font-bold" style={{ color: "var(--g-tx)" }}>{total}</span></div>
      </div>
    </div>
  );
}

// ── Analytics data ────────────────────────────────────────
const DAILY = [
  { day: "Mon", deliveries: 142, revenue: 4820 },
  { day: "Tue", deliveries: 178, revenue: 6210 },
  { day: "Wed", deliveries: 163, revenue: 5680 },
  { day: "Thu", deliveries: 191, revenue: 7120 },
  { day: "Fri", deliveries: 155, revenue: 5430 },
  { day: "Sat", deliveries: 209, revenue: 8340 },
  { day: "Sun", deliveries: 183, revenue: 6900 },
];

const DONUT_DATA = [
  { label: "Delivered", value: 1241, color: "#22c55e" },
  { label: "Failed",    value: 43,   color: "#ef4444" },
  { label: "Pending",   value: 21,   color: "#f59e0b" },
];

function AnalyticsTab() {
  const [barHover, setBarHover] = useState<number | null>(null);
  const [lineHover, setLineHover] = useState<number | null>(null);
  const [donutHover, setDonutHover] = useState<number | null>(null);
  const [metric, setMetric] = useState<"deliveries" | "revenue">("deliveries");
  const [activeStat, setActiveStat] = useState<"Total" | "Delivered" | "Failed" | "Rate" | null>(null);

  const maxVal = Math.max(...DAILY.map((d) => d[metric]));
  const donutTotal = DONUT_DATA.reduce((a, b) => a + b.value, 0);

  // Build donut arcs
  const R = 54; const CX = 70; const CY = 70; const stroke = 16;
  const circ = 2 * Math.PI * R;
  let offset = 0;
  const arcs = DONUT_DATA.map((seg) => {
    const pct = seg.value / donutTotal;
    const dash = pct * circ;
    const arc = { ...seg, dasharray: `${dash} ${circ}`, dashoffset: -offset * circ, pct };
    offset += pct;
    return arc;
  });

  // Build SVG line path for revenue/deliveries
  const W = 100; const H = 60;
  const pts = DAILY.map((d, i) => {
    const x = (i / (DAILY.length - 1)) * W;
    const y = H - (d[metric] / maxVal) * (H - 8) - 4;
    return { x, y };
  });
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length-1].x} ${H} L 0 ${H} Z`;

  const fmtRevenue = (v: number) => `$${(v / 1000).toFixed(1)}k`;
  const fmtVal = (v: number) => metric === "revenue" ? fmtRevenue(v) : String(v);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-bold text-base" style={{ color: "var(--g-tx)" }}>Delivery Analytics — Sept 2026</h2>
        {/* Metric toggle */}
        <div className="flex gap-1 rounded-xl p-1 border" style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)" }}>
          {(["deliveries", "revenue"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className="text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-all"
              style={
                metric === m
                  ? { backgroundColor: "#f59e0b", color: "#070b10" }
                  : { color: "var(--g-tx2)" }
              }
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row — click to drill down */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([
          { key: "Total",     l: "Total Packages", v: "1,284", c: "#f59e0b" },
          { key: "Delivered", l: "Delivered",       v: "1,241", c: "#22c55e" },
          { key: "Failed",    l: "Failed",          v: "43",    c: "#ef4444" },
          { key: "Rate",      l: "Success Rate",    v: "96.7%", c: "#00d4ff" },
        ] as const).map((s) => {
          const isSel = activeStat === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActiveStat(isSel ? null : s.key)}
              className="border rounded-xl p-5 text-left transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--g-s1)", borderColor: isSel ? s.c + "88" : "var(--g-bd)", boxShadow: isSel ? `0 0 18px ${s.c}18` : "none" }}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs" style={{ color: "var(--g-tx2)" }}>{s.l}</p>
                <span className="text-[10px]" style={{ color: isSel ? s.c : "var(--g-tx4)" }}>{isSel ? "▲" : "▼"}</span>
              </div>
              <p className="font-mono text-2xl font-bold" style={{ color: s.c }}>{s.v}</p>
            </button>
          );
        })}
      </div>

      {/* ── Stat drill-down ── */}
      {activeStat && (
        <div className="border rounded-2xl p-5 space-y-4" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm" style={{ color: "var(--g-tx)" }}>
              {activeStat === "Total" ? "Total Packages" : activeStat === "Rate" ? "Success Rate" : activeStat} — Detail
            </p>
            <button onClick={() => setActiveStat(null)} className="text-[10px] font-mono hover:opacity-70" style={{ color: "var(--g-tx2)" }}>✕ close</button>
          </div>

          {activeStat === "Total" && (
            <div className="space-y-3">
              <p className="text-[10px] font-mono" style={{ color: "var(--g-tx2)" }}>Daily package volume — last 7 days</p>
              <MiniBarChart data={DAILY.map((d) => ({ label: d.day, value: d.deliveries, sub: `${d.deliveries} packages` }))} color="#f59e0b" />
              <div className="grid grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: "var(--g-bd)" }}>
                {[{ l: "Peak day", v: "Sat · 209" }, { l: "Avg / day", v: "174" }, { l: "Month est.", v: "~5,220" }].map((s) => (
                  <div key={s.l} className="rounded-xl px-4 py-3 text-center" style={{ backgroundColor: "var(--g-s2)" }}>
                    <p className="font-mono text-[9px] mb-1" style={{ color: "var(--g-tx2)" }}>{s.l}</p>
                    <p className="font-mono text-sm font-bold" style={{ color: "#f59e0b" }}>{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStat === "Delivered" && (
            <div className="space-y-3">
              <p className="text-[10px] font-mono" style={{ color: "var(--g-tx2)" }}>Successful deliveries per day</p>
              <MiniBarChart data={DAILY.map((d) => ({ label: d.day, value: Math.round(d.deliveries * 0.967), sub: `${Math.round(d.deliveries * 0.967)} delivered` }))} color="#22c55e" />
              <div className="grid grid-cols-2 gap-3 pt-3 border-t" style={{ borderColor: "var(--g-bd)" }}>
                {[{ l: "This week", v: "1,241" }, { l: "On-time rate", v: "94.2%" }].map((s) => (
                  <div key={s.l} className="rounded-xl px-4 py-3 text-center" style={{ backgroundColor: "var(--g-s2)" }}>
                    <p className="font-mono text-[9px] mb-1" style={{ color: "var(--g-tx2)" }}>{s.l}</p>
                    <p className="font-mono text-sm font-bold" style={{ color: "#22c55e" }}>{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStat === "Failed" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-6 items-start">
                <div>
                  <p className="text-[10px] font-mono mb-3" style={{ color: "var(--g-tx2)" }}>Success vs failure rate</p>
                  <SuccessArc success={1241} total={1284} color="#22c55e" />
                </div>
                <div className="flex-1 min-w-[160px]">
                  <p className="text-[10px] font-mono mb-3" style={{ color: "var(--g-tx2)" }}>Daily failures</p>
                  <MiniBarChart data={DAILY.map((d) => ({ label: d.day, value: Math.round(d.deliveries * 0.033), sub: `${Math.round(d.deliveries * 0.033)} failed` }))} color="#ef4444" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: "var(--g-bd)" }}>
                {[{ l: "This week", v: "43" }, { l: "Failure rate", v: "3.3%" }, { l: "Top cause", v: "GPS loss" }].map((s) => (
                  <div key={s.l} className="rounded-xl px-4 py-3 text-center" style={{ backgroundColor: "var(--g-s2)" }}>
                    <p className="font-mono text-[9px] mb-1" style={{ color: "var(--g-tx2)" }}>{s.l}</p>
                    <p className="font-mono text-sm font-bold" style={{ color: "#ef4444" }}>{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStat === "Rate" && (
            <div className="space-y-3">
              <p className="text-[10px] font-mono" style={{ color: "var(--g-tx2)" }}>Daily success rate — last 7 days</p>
              <MiniBarChart
                data={DAILY.map((d) => {
                  const rate = Math.round(((d.deliveries - Math.round(d.deliveries * 0.033)) / d.deliveries) * 1000) / 10;
                  return { label: d.day, value: rate, sub: `${rate}%` };
                })}
                color="#00d4ff"
              />
              <div className="grid grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: "var(--g-bd)" }}>
                {[{ l: "7-day avg", v: "96.7%" }, { l: "Best day", v: "Mon · 97.8%" }, { l: "SLA target", v: "95.0%" }].map((s) => (
                  <div key={s.l} className="rounded-xl px-4 py-3 text-center" style={{ backgroundColor: "var(--g-s2)" }}>
                    <p className="font-mono text-[9px] mb-1" style={{ color: "var(--g-tx2)" }}>{s.l}</p>
                    <p className="font-mono text-sm font-bold" style={{ color: "#00d4ff" }}>{s.v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ── Bar chart (spans 2 cols) ── */}
        <div className="md:col-span-2 border rounded-2xl p-5" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--g-tx2)" }}>
            Daily {metric === "deliveries" ? "Deliveries" : "Revenue"} — Last 7 Days
          </p>
          <p className="text-[10px] font-mono mb-5" style={{ color: "var(--g-tx4)" }}>Hover bars for details</p>

          {/* Bar chart */}
          <div className="flex items-end gap-2" style={{ height: 160 }}>
            {DAILY.map((d, i) => {
              const val = d[metric];
              const heightPct = (val / maxVal) * 100;
              const isHov = barHover === i;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group relative"
                  onMouseEnter={() => setBarHover(i)}
                  onMouseLeave={() => setBarHover(null)}
                >
                  {/* Tooltip */}
                  {isHov && (
                    <div
                      className="absolute bottom-full mb-2 px-2.5 py-1.5 rounded-lg text-center pointer-events-none z-20 whitespace-nowrap"
                      style={{ backgroundColor: "#f59e0b", color: "#070b10", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, left: "50%", transform: "translateX(-50%)" }}
                    >
                      {fmtVal(val)}
                    </div>
                  )}
                  <div
                    className="w-full rounded-t transition-all duration-150"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: "#f59e0b",
                      opacity: isHov ? 1 : 0.6,
                      boxShadow: isHov ? "0 0 12px #f59e0b66" : "none",
                    }}
                  />
                  <span className="font-mono text-[9px]" style={{ color: isHov ? "#f59e0b" : "var(--g-tx2)" }}>{d.day}</span>
                </div>
              );
            })}
          </div>

          {/* Line chart below */}
          <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--g-bd)" }}>
            <p className="text-[10px] font-mono mb-3" style={{ color: "var(--g-tx2)" }}>Trend</p>
            <div className="relative" style={{ height: 64 }}>
              <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
                onMouseLeave={() => setLineHover(null)}
              >
                {/* Area fill */}
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#lineGrad)" />
                <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Hover dots */}
                {pts.map((p, i) => (
                  <g key={i}>
                    <circle
                      cx={p.x} cy={p.y} r={lineHover === i ? 3 : 2}
                      fill={lineHover === i ? "#f59e0b" : "#f59e0b88"}
                      stroke={lineHover === i ? "#f59e0b" : "none"}
                      strokeWidth="2"
                      style={{ cursor: "pointer", transition: "r 0.1s" }}
                      onMouseEnter={() => setLineHover(i)}
                    />
                    {/* invisible hover target */}
                    <circle cx={p.x} cy={p.y} r={6} fill="transparent" onMouseEnter={() => setLineHover(i)} style={{ cursor: "pointer" }} />
                  </g>
                ))}
              </svg>
              {/* Tooltip for line hover */}
              {lineHover !== null && (
                <div
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: `${(lineHover / (DAILY.length - 1)) * 100}%`,
                    bottom: `${((pts[lineHover].y) / H) * 100}%`,
                    transform: "translate(-50%, -120%)",
                  }}
                >
                  <div
                    className="px-2 py-1 rounded-lg whitespace-nowrap"
                    style={{ backgroundColor: "var(--g-s2)", border: "1px solid #f59e0b88", color: "#f59e0b", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {DAILY[lineHover].day}: {fmtVal(DAILY[lineHover][metric])}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Donut chart ── */}
        <div className="border rounded-2xl p-5 flex flex-col" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--g-tx2)" }}>Delivery Breakdown</p>
          <p className="text-[10px] font-mono mb-4" style={{ color: "var(--g-tx4)" }}>Hover segments</p>
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="relative" style={{ width: 140, height: 140 }}>
              <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                {arcs.map((arc, i) => (
                  <circle
                    key={arc.label}
                    cx={CX} cy={CY} r={R}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={stroke}
                    strokeDasharray={arc.dasharray}
                    strokeDashoffset={arc.dashoffset}
                    opacity={donutHover === null || donutHover === i ? 1 : 0.35}
                    style={{ cursor: "pointer", transition: "opacity 0.15s, stroke-width 0.15s" }}
                    strokeLinecap="butt"
                    onMouseEnter={() => setDonutHover(i)}
                    onMouseLeave={() => setDonutHover(null)}
                  />
                ))}
              </svg>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {donutHover !== null ? (
                  <>
                    <span className="font-mono text-base font-bold" style={{ color: DONUT_DATA[donutHover].color }}>{DONUT_DATA[donutHover].value}</span>
                    <span className="text-[9px] font-mono" style={{ color: "var(--g-tx2)" }}>{DONUT_DATA[donutHover].label}</span>
                  </>
                ) : (
                  <>
                    <span className="font-mono text-base font-bold" style={{ color: "var(--g-tx)" }}>{donutTotal.toLocaleString()}</span>
                    <span className="text-[9px] font-mono" style={{ color: "var(--g-tx2)" }}>Total</span>
                  </>
                )}
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-1.5 w-full">
              {DONUT_DATA.map((seg, i) => (
                <div
                  key={seg.label}
                  className="flex items-center justify-between cursor-pointer rounded-lg px-2 py-1 transition-colors"
                  style={{ backgroundColor: donutHover === i ? seg.color + "14" : "transparent" }}
                  onMouseEnter={() => setDonutHover(i)}
                  onMouseLeave={() => setDonutHover(null)}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-xs" style={{ color: "var(--g-tx2)" }}>{seg.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold" style={{ color: seg.color }}>{seg.value}</span>
                    <span className="font-mono text-[9px] ml-1.5" style={{ color: "var(--g-tx4)" }}>{(seg.value / donutTotal * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SellerDashboard({ onLogout }: { onLogout: () => void }) {
  const { isDark } = useTheme();
  const [tab, setTab] = useState("orders");
  const [activeThread, setActiveThread] = useState(0);
  const [chats, setChats] = useState(INIT_CHATS);
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [selectedDroneId, setSelectedDroneId] = useState("DR-07");
  const [issueType, setIssueType] = useState(ISSUE_TYPES[0]);
  const [issueDesc, setIssueDesc] = useState("");
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const { addTicket } = useTickets();

  function send() {
    const msg = inputs[activeThread]?.trim();
    if (!msg) return;
    setChats((c) => ({
      ...c,
      [activeThread]: [...(c[activeThread] ?? []), { from: "seller", text: msg, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }],
    }));
    setInputs((i) => ({ ...i, [activeThread]: "" }));
  }

  function submitSupport() {
    const id = addTicket({ from: "seller", fromName: "TechGoods Store", orderId: "GID-88201", type: issueType, description: issueDesc || "(no description)" });
    setSubmittedTicketId(id);
    setIssueDesc("");
  }

  const selectedDrone = FLEET.find((d) => d.id === selectedDroneId) ?? FLEET[0];

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: "var(--g-bg)", fontFamily: "'Inter', sans-serif" }}>
      {/* Logo watermark */}
      <div
        className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden"
        style={{ opacity: isDark ? 0.035 : 0.06 }}
        aria-hidden="true"
      >
        <img src={logo} alt="" className="w-[60vw] max-w-2xl object-contain select-none" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <DashHeader role="Seller" name="TechGoods Store" onLogout={onLogout} accent="#f59e0b" />

        <div className="border-b px-2 overflow-x-auto shrink-0" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
          <div className="flex min-w-max">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  tab === t.id ? "border-[#f59e0b] text-[#f59e0b]" : "border-transparent hover:opacity-80"
                }`}
                style={tab !== t.id ? { color: "var(--g-tx2)" } : {}}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6">

          {/* ══ ORDERS ══ */}
          {tab === "orders" && (
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="font-bold text-base" style={{ color: "var(--g-tx)" }}>Current & Pending Orders</h2>
                <span className="text-xs font-mono" style={{ color: "var(--g-tx2)" }}>
                  {ORDERS.filter((o) => !["Delivered","Failed"].includes(o.status)).length} active
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { l: "Active",    v: ORDERS.filter((o) => !["Delivered","Failed"].includes(o.status)).length, c: "#f59e0b" },
                  { l: "Delivered", v: ORDERS.filter((o) => o.status === "Delivered").length,                   c: "#22c55e" },
                  { l: "Failed",    v: ORDERS.filter((o) => o.status === "Failed").length,                      c: "#ef4444" },
                  { l: "Revenue",   v: "$387.49",                                                               c: "#00d4ff" },
                ].map((s) => (
                  <div key={s.l} className="border rounded-xl p-4" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                    <p className="text-xs mb-1" style={{ color: "var(--g-tx2)" }}>{s.l}</p>
                    <p className="text-xl font-bold font-mono" style={{ color: s.c }}>{s.v}</p>
                  </div>
                ))}
              </div>

              <div className="border rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "var(--g-bd)" }}>
                        {["Order", "Customer", "Item", "Status", "Drone", "ETA", "Value"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--g-tx2)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ORDERS.map((o) => (
                        <tr key={o.id} className="border-b last:border-0 transition-colors hover:opacity-80" style={{ borderColor: "var(--g-s2)" }}>
                          <td className="px-4 py-3 font-mono text-xs text-[#f59e0b]">{o.id}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: "var(--g-tx)" }}>{o.customer}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: "var(--g-tx3)" }}>{o.item}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border" style={{ color: STATUS_COLOR[o.status], borderColor: STATUS_COLOR[o.status] + "44", backgroundColor: STATUS_COLOR[o.status] + "10" }}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--g-tx2)" }}>{o.drone}</td>
                          <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--g-tx2)" }}>{o.eta}</td>
                          <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: "var(--g-tx)" }}>{o.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ FLEET & TRACKING ══ */}
          {tab === "fleet" && (() => {
            const selColor = DRONE_STATUS_COLOR[selectedDrone.status];
            const linkedOrder = ORDERS.find((o) => o.drone === selectedDrone.id);
            return (
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="font-bold text-base" style={{ color: "var(--g-tx)" }}>Fleet & Live Tracking</h2>
                  <span className="text-xs" style={{ color: "var(--g-tx2)" }}>Click map or card to inspect a drone</span>
                </div>

                <DroneMap drones={FLEET} accentColor="#f59e0b" onDroneSelect={setSelectedDroneId} />

                {/* Selected drone detail */}
                <div className="border rounded-2xl p-5" style={{ backgroundColor: "var(--g-s1)", borderColor: selColor + "55", boxShadow: `0 0 20px ${selColor}12` }}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-lg font-bold" style={{ color: "var(--g-tx)" }}>{selectedDrone.id}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color: selColor, borderColor: selColor + "44", backgroundColor: selColor + "14" }}>
                          {selectedDrone.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--g-tx2)" }}>
                        {linkedOrder ? `Order ${linkedOrder.id} · ${linkedOrder.customer}` : "No active order"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                      { l: "Altitude", v: `${selectedDrone.altitude} m`, c: "#f59e0b" },
                      { l: "Speed",    v: `${selectedDrone.speed} m/s`,  c: "#f59e0b" },
                      { l: "Battery",  v: `${selectedDrone.battery}%`,   c: selectedDrone.battery > 50 ? "#22c55e" : selectedDrone.battery > 20 ? "#f59e0b" : "#ef4444" },
                      { l: "Signal",   v: selectedDrone.status === "maintenance" ? "LOST" : "95%", c: selectedDrone.status === "maintenance" ? "#ef4444" : "#22c55e" },
                    ].map((s) => (
                      <div key={s.l} className="rounded-xl px-4 py-3 text-center" style={{ backgroundColor: "var(--g-s2)" }}>
                        <p className="font-mono text-[9px] mb-1" style={{ color: "var(--g-tx2)" }}>{s.l}</p>
                        <p className="font-mono text-base font-bold" style={{ color: s.c }}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--g-s2)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${selectedDrone.battery}%`, backgroundColor: selectedDrone.battery > 50 ? "#22c55e" : selectedDrone.battery > 20 ? "#f59e0b" : "#ef4444" }} />
                  </div>
                </div>

                {/* Fleet grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {FLEET.map((d) => {
                    const color = DRONE_STATUS_COLOR[d.status];
                    const isSel = d.id === selectedDroneId;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDroneId(d.id)}
                        className="text-left border rounded-xl p-3 transition-all hover:opacity-90"
                        style={{ backgroundColor: "var(--g-s1)", borderColor: isSel ? color + "88" : "var(--g-bd)", boxShadow: isSel ? `0 0 14px ${color}20` : "none" }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs font-bold" style={{ color: "var(--g-tx)" }}>{d.id}</span>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, display: "inline-block" }} />
                        </div>
                        <p className="text-[9px] font-mono mb-2" style={{ color }}>{d.status.replace("_", " ")}</p>
                        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--g-s2)" }}>
                          <div className="h-full rounded-full" style={{ width: `${d.battery}%`, backgroundColor: d.battery > 50 ? "#22c55e" : d.battery > 20 ? "#f59e0b" : "#ef4444" }} />
                        </div>
                        <p className="font-mono text-[9px] mt-1" style={{ color: "var(--g-tx2)" }}>{d.battery}% bat</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ══ WEATHER ══ */}
          {tab === "weather" && (
            <div className="max-w-3xl mx-auto">
              <h2 className="font-bold text-base mb-4" style={{ color: "var(--g-tx)" }}>Weather — Delivery Zone</h2>
              <WeatherPanel accentColor="#f59e0b" />
            </div>
          )}

          {/* ══ CUSTOMER CHAT ══ */}
          {tab === "chat" && (
            <div className="max-w-4xl mx-auto">
              <h2 className="font-bold text-base mb-4" style={{ color: "var(--g-tx)" }}>Customer Messages</h2>
              <div className="flex gap-0 border rounded-2xl overflow-hidden" style={{ minHeight: 440, backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                {/* Thread list */}
                <div className="w-52 border-r shrink-0 flex flex-col" style={{ borderColor: "var(--g-bd)" }}>
                  {THREADS.map((t, i) => {
                    const threadMsgs = chats[i] ?? [];
                    const lastMsg = threadMsgs[threadMsgs.length - 1];
                    const lastText = lastMsg ? (lastMsg.from === "seller" ? lastMsg.text : `You: ${lastMsg.text}`) : "";
                    const lastTime = lastMsg?.time ?? t.time;
                    return (
                      <button
                        key={i}
                        onClick={() => setActiveThread(i)}
                        className="p-3.5 text-left border-b transition-colors w-full"
                        style={{ borderColor: "var(--g-bd)", backgroundColor: activeThread === i ? "#f59e0b18" : "transparent" }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold truncate" style={{ color: "var(--g-tx)" }}>{t.name}</span>
                          {t.unread > 0 && (
                            <span className="font-mono text-[9px] bg-[#f59e0b] text-[#070b10] rounded-full w-4 h-4 flex items-center justify-center shrink-0 ml-1 font-bold">{t.unread}</span>
                          )}
                        </div>
                        <p className="font-mono text-[9px] mb-0.5" style={{ color: "var(--g-tx2)" }}>{t.order}</p>
                        <p className="text-[10px] truncate" style={{ color: "var(--g-tx2)" }}>{lastText}</p>
                        <p className="font-mono text-[9px] mt-0.5" style={{ color: "var(--g-tx4)" }}>{lastTime}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Chat area */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="p-4 border-b" style={{ borderColor: "var(--g-bd)" }}>
                    <p className="text-sm font-bold" style={{ color: "var(--g-tx)" }}>{THREADS[activeThread]?.name}</p>
                    <p className="font-mono text-[10px]" style={{ color: "var(--g-tx2)" }}>{THREADS[activeThread]?.order}</p>
                  </div>
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[250px]">
                    {(chats[activeThread] ?? []).map((m, i) => (
                      <div key={i} className={`flex ${m.from === "seller" ? "justify-end" : "justify-start"}`}>
                        <div
                          className="max-w-[72%] rounded-2xl px-4 py-2.5"
                          style={
                            m.from === "seller"
                              ? { backgroundColor: "#f59e0b", color: "#070b10" }
                              : { backgroundColor: "var(--g-s2)", border: "1px solid var(--g-bd)", color: "var(--g-tx)" }
                          }
                        >
                          <p className="text-sm leading-snug">{m.text}</p>
                          <p className="text-[10px] mt-1" style={{ color: m.from === "seller" ? "#070b10" + "99" : "var(--g-tx2)" }}>{m.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t flex gap-2" style={{ borderColor: "var(--g-bd)" }}>
                    <input
                      value={inputs[activeThread] ?? ""}
                      onChange={(e) => setInputs((p) => ({ ...p, [activeThread]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && send()}
                      placeholder={`Reply to ${THREADS[activeThread]?.name}...`}
                      className="flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#f59e0b]/50"
                      style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                    />
                    <button onClick={send} className="bg-[#f59e0b] text-[#070b10] px-5 rounded-xl font-bold text-sm hover:bg-[#d97706] transition-colors">Send</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ ANALYTICS ══ */}
          {tab === "analytics" && <AnalyticsTab />}

          {/* ══ SUPPORT ══ */}
          {tab === "support" && (
            <div className="max-w-2xl mx-auto">
              <h2 className="font-bold text-base mb-4" style={{ color: "var(--g-tx)" }}>Contact GID Support</h2>
              {submittedTicketId ? (
                <div className="border border-[#22c55e]/30 rounded-2xl p-10 text-center" style={{ backgroundColor: "var(--g-s1)" }}>
                  <div className="w-14 h-14 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center mx-auto mb-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2.5} className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: "var(--g-tx)" }}>Ticket submitted!</h3>
                  <p className="text-sm mb-2" style={{ color: "var(--g-tx3)" }}>Our ops team will respond shortly.</p>
                  <p className="font-mono text-xs" style={{ color: "var(--g-tx2)" }}>Ticket ID: {submittedTicketId}</p>
                  <button onClick={() => setSubmittedTicketId(null)} className="mt-6 text-sm text-[#f59e0b] hover:underline">Submit another</button>
                </div>
              ) : (
                <div className="border rounded-2xl p-6 space-y-4" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--g-tx2)" }}>Category</label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                      style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                    >
                      {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--g-tx2)" }}>Details</label>
                    <textarea
                      value={issueDesc}
                      onChange={(e) => setIssueDesc(e.target.value)}
                      rows={5}
                      placeholder="Describe the issue in detail..."
                      className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
                      style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                    />
                  </div>
                  <button
                    onClick={submitSupport}
                    className="w-full bg-[#f59e0b] text-[#070b10] rounded-xl py-3 text-sm font-bold hover:bg-[#d97706] transition-colors"
                  >
                    Submit Ticket
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
