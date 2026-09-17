import { useState } from "react";
import logo from "@/imports/image.png";
import DashHeader from "@/components/DashHeader";
import DroneMap, { type MapDrone } from "@/components/DroneMap";
import { useTickets } from "@/context/TicketContext";
import { useTheme } from "@/context/ThemeContext";

const TABS = [
  { id: "tickets",  label: "🎫 Tickets"           },
  { id: "fleet",    label: "🚁 Fleet & Location"  },
  { id: "orders",   label: "📦 Orders"            },
  { id: "system",   label: "🖥 IT / System"       },
];

const ALL_DRONES: MapDrone[] = [
  { id: "DR-07", x: 55, y: 42, altitude: 82, speed: 14.2, battery: 68, status: "in_flight"   },
  { id: "DR-11", x: 30, y: 60, altitude: 74, speed: 12.8, battery: 54, status: "in_flight"   },
  { id: "DR-12", x: 20, y: 78, altitude: 0,  speed: 0,    battery: 91, status: "loading"     },
  { id: "DR-03", x: 70, y: 72, altitude: 0,  speed: 0,    battery: 100,status: "standby"     },
  { id: "DR-09", x: 80, y: 65, altitude: 0,  speed: 0,    battery: 87, status: "standby"     },
  { id: "DR-05", x: 45, y: 80, altitude: 0,  speed: 0,    battery: 22, status: "maintenance" },
];

const ORDERS = [
  { id: "GID-88421", customer: "Alex Morgan",  seller: "TechGoods Store", status: "In Flight", drone: "DR-07", time: "10:41" },
  { id: "GID-88445", customer: "Sam Rivera",   seller: "TechGoods Store", status: "Preparing", drone: "DR-12", time: "10:32" },
  { id: "GID-88462", customer: "Jordan Lee",   seller: "GreenEats",       status: "Queued",    drone: "—",     time: "10:18" },
  { id: "GID-88390", customer: "Casey Wu",     seller: "TechGoods Store", status: "Delivered", drone: "DR-03", time: "09:55" },
  { id: "GID-88310", customer: "Riley Scott",  seller: "UrbanMart",       status: "Delivered", drone: "DR-11", time: "09:41" },
  { id: "GID-88201", customer: "Morgan Blake", seller: "TechGoods Store", status: "Failed",    drone: "DR-05", time: "08:30" },
];

const STATUS_COLOR: Record<string, string> = {
  "In Flight": "#00d4ff", Preparing: "#f59e0b", Queued: "#a78bfa",
  Delivered: "#22c55e", Failed: "#ef4444",
};
const DRONE_STATUS_COLOR: Record<string, string> = {
  in_flight: "#00d4ff", standby: "#22c55e", loading: "#f59e0b", maintenance: "#ef4444",
};
const PRIORITY_COLOR: Record<string, string> = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };
const TICKET_STATUS_COLOR: Record<string, string> = { Open: "#00d4ff", "In Review": "#f59e0b", Resolved: "#22c55e" };

const SYSTEMS = [
  { name: "Drone Fleet API",      status: "Operational", latency: "12 ms",  uptime: "99.97%" },
  { name: "Order Management",     status: "Operational", latency: "8 ms",   uptime: "99.99%" },
  { name: "GPS Tracking",         status: "Operational", latency: "4 ms",   uptime: "100%"   },
  { name: "Weather Service",      status: "Operational", latency: "22 ms",  uptime: "99.94%" },
  { name: "Payment Gateway",      status: "Degraded",    latency: "340 ms", uptime: "97.2%"  },
  { name: "Notification Engine",  status: "Operational", latency: "15 ms",  uptime: "99.98%" },
  { name: "Database Cluster",     status: "Operational", latency: "6 ms",   uptime: "99.99%" },
  { name: "DR-05 Control Link",   status: "Offline",     latency: "—",      uptime: "0%"     },
];
const SYS_COLOR: Record<string, string> = { Operational: "#22c55e", Degraded: "#f59e0b", Offline: "#ef4444" };

export default function SupportDashboard({ onLogout }: { onLogout: () => void }) {
  const { isDark } = useTheme();
  const [tab, setTab] = useState("tickets");
  const [selectedDroneId, setSelectedDroneId] = useState<string>("DR-07");
  const [ticketFilter, setTicketFilter] = useState<"All" | "Open" | "In Review" | "Resolved">("All");
  const { tickets, updateTicketStatus, updateTicketPriority } = useTickets();

  const visibleTickets = ticketFilter === "All" ? tickets : tickets.filter((t) => t.status === ticketFilter);

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
        <DashHeader role="Support" name="Ops Center" onLogout={onLogout} accent="#a78bfa" />

        {/* Tabs */}
        <div className="border-b px-2 overflow-x-auto shrink-0" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
          <div className="flex min-w-max">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  tab === t.id ? "border-[#a78bfa] text-[#a78bfa]" : "border-transparent hover:opacity-80"
                }`}
                style={tab !== t.id ? { color: "var(--g-tx2)" } : {}}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6">

          {/* ══ TICKETS ══ */}
          {tab === "tickets" && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="font-bold text-base" style={{ color: "var(--g-tx)" }}>Support Tickets</h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--g-tx2)" }}>{tickets.filter((t) => t.status === "Open").length} open · {tickets.length} total</p>
                </div>
                {/* Filter pills */}
                <div className="flex gap-1.5">
                  {(["All", "Open", "In Review", "Resolved"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setTicketFilter(f)}
                      className="text-xs px-3 py-1.5 rounded-full border transition-colors font-medium"
                      style={
                        ticketFilter === f
                          ? { borderColor: "#a78bfa", backgroundColor: "#a78bfa18", color: "#a78bfa" }
                          : { borderColor: "var(--g-bd)", backgroundColor: "transparent", color: "var(--g-tx2)" }
                      }
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {visibleTickets.length === 0 && (
                <div className="text-center py-16 text-sm" style={{ color: "var(--g-tx2)" }}>No tickets matching filter</div>
              )}

              <div className="space-y-3">
                {visibleTickets.map((t) => (
                  <div key={t.id} className="border rounded-2xl p-5 transition-colors hover:opacity-90" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded border"
                            style={{ color: t.from === "customer" ? "#00d4ff" : "#f59e0b", borderColor: (t.from === "customer" ? "#00d4ff" : "#f59e0b") + "33", backgroundColor: (t.from === "customer" ? "#00d4ff" : "#f59e0b") + "10" }}
                          >
                            {t.from === "customer" ? "Customer" : "Seller"}
                          </span>
                          <span className="font-mono text-[10px]" style={{ color: "var(--g-tx2)" }}>{t.id}</span>
                          <span className="font-mono text-[10px]" style={{ color: "var(--g-tx2)" }}>·</span>
                          <span className="font-mono text-[10px]" style={{ color: "var(--g-tx2)" }}>{t.time}</span>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: "var(--g-tx)" }}>{t.type}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--g-tx2)" }}>From <span style={{ color: "var(--g-tx3)" }}>{t.fromName}</span> · Order <span style={{ color: "var(--g-tx3)" }}>{t.orderId}</span></p>
                        {t.description && (
                          <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--g-tx3)" }}>{t.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                          style={{ color: PRIORITY_COLOR[t.priority], borderColor: PRIORITY_COLOR[t.priority] + "44", backgroundColor: PRIORITY_COLOR[t.priority] + "10" }}
                        >
                          {t.priority}
                        </span>
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                          style={{ color: TICKET_STATUS_COLOR[t.status], borderColor: TICKET_STATUS_COLOR[t.status] + "44", backgroundColor: TICKET_STATUS_COLOR[t.status] + "10" }}
                        >
                          {t.status}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-3 pt-3 border-t flex-wrap" style={{ borderColor: "var(--g-s2)" }}>
                      {/* Status actions */}
                      <div className="flex gap-2 flex-wrap">
                        {t.status !== "In Review" && t.status !== "Resolved" && (
                          <button
                            onClick={() => updateTicketStatus(t.id, "In Review")}
                            className="text-xs px-3 py-1.5 rounded-xl border border-[#a78bfa]/30 text-[#a78bfa] hover:bg-[#a78bfa]/10 transition-colors font-medium"
                          >
                            Start Review
                          </button>
                        )}
                        {t.status !== "Resolved" && (
                          <button
                            onClick={() => updateTicketStatus(t.id, "Resolved")}
                            className="text-xs px-3 py-1.5 rounded-xl border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/10 transition-colors font-medium"
                          >
                            Mark Resolved
                          </button>
                        )}
                        {t.status === "Resolved" && (
                          <button
                            onClick={() => updateTicketStatus(t.id, "Open")}
                            className="text-xs px-3 py-1.5 rounded-xl border transition-colors hover:opacity-80"
                            style={{ borderColor: "var(--g-bd)", color: "var(--g-tx2)" }}
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                      {/* Priority selector */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono mr-0.5" style={{ color: "var(--g-tx2)" }}>Priority:</span>
                        {(["Low", "Medium", "High"] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => updateTicketPriority(t.id, p)}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all"
                            style={
                              t.priority === p
                                ? { borderColor: PRIORITY_COLOR[p], backgroundColor: PRIORITY_COLOR[p] + "18", color: PRIORITY_COLOR[p] }
                                : { borderColor: "var(--g-bd)", color: "var(--g-tx2)", backgroundColor: "transparent" }
                            }
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ FLEET & LOCATION ══ */}
          {tab === "fleet" && (() => {
            const selDrone = ALL_DRONES.find((d) => d.id === selectedDroneId) ?? ALL_DRONES[0];
            const selColor = DRONE_STATUS_COLOR[selDrone.status];
            const linkedOrder = ORDERS.find((o) => o.drone === selDrone.id);
            return (
              <div className="max-w-5xl mx-auto space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="font-bold text-base" style={{ color: "var(--g-tx)" }}>Fleet & Live Location</h2>
                  <div className="flex gap-4 text-xs font-mono">
                    {[
                      { l: "In Flight",   c: "#00d4ff", s: "in_flight"   },
                      { l: "Standby",     c: "#22c55e", s: "standby"     },
                      { l: "Loading",     c: "#f59e0b", s: "loading"     },
                      { l: "Maintenance", c: "#ef4444", s: "maintenance" },
                    ].map((s) => (
                      <span key={s.l} style={{ color: s.c }}>
                        {ALL_DRONES.filter((d) => d.status === s.s).length} {s.l}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Live map */}
                <DroneMap drones={ALL_DRONES} accentColor="#a78bfa" onDroneSelect={setSelectedDroneId} />

                {/* Selected drone detail panel */}
                <div className="border rounded-2xl p-5" style={{ backgroundColor: "var(--g-s1)", borderColor: selColor + "55", boxShadow: `0 0 20px ${selColor}12` }}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-lg font-bold" style={{ color: "var(--g-tx)" }}>{selDrone.id}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color: selColor, borderColor: selColor + "44", backgroundColor: selColor + "14" }}>
                          {selDrone.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: "var(--g-tx2)" }}>
                        {linkedOrder ? `Order ${linkedOrder.id} · ${linkedOrder.customer} (${linkedOrder.seller})` : "No active order"}
                      </p>
                    </div>
                    <DroneIcon color={selColor} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                      { l: "Battery",  v: `${selDrone.battery}%`,   c: selDrone.battery > 50 ? "#22c55e" : selDrone.battery > 20 ? "#f59e0b" : "#ef4444" },
                      { l: "Altitude", v: `${selDrone.altitude} m`, c: "var(--g-tx)" },
                      { l: "Speed",    v: `${selDrone.speed} m/s`,  c: "var(--g-tx)" },
                      { l: "Signal",   v: selDrone.status === "maintenance" ? "LOST" : "95%", c: selDrone.status === "maintenance" ? "#ef4444" : "#22c55e" },
                    ].map((s) => (
                      <div key={s.l} className="rounded-xl px-4 py-3" style={{ backgroundColor: "var(--g-s2)" }}>
                        <p className="font-mono text-[9px] mb-1" style={{ color: "var(--g-tx2)" }}>{s.l}</p>
                        <p className="font-mono text-sm font-bold" style={{ color: s.c }}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--g-s2)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${selDrone.battery}%`, backgroundColor: selDrone.battery > 50 ? "#22c55e" : selDrone.battery > 20 ? "#f59e0b" : "#ef4444" }} />
                  </div>
                </div>

                {/* All drone cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ALL_DRONES.map((d) => {
                    const color = DRONE_STATUS_COLOR[d.status];
                    const isSel = d.id === selectedDroneId;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDroneId(d.id)}
                        className="text-left border rounded-2xl p-5 transition-all hover:opacity-90"
                        style={{ backgroundColor: "var(--g-s1)", borderColor: isSel ? color + "88" : "var(--g-bd)", boxShadow: isSel ? `0 0 20px ${color}18` : "none" }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-bold" style={{ color: "var(--g-tx)" }}>{d.id}</p>
                            <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color, borderColor: color + "44", backgroundColor: color + "10" }}>
                              {d.status.replace("_", " ")}
                            </span>
                          </div>
                          <DroneIcon color={color} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { l: "Battery", v: `${d.battery}%`,   c: d.battery > 50 ? "#22c55e" : d.battery > 20 ? "#f59e0b" : "#ef4444" },
                            { l: "Altitude", v: `${d.altitude} m`, c: "var(--g-tx)" },
                            { l: "Speed",   v: `${d.speed} m/s`,  c: "var(--g-tx)" },
                            { l: "Signal",  v: d.status === "maintenance" ? "LOST" : "95%", c: d.status === "maintenance" ? "#ef4444" : "#22c55e" },
                          ].map((s) => (
                            <div key={s.l} className="rounded-lg px-3 py-2" style={{ backgroundColor: "var(--g-s2)" }}>
                              <p className="font-mono text-[9px] mb-0.5" style={{ color: "var(--g-tx2)" }}>{s.l}</p>
                              <p className="font-mono text-xs font-bold" style={{ color: s.c }}>{s.v}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--g-s2)" }}>
                          <div className="h-full rounded-full" style={{ width: `${d.battery}%`, backgroundColor: d.battery > 50 ? "#22c55e" : d.battery > 20 ? "#f59e0b" : "#ef4444" }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ══ ORDERS ══ */}
          {tab === "orders" && (
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="font-bold text-base" style={{ color: "var(--g-tx)" }}>All Orders — Today</h2>
                <div className="flex gap-4 text-xs font-mono">
                  {[
                    { l: "Active",    c: "#00d4ff", filter: (o: typeof ORDERS[0]) => ["In Flight","Preparing","Queued"].includes(o.status) },
                    { l: "Delivered", c: "#22c55e", filter: (o: typeof ORDERS[0]) => o.status === "Delivered" },
                    { l: "Failed",    c: "#ef4444", filter: (o: typeof ORDERS[0]) => o.status === "Failed" },
                  ].map((s) => (
                    <span key={s.l} style={{ color: s.c }}>{ORDERS.filter(s.filter).length} {s.l}</span>
                  ))}
                </div>
              </div>
              <div className="border rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "var(--g-bd)" }}>
                        {["Order ID", "Customer", "Seller", "Status", "Drone", "Time"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--g-tx2)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ORDERS.map((o) => (
                        <tr key={o.id} className="border-b last:border-0 transition-colors hover:opacity-80" style={{ borderColor: "var(--g-s2)" }}>
                          <td className="px-4 py-3 font-mono text-xs text-[#a78bfa]">{o.id}</td>
                          <td className="px-4 py-3 text-sm" style={{ color: "var(--g-tx)" }}>{o.customer}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: "var(--g-tx3)" }}>{o.seller}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border" style={{ color: STATUS_COLOR[o.status], borderColor: STATUS_COLOR[o.status] + "44", backgroundColor: STATUS_COLOR[o.status] + "10" }}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--g-tx2)" }}>{o.drone}</td>
                          <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--g-tx2)" }}>{o.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ IT / SYSTEM ══ */}
          {tab === "system" && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base" style={{ color: "var(--g-tx)" }}>IT & System Status</h2>
                <div className="flex items-center gap-2">
                  <span className="live-dot w-1.5 h-1.5 rounded-full bg-[#f59e0b] inline-block" />
                  <span className="text-xs font-mono text-[#f59e0b]">1 Degraded · 1 Offline</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SYSTEMS.map((s) => (
                  <div key={s.name} className="border rounded-xl p-5 flex items-center justify-between transition-colors hover:opacity-90" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                    <div>
                      <p className="text-sm font-semibold mb-1.5" style={{ color: "var(--g-tx)" }}>{s.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ color: SYS_COLOR[s.status], borderColor: SYS_COLOR[s.status] + "44", backgroundColor: SYS_COLOR[s.status] + "10" }}>
                          {s.status}
                        </span>
                        <span className="font-mono text-[10px]" style={{ color: "var(--g-tx2)" }}>{s.latency}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] mb-0.5" style={{ color: "var(--g-tx2)" }}>Uptime</p>
                      <p className="font-mono text-base font-bold" style={{ color: SYS_COLOR[s.status] }}>{s.uptime}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Incident log */}
              <div className="border rounded-2xl p-5" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                <p className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: "var(--g-tx2)" }}>Incident Log</p>
                {[
                  { time: "08:28", level: "error", msg: "DR-05 control link lost — GPS module failure detected" },
                  { time: "09:14", level: "warn",  msg: "Payment Gateway latency spike — P99 at 340ms (threshold: 200ms)" },
                  { time: "10:00", level: "info",  msg: "Fleet API deployment v2.4.1 completed successfully" },
                  { time: "10:18", level: "info",  msg: "New order queued — GID-88462" },
                  { time: "10:42", level: "info",  msg: "DR-07 in flight — package GID-88421 en route" },
                ].reverse().map((l, i) => (
                  <div key={i} className="flex gap-3 py-2 border-b last:border-0 items-start" style={{ borderColor: "var(--g-s2)" }}>
                    <span className="font-mono text-[10px] w-10 shrink-0 pt-0.5" style={{ color: "var(--g-tx2)" }}>{l.time}</span>
                    <span className={`font-mono text-[10px] w-12 shrink-0 pt-0.5 ${l.level === "error" ? "text-[#ef4444]" : l.level === "warn" ? "text-[#f59e0b]" : "text-[#22c55e]"}`}>
                      {l.level.toUpperCase()}
                    </span>
                    <span className="text-xs leading-relaxed" style={{ color: "var(--g-tx3)" }}>{l.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function DroneIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="2.5" fill={color} />
      <path d="M6 6l3.5 3.5M18 6l-3.5 3.5M6 18l3.5-3.5M18 18l-3.5-3.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="5"  cy="5"  r="2" fill={color} opacity="0.5" />
      <circle cx="19" cy="5"  r="2" fill={color} opacity="0.5" />
      <circle cx="5"  cy="19" r="2" fill={color} opacity="0.5" />
      <circle cx="19" cy="19" r="2" fill={color} opacity="0.5" />
    </svg>
  );
}
