import { useState } from "react";
import logo from "@/imports/image.png";
import DashHeader from "@/components/DashHeader";
import DroneMap, { type MapDrone } from "@/components/DroneMap";
import WeatherPanel from "@/components/WeatherPanel";
import { useTickets } from "@/context/TicketContext";
import { useTheme } from "@/context/ThemeContext";
import { deliveryConflictsNoFly, currentHourIsNoFly, noFlyWindows, fmt12, availableFlyHours } from "@/utils/noFlyUtils";

const TABS = [
  { id: "orders",    label: "📦 Orders"            },
  { id: "fleet",     label: "🚁 Fleet & Tracking"  },
  { id: "weather",   label: "🌤 Weather"           },
  { id: "chat",      label: "💬 Customers"         },
  { id: "analytics", label: "📊 Analytics"         },
  { id: "support",   label: "🆘 Support"           },
];

type SellerOrder = {
  id: string;
  customer: string;
  item: string;
  products: { name: string; qty: number; sku: string }[];
  weight: string;
  dimensions: string;
  status: string;
  drone: string;
  eta: string;
  value: string;
  deliveryAddress: string;
  deliveryName: string;
};

const INITIAL_ORDERS: SellerOrder[] = [
  {
    id: "GID-88421", customer: "Alex Morgan", item: "Wireless Earbuds Pro", status: "In Flight", drone: "DR-07", eta: "4 min", value: "$89.99",
    products: [{ name: "Wireless Earbuds Pro", qty: 1, sku: "TG-WEP-001" }],
    weight: "0.32 kg", dimensions: "18 × 14 × 6 cm",
    deliveryAddress: "Prinsengracht 142, 1015 EA Amsterdam", deliveryName: "Alex Morgan",
  },
  {
    id: "GID-88445", customer: "Sam Rivera", item: "Bamboo Cutting Board", status: "Preparing", drone: "DR-12", eta: "18 min", value: "$34.50",
    products: [{ name: "Bamboo Cutting Board", qty: 1, sku: "UM-BCB-002" }],
    weight: "0.78 kg", dimensions: "40 × 30 × 3 cm",
    deliveryAddress: "Keizersgracht 88, 1015 CT Amsterdam", deliveryName: "Sam Rivera",
  },
  {
    id: "GID-88462", customer: "Jordan Lee", item: "Plant-Based Protein ×2", status: "Ready to Fulfill", drone: "—", eta: "—", value: "$52.00",
    products: [
      { name: "Plant-Based Protein 500g", qty: 2, sku: "GE-PBP-003" },
    ],
    weight: "1.10 kg", dimensions: "22 × 14 × 10 cm",
    deliveryAddress: "Herengracht 54, 1015 BN Amsterdam", deliveryName: "Jordan Lee",
  },
  {
    id: "GID-88471", customer: "Riley Patel", item: "USB-C Hub 7-in-1 + Webcam 4K", status: "Ready to Fulfill", drone: "—", eta: "—", value: "$114.98",
    products: [
      { name: "USB-C Hub 7-in-1", qty: 1, sku: "TG-UCH-002" },
      { name: "Webcam 4K Ultra", qty: 1, sku: "TG-WCM-006" },
    ],
    weight: "0.85 kg", dimensions: "26 × 18 × 9 cm",
    deliveryAddress: "Singel 400, 1016 AK Amsterdam", deliveryName: "Riley Patel",
  },
  {
    id: "GID-88390", customer: "Casey Wu", item: "Noise-Cancel Headphones", status: "Delivered", drone: "DR-03", eta: "—", value: "$149.00",
    products: [{ name: "Noise-Cancelling Headphones", qty: 1, sku: "TG-NCH-005" }],
    weight: "0.45 kg", dimensions: "20 × 17 × 9 cm",
    deliveryAddress: "Jordaan 22, 1016 LL Amsterdam", deliveryName: "Casey Wu",
  },
  {
    id: "GID-88317", customer: "Taylor Kim", item: "Vitamin D3 Pack", status: "Delivered", drone: "DR-09", eta: "—", value: "$18.00",
    products: [{ name: "Vitamin D3 + K2 Pack", qty: 1, sku: "GE-VDK-004" }],
    weight: "0.12 kg", dimensions: "10 × 7 × 4 cm",
    deliveryAddress: "Vondelpark 3, 1071 AA Amsterdam", deliveryName: "Taylor Kim",
  },
  {
    id: "GID-88201", customer: "Morgan Blake", item: "Ceramic Mug Set", status: "Failed", drone: "DR-05", eta: "—", value: "$44.00",
    products: [{ name: "Ceramic Mug Set ×4", qty: 1, sku: "UM-CMS-002" }],
    weight: "1.20 kg", dimensions: "28 × 22 × 14 cm",
    deliveryAddress: "Leidseplein 12, 1017 PT Amsterdam", deliveryName: "Morgan Blake",
  },
];

const STATUS_COLOR: Record<string, string> = {
  "In Flight": "#00d4ff", Preparing: "#f59e0b", "Ready to Fulfill": "#a78bfa", Queued: "#a78bfa",
  Delivered: "#22c55e", Failed: "#ef4444", "Out for Delivery": "#00d4ff",
};

type DroneOption = { id: string; capacity: string; etaMin: number; cost: number; battery: number; available: boolean };
const DRONE_OPTIONS: DroneOption[] = [
  { id: "DR-03", capacity: "2.5 kg",  etaMin: 8,  cost: 3.50, battery: 100, available: true  },
  { id: "DR-09", capacity: "2.5 kg",  etaMin: 11, cost: 3.50, battery: 87,  available: true  },
  { id: "DR-14", capacity: "5.0 kg",  etaMin: 14, cost: 5.20, battery: 94,  available: true  },
  { id: "DR-07", capacity: "2.5 kg",  etaMin: 6,  cost: 3.50, battery: 68,  available: false },
  { id: "DR-12", capacity: "2.5 kg",  etaMin: 18, cost: 3.50, battery: 91,  available: false },
  { id: "DR-05", capacity: "2.5 kg",  etaMin: 0,  cost: 0,    battery: 22,  available: false },
];

type SellerCard = { id: string; brand: string; last4: string; expMonth: string; expYear: string; holderName: string };
const SELLER_CARD_BRAND_COLOR: Record<string, string> = { Visa: "#1a1f71", Mastercard: "#eb001b", Amex: "#007bc1", Discover: "#f76f20" };
const INITIAL_SELLER_CARDS: SellerCard[] = [
  { id: "sc-1", brand: "Mastercard", last4: "8821", expMonth: "03", expYear: "26", holderName: "TechGoods Store" },
];

type SellerCardForm = { holderName: string; number: string; expMonth: string; expYear: string; cvv: string; saveCard: boolean };
function emptySellerCardForm(): SellerCardForm { return { holderName: "", number: "", expMonth: "", expYear: "", cvv: "", saveCard: true }; }
function sellerDetectBrand(num: string): string { const n = num.replace(/\s/g, ""); if (/^4/.test(n)) return "Visa"; if (/^5[1-5]/.test(n)) return "Mastercard"; if (/^3[47]/.test(n)) return "Amex"; if (/^6(?:011|5)/.test(n)) return "Discover"; return "Visa"; }
function sellerFormatCard(raw: string): string { return raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); }

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

// ── Analytics data ────────────────────────────────────────
const DAILY_ORDERS = [
  { x: "Mon 9/14", y: 142 }, { x: "Tue 9/15", y: 178 }, { x: "Wed 9/16", y: 163 },
  { x: "Thu 9/17", y: 191 }, { x: "Fri 9/18", y: 155 }, { x: "Sat 9/19", y: 209 },
  { x: "Sun 9/20", y: 183 },
];
const WEEKLY_REVENUE = [
  { x: "Wk 33", y: 28400 }, { x: "Wk 34", y: 31200 }, { x: "Wk 35", y: 29850 },
  { x: "Wk 36", y: 35600 }, { x: "Wk 37", y: 33100 }, { x: "Wk 38", y: 38700 },
];
const MONTHLY_DELIVERIES = [
  { x: "Apr", y: 3820 }, { x: "May", y: 4150 }, { x: "Jun", y: 4410 },
  { x: "Jul", y: 4780 }, { x: "Aug", y: 5120 }, { x: "Sep", y: 5305 },
];
const ACTIVE_CUSTOMERS = [
  { x: "Apr", y: 610 }, { x: "May", y: 740 }, { x: "Jun", y: 810 },
  { x: "Jul", y: 870 }, { x: "Aug", y: 950 }, { x: "Sep", y: 1040 },
];
const DRONE_DISPATCHES = [
  { x: "Mon 9/14", y: 138 }, { x: "Tue 9/15", y: 172 }, { x: "Wed 9/16", y: 159 },
  { x: "Thu 9/17", y: 185 }, { x: "Fri 9/18", y: 150 }, { x: "Sat 9/19", y: 201 },
  { x: "Sun 9/20", y: 177 },
];

// ── LineChart component ───────────────────────────────────
type ChartSeries = { data: { x: string; y: number }[]; color: string; label?: string };

function niceMax(raw: number): number {
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const candidates = [1, 2, 2.5, 5, 10].map((f) => f * mag);
  return candidates.find((c) => c >= raw) ?? raw;
}

function LineChart({
  title, xLabel, yLabel, series, formatY = String, id,
}: {
  title: string; xLabel: string; yLabel: string;
  series: ChartSeries[]; formatY?: (v: number) => string; id: string;
}) {
  const [hov, setHov] = useState<{ si: number; di: number } | null>(null);

  // Chart geometry — all in SVG user units
  const PL = 52; const PR = 12; const PT = 10; const PB = 32;
  const W = 420; const H = 200;
  const CW = W - PL - PR; const CH = H - PT - PB;

  const allY = series.flatMap((s) => s.data.map((d) => d.y));
  const rawMax = Math.max(...allY, 1);
  const yMax = niceMax(rawMax * 1.1);
  const yMin = 0;
  const yRange = yMax - yMin;

  const xLabels = series[0].data.map((d) => d.x);
  const n = xLabels.length;

  function px(i: number) { return PL + (i / (n - 1)) * CW; }
  function py(v: number) { return PT + CH - ((v - yMin) / yRange) * CH; }

  // Y-axis ticks: 5 evenly spaced
  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => yMin + (i / tickCount) * yRange);

  // X-axis ticks: every point (trim label if too many)
  const showEvery = n <= 8 ? 1 : n <= 14 ? 2 : 3;

  const hasMultipleSeries = series.length > 1;
  const gradId = `grad-${id}`;

  return (
    <div className="border rounded-2xl p-5" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
      {/* Title */}
      <p className="text-sm font-bold mb-1" style={{ color: "var(--g-tx)" }}>{title}</p>

      {/* Legend — only for multi-series */}
      {hasMultipleSeries && (
        <div className="flex gap-4 mb-3">
          {series.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[10px] font-mono" style={{ color: "var(--g-tx2)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* SVG chart */}
      <div className="relative w-full" style={{ aspectRatio: `${W}/${H}` }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-full overflow-visible"
          onMouseLeave={() => setHov(null)}
        >
          <defs>
            {series.map((s, si) => (
              <linearGradient key={si} id={`${gradId}-${si}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.18" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines */}
          {yTicks.map((v, i) => (
            <line key={i} x1={PL} x2={PL + CW} y1={py(v)} y2={py(v)}
              stroke="var(--g-bd)" strokeWidth="0.5" strokeDasharray={i === 0 ? "none" : "3 3"} />
          ))}
          {/* Baseline */}
          <line x1={PL} x2={PL + CW} y1={py(yMin)} y2={py(yMin)} stroke="var(--g-bd)" strokeWidth="1" />
          {/* Y axis */}
          <line x1={PL} x2={PL} y1={PT} y2={PT + CH} stroke="var(--g-bd)" strokeWidth="1" />

          {/* Y-axis ticks & labels */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={PL - 4} x2={PL} y1={py(v)} y2={py(v)} stroke="var(--g-bd)" strokeWidth="1" />
              <text x={PL - 7} y={py(v) + 4} textAnchor="end" fontSize={9}
                fill="var(--g-tx2)" fontFamily="'JetBrains Mono',monospace">
                {formatY(Math.round(v))}
              </text>
            </g>
          ))}

          {/* Y-axis label (rotated) */}
          <text
            x={10} y={PT + CH / 2}
            textAnchor="middle" fontSize={9} fill="var(--g-tx4)"
            fontFamily="'Inter',sans-serif" fontWeight={600}
            transform={`rotate(-90, 10, ${PT + CH / 2})`}
          >
            {yLabel}
          </text>

          {/* X-axis ticks & labels */}
          {xLabels.map((lbl, i) => (
            i % showEvery === 0 && (
              <g key={i}>
                <line x1={px(i)} x2={px(i)} y1={py(yMin)} y2={py(yMin) + 4} stroke="var(--g-bd)" strokeWidth="1" />
                <text x={px(i)} y={py(yMin) + 14} textAnchor="middle" fontSize={9}
                  fill="var(--g-tx2)" fontFamily="'JetBrains Mono',monospace">
                  {lbl}
                </text>
              </g>
            )
          ))}

          {/* X-axis label */}
          <text x={PL + CW / 2} y={H - 2} textAnchor="middle" fontSize={9}
            fill="var(--g-tx4)" fontFamily="'Inter',sans-serif" fontWeight={600}>
            {xLabel}
          </text>

          {/* Area fills */}
          {series.map((s, si) => {
            const pts = s.data.map((d, i) => ({ x: px(i), y: py(d.y) }));
            const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
            const area = `${line} L${pts[pts.length - 1].x},${py(yMin)} L${pts[0].x},${py(yMin)} Z`;
            return <path key={si} d={area} fill={`url(#${gradId}-${si})`} />;
          })}

          {/* Lines */}
          {series.map((s, si) => {
            const pts = s.data.map((d, i) => ({ x: px(i), y: py(d.y) }));
            const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
            return (
              <path key={si} d={line} fill="none" stroke={s.color}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            );
          })}

          {/* Dots + hover targets */}
          {series.map((s, si) =>
            s.data.map((d, di) => {
              const isH = hov?.si === si && hov.di === di;
              return (
                <g key={`${si}-${di}`}>
                  <circle cx={px(di)} cy={py(d.y)} r={isH ? 4 : 2.5}
                    fill={isH ? s.color : "var(--g-s1)"} stroke={s.color} strokeWidth="1.5"
                    style={{ transition: "r 0.1s" }} />
                  <circle cx={px(di)} cy={py(d.y)} r={10} fill="transparent"
                    style={{ cursor: "crosshair" }}
                    onMouseEnter={() => setHov({ si, di })}
                  />
                </g>
              );
            })
          )}

          {/* Tooltip */}
          {hov && (() => {
            const s = series[hov.si];
            const d = s.data[hov.di];
            const tx = px(hov.di);
            const ty = py(d.y);
            const label = hasMultipleSeries ? `${s.label}: ${formatY(d.y)}` : formatY(d.y);
            const boxW = Math.max(label.length * 5.8 + 16, 60);
            const boxX = Math.min(tx - boxW / 2, W - boxW - 4);
            const boxY = ty - 32;
            return (
              <g pointerEvents="none">
                <rect x={boxX} y={boxY} width={boxW} height={20} rx={5}
                  fill={s.color} />
                <text x={boxX + boxW / 2} y={boxY + 13} textAnchor="middle" fontSize={10}
                  fill="#070b10" fontWeight={700} fontFamily="'JetBrains Mono',monospace">
                  {label}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="font-bold text-xl" style={{ color: "var(--g-tx)" }}>Analytics — Sept 2026</h2>

      {/* KPI summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Total Orders",   v: "1,221", c: "#f59e0b" },
          { l: "Revenue",        v: "$196.9k", c: "#22c55e" },
          { l: "Deliveries",     v: "5,305", c: "#00d4ff" },
          { l: "Active Customers", v: "1,040", c: "#a78bfa" },
        ].map((s) => (
          <div key={s.l} className="border rounded-xl p-4" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
            <p className="text-xs mb-1" style={{ color: "var(--g-tx2)" }}>{s.l}</p>
            <p className="font-mono text-xl font-bold" style={{ color: s.c }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Row 1: Daily Orders + Weekly Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LineChart
          id="daily-orders"
          title="Daily Orders"
          xLabel="Day"
          yLabel="Orders"
          series={[{ data: DAILY_ORDERS, color: "#f59e0b" }]}
        />
        <LineChart
          id="weekly-revenue"
          title="Weekly Revenue"
          xLabel="Week"
          yLabel="Revenue ($)"
          series={[{ data: WEEKLY_REVENUE, color: "#22c55e" }]}
          formatY={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
      </div>

      {/* Row 2: Monthly Deliveries (full width) */}
      <LineChart
        id="monthly-deliveries"
        title="Monthly Deliveries"
        xLabel="Month"
        yLabel="Deliveries"
        series={[{ data: MONTHLY_DELIVERIES, color: "#00d4ff" }]}
      />

      {/* Row 3: Active Customers + Drone Dispatches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LineChart
          id="active-customers"
          title="Active Customers Over Time"
          xLabel="Month"
          yLabel="Customers"
          series={[{ data: ACTIVE_CUSTOMERS, color: "#a78bfa" }]}
        />
        <LineChart
          id="drone-dispatches"
          title="Drone Dispatches Per Day"
          xLabel="Day"
          yLabel="Dispatches"
          series={[{ data: DRONE_DISPATCHES, color: "#f59e0b" }]}
        />
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
  const { addTicket, tickets } = useTickets();

  const SELLER_TICKET_STATUS_COLOR: Record<string, { bg: string; text: string; border: string }> = {
    "Open":                  { bg: "#f59e0b18", text: "#f59e0b", border: "#f59e0b44" },
    "In Review":             { bg: "#fb923c18", text: "#fb923c", border: "#fb923c44" },
    "Waiting for Customer":  { bg: "#a78bfa18", text: "#a78bfa", border: "#a78bfa44" },
    "Waiting for Support":   { bg: "#00d4ff18", text: "#00d4ff", border: "#00d4ff44" },
    "Resolved":              { bg: "#22c55e18", text: "#22c55e", border: "#22c55e44" },
    "Closed":                { bg: "var(--g-s2)",  text: "var(--g-tx3)", border: "var(--g-bd)" },
  };
  const SELLER_PRIORITY_COLOR: Record<string, string> = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };

  const [sellerTicketStatusFilter, setSellerTicketStatusFilter] = useState("All");
  const [sellerTicketSort, setSellerTicketSort] = useState<"newest" | "oldest">("newest");
  const [openSellerTicketId, setOpenSellerTicketId] = useState<string | null>(null);

  const mySellerTickets = tickets.filter((t) => t.from === "seller" && t.fromName === "TechGoods Store");
  const visibleSellerTickets = (() => {
    let list = sellerTicketStatusFilter === "All" ? mySellerTickets : mySellerTickets.filter((t) => t.status === sellerTicketStatusFilter);
    return sellerTicketSort === "oldest" ? [...list].reverse() : list;
  })();
  const openSellerTicket = openSellerTicketId ? mySellerTickets.find((t) => t.id === openSellerTicketId) ?? null : null;

  // ── Orders state (mutable so status can update after dispatch) ──
  const [orders, setOrders] = useState<SellerOrder[]>(INITIAL_ORDERS);

  // ── Orders filter / sort state ──
  type OrderSortKey = "newest" | "oldest" | "customer" | "value-desc" | "value-asc";
  const ORDER_STATUS_OPTIONS = ["All", "New", "Paid", "Ready to Fulfill", "Drone Selected", "Out for Delivery", "Delivered", "Cancelled"] as const;
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("All");
  const [orderSort, setOrderSort] = useState<OrderSortKey>("newest");

  const filtersActive = orderStatusFilter !== "All" || orderSort !== "newest";

  function clearOrderFilters() { setOrderStatusFilter("All"); setOrderSort("newest"); }

  const visibleOrders = (() => {
    let list = [...orders];
    if (orderStatusFilter !== "All") list = list.filter((o) => o.status === orderStatusFilter);
    switch (orderSort) {
      case "oldest":     list.sort((a, b) => a.id.localeCompare(b.id)); break;
      case "customer":   list.sort((a, b) => a.customer.localeCompare(b.customer)); break;
      case "value-desc": list.sort((a, b) => parseFloat(b.value.replace(/[^0-9.]/g, "")) - parseFloat(a.value.replace(/[^0-9.]/g, ""))); break;
      case "value-asc":  list.sort((a, b) => parseFloat(a.value.replace(/[^0-9.]/g, "")) - parseFloat(b.value.replace(/[^0-9.]/g, ""))); break;
      default:           list.sort((a, b) => b.id.localeCompare(a.id)); break; // newest
    }
    return list;
  })();

  // ── Fulfillment flow ──
  type FulfillStep = "drone" | "payment" | "review" | "dispatched";
  const [fulfillOrderId, setFulfillOrderId] = useState<string | null>(null);
  const [fulfillStep, setFulfillStep] = useState<FulfillStep>("drone");
  const [fulfillDroneId, setFulfillDroneId] = useState<string>("");
  const [sellerCards, setSellerCards] = useState<SellerCard[]>(INITIAL_SELLER_CARDS);
  const [sellerCardId, setSellerCardId] = useState<string>("sc-1");
  const [showSellerCardForm, setShowSellerCardForm] = useState(false);
  const [sellerCardForm, setSellerCardForm] = useState<SellerCardForm>(emptySellerCardForm());

  const fulfillOrder = fulfillOrderId ? orders.find((o) => o.id === fulfillOrderId) ?? null : null;
  const fulfillDrone = DRONE_OPTIONS.find((d) => d.id === fulfillDroneId) ?? null;
  const fulfillCard = sellerCards.find((c) => c.id === sellerCardId) ?? null;

  function startFulfill(orderId: string) {
    setFulfillOrderId(orderId);
    setFulfillStep("drone");
    setFulfillDroneId("");
    setShowSellerCardForm(false);
    setSellerCardForm(emptySellerCardForm());
  }

  function cancelFulfill() { setFulfillOrderId(null); }

  function submitSellerCard() {
    const digits = sellerCardForm.number.replace(/\s/g, "");
    const brand = sellerDetectBrand(digits);
    const last4 = digits.slice(-4);
    const newId = `sc-${Date.now()}`;
    if (sellerCardForm.saveCard) {
      setSellerCards((prev) => [...prev, { id: newId, brand, last4, expMonth: sellerCardForm.expMonth, expYear: sellerCardForm.expYear, holderName: sellerCardForm.holderName }]);
      setSellerCardId(newId);
    } else {
      const tempId = `sc-temp-${Date.now()}`;
      setSellerCards((prev) => [...prev.filter((c) => !c.id.startsWith("sc-temp-")), { id: tempId, brand, last4, expMonth: sellerCardForm.expMonth, expYear: sellerCardForm.expYear, holderName: sellerCardForm.holderName }]);
      setSellerCardId(tempId);
    }
    setShowSellerCardForm(false);
    setSellerCardForm(emptySellerCardForm());
  }

  function dispatchDrone() {
    if (!fulfillOrderId || !fulfillDrone) return;
    setOrders((prev) => prev.map((o) => o.id === fulfillOrderId
      ? { ...o, status: "Out for Delivery", drone: fulfillDrone.id, eta: `${fulfillDrone.etaMin} min` }
      : o));
    setFulfillStep("dispatched");
  }

  const sellerCardFormValid =
    sellerCardForm.holderName.trim() &&
    sellerCardForm.number.replace(/\s/g, "").length >= 15 &&
    sellerCardForm.expMonth && sellerCardForm.expYear && sellerCardForm.cvv.length >= 3;

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


      <div className="relative z-10 flex flex-col flex-1">
        <DashHeader role="Seller" name="TechGoods Store" onLogout={onLogout} accent="#f59e0b" />

        <div className="border-b px-2 overflow-x-auto shrink-0" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
          <div className="flex min-w-max">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
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
          {tab === "orders" && (() => {
            // ── Fulfillment flow ─────────────────────────────────────────
            if (fulfillOrder) {
              const shippingCost = fulfillDrone?.cost ?? 0;
              const tax = parseFloat((shippingCost * 0.09).toFixed(2));
              const shippingTotal = parseFloat((shippingCost + tax).toFixed(2));
              const brandColor = (b: string) => SELLER_CARD_BRAND_COLOR[b] ?? "#f59e0b";

              // ── Dispatched confirmation ──────────────────────────────
              if (fulfillStep === "dispatched") return (
                <div className="max-w-md mx-auto flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center mb-5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2.5} className="w-7 h-7">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold mb-1" style={{ color: "var(--g-tx)" }}>Drone dispatched!</h2>
                  <p className="text-sm text-center mb-1" style={{ color: "var(--g-tx3)" }}>
                    {fulfillDrone?.id} is now en route to {fulfillOrder.deliveryName}.
                  </p>
                  <p className="font-mono text-xs mb-1" style={{ color: "var(--g-tx2)" }}>
                    Order {fulfillOrder.id} · Status: Out for Delivery
                  </p>
                  <p className="font-mono text-xs mb-6" style={{ color: "var(--g-tx2)" }}>
                    ETA ~{fulfillDrone?.etaMin} min · Shipping charged: ${shippingTotal.toFixed(2)}
                  </p>
                  <button
                    onClick={cancelFulfill}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
                    style={{ backgroundColor: "#f59e0b", color: "#070b10" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d97706")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f59e0b")}
                  >
                    ← Back to orders
                  </button>
                </div>
              );

              return (
                <div className="max-w-2xl mx-auto space-y-5">
                  {/* Header */}
                  <div>
                    <button onClick={cancelFulfill} className="flex items-center gap-1.5 text-xs mb-3 hover:opacity-70" style={{ color: "var(--g-tx2)" }}>
                      ← Back to orders
                    </button>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="font-bold text-xl" style={{ color: "var(--g-tx)" }}>Fulfill Order</h2>
                      <span className="font-mono text-xs text-[#f59e0b]">{fulfillOrder.id}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border" style={{ color: STATUS_COLOR[fulfillOrder.status], borderColor: STATUS_COLOR[fulfillOrder.status] + "44", backgroundColor: STATUS_COLOR[fulfillOrder.status] + "10" }}>
                        {fulfillOrder.status}
                      </span>
                    </div>
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mt-3">
                      {(["drone", "payment", "review"] as const).map((s, i) => {
                        const labels = ["1. Select Drone", "2. Payment", "3. Review"];
                        const done = (["drone", "payment", "review"] as const).indexOf(fulfillStep) > i;
                        const active = fulfillStep === s;
                        return (
                          <div key={s} className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold transition-colors"
                              style={{ color: active ? "#f59e0b" : done ? "#22c55e" : "var(--g-tx4)" }}>
                              {labels[i]}
                            </span>
                            {i < 2 && <span className="text-[10px]" style={{ color: "var(--g-tx4)" }}>›</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order info card — always visible */}
                  <div className="border rounded-xl p-4 space-y-3" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                    <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--g-tx4)" }}>Order details</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                      <div>
                        <span style={{ color: "var(--g-tx2)" }}>Customer</span>
                        <p className="font-semibold mt-0.5" style={{ color: "var(--g-tx)" }}>{fulfillOrder.customer}</p>
                      </div>
                      <div>
                        <span style={{ color: "var(--g-tx2)" }}>Order value</span>
                        <p className="font-mono font-bold mt-0.5" style={{ color: "#22c55e" }}>{fulfillOrder.value}</p>
                      </div>
                      <div>
                        <span style={{ color: "var(--g-tx2)" }}>Package weight</span>
                        <p className="font-mono mt-0.5" style={{ color: "var(--g-tx)" }}>{fulfillOrder.weight}</p>
                      </div>
                      <div>
                        <span style={{ color: "var(--g-tx2)" }}>Dimensions</span>
                        <p className="font-mono mt-0.5" style={{ color: "var(--g-tx)" }}>{fulfillOrder.dimensions}</p>
                      </div>
                    </div>
                    {/* Products */}
                    <div className="border-t pt-3" style={{ borderColor: "var(--g-bd)" }}>
                      <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: "var(--g-tx4)" }}>Items</p>
                      {fulfillOrder.products.map((p) => (
                        <div key={p.sku} className="flex items-center justify-between text-xs py-1">
                          <div>
                            <span style={{ color: "var(--g-tx)" }}>{p.name}</span>
                            <span className="ml-2 font-mono text-[10px]" style={{ color: "var(--g-tx4)" }}>{p.sku}</span>
                          </div>
                          <span className="font-mono font-semibold" style={{ color: "var(--g-tx2)" }}>×{p.qty}</span>
                        </div>
                      ))}
                    </div>
                    {/* Delivery address */}
                    <div className="border-t pt-3" style={{ borderColor: "var(--g-bd)" }}>
                      <p className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: "var(--g-tx4)" }}>Shipping to</p>
                      <p className="text-xs font-semibold" style={{ color: "var(--g-tx)" }}>{fulfillOrder.deliveryName}</p>
                      <p className="text-xs" style={{ color: "var(--g-tx3)" }}>{fulfillOrder.deliveryAddress}</p>
                    </div>
                  </div>

                  {/* ── STEP 1: Drone selection ───────────────────────────── */}
                  {fulfillStep === "drone" && (() => {
                    const nowNoFly = currentHourIsNoFly();
                    const noFlyBlocks = noFlyWindows();
                    const flyableHrs = availableFlyHours();
                    const selDroneConflict = fulfillDroneId
                      ? deliveryConflictsNoFly(DRONE_OPTIONS.find((d) => d.id === fulfillDroneId)?.etaMin ?? 0)
                      : false;
                    const droneStepBlocked = nowNoFly || selDroneConflict;
                    return (
                    <>
                      {/* No-fly banner */}
                      {(nowNoFly || selDroneConflict) && (
                        <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: "#ef444410", borderColor: "#ef444440" }}>
                          <div className="flex items-start gap-2.5">
                            <span className="text-base shrink-0">🚫</span>
                            <div>
                              <p className="text-sm font-bold" style={{ color: "#ef4444" }}>
                                {nowNoFly ? "No-fly restriction active now" : "Delivery would enter no-fly window"}
                              </p>
                              <p className="text-xs mt-0.5" style={{ color: "var(--g-tx3)" }}>
                                Restriction: <span className="font-mono font-semibold">{noFlyBlocks.map((b) => b.split("–").map(fmt12).join("–")).join(", ")}</span>.
                                {nowNoFly ? " Drone dispatch is currently suspended." : " The selected drone's ETA would arrive during a restricted period."}
                              </p>
                            </div>
                          </div>
                          {!nowNoFly && (
                            <div>
                              <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--g-tx2)" }}>Next available dispatch windows:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {flyableHrs
                                  .filter((h) => parseInt(h) >= new Date().getHours())
                                  .slice(0, 6)
                                  .map((h) => (
                                    <span key={h} className="font-mono text-[10px] px-2 py-1 rounded-lg border"
                                      style={{ backgroundColor: "#22c55e10", borderColor: "#22c55e44", color: "#22c55e" }}>
                                      {fmt12(h)}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold mb-3" style={{ color: "var(--g-tx)" }}>Select a delivery drone</p>
                        <div className="space-y-2">
                          {DRONE_OPTIONS.map((d) => {
                            const isSel = d.id === fulfillDroneId;
                            const batColor = d.battery > 50 ? "#22c55e" : d.battery > 25 ? "#f59e0b" : "#ef4444";
                            const droneConflict = d.available && deliveryConflictsNoFly(d.etaMin);
                            const droneDisabled = !d.available || droneConflict || nowNoFly;
                            return (
                              <div
                                key={d.id}
                                onClick={() => !droneDisabled && setFulfillDroneId(d.id)}
                                className="rounded-xl border p-4 transition-all"
                                style={{
                                  cursor: droneDisabled ? "not-allowed" : "pointer",
                                  backgroundColor: isSel ? "#f59e0b0e" : droneConflict ? "#ef444408" : "var(--g-s1)",
                                  borderColor: isSel ? "#f59e0b" : droneConflict ? "#ef444430" : "var(--g-bd)",
                                  boxShadow: isSel ? "0 0 0 1px #f59e0b33" : "none",
                                  opacity: droneDisabled ? 0.45 : 1,
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                                    style={{ borderColor: isSel ? "#f59e0b" : "var(--g-bd)", backgroundColor: isSel ? "#f59e0b" : "transparent" }}>
                                    {isSel && <div className="w-1.5 h-1.5 rounded-full bg-[#070b10]" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <span className="font-mono text-sm font-bold" style={{ color: "var(--g-tx)" }}>{d.id}</span>
                                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full border"
                                        style={{ color: d.available ? "#22c55e" : "#ef4444", borderColor: (d.available ? "#22c55e" : "#ef4444") + "44", backgroundColor: (d.available ? "#22c55e" : "#ef4444") + "10" }}>
                                        {d.available ? "Available" : "Unavailable"}
                                      </span>
                                      {droneConflict && (
                                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full border"
                                          style={{ color: "#ef4444", borderColor: "#ef444444", backgroundColor: "#ef444410" }}>
                                          No-fly conflict
                                        </span>
                                      )}
                                      {isSel && <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#f59e0b] text-[#070b10]">SELECTED</span>}
                                    </div>
                                    <div className="grid grid-cols-3 gap-x-4 gap-y-0.5 text-xs" style={{ color: "var(--g-tx3)" }}>
                                      <span>Capacity: <span className="font-mono font-semibold" style={{ color: "var(--g-tx)" }}>{d.capacity}</span></span>
                                      <span>ETA: <span className="font-mono font-semibold" style={{ color: "var(--g-tx)" }}>~{d.etaMin} min</span></span>
                                      <span>Cost: <span className="font-mono font-semibold" style={{ color: "#f59e0b" }}>${d.cost.toFixed(2)}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--g-s2)" }}>
                                        <div className="h-full rounded-full" style={{ width: `${d.battery}%`, backgroundColor: batColor }} />
                                      </div>
                                      <span className="font-mono text-[9px]" style={{ color: batColor }}>{d.battery}%</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        disabled={!fulfillDroneId || droneStepBlocked}
                        onClick={() => setFulfillStep("payment")}
                        className="w-full rounded-xl py-3.5 text-base font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "#f59e0b", color: "#070b10" }}
                        onMouseEnter={(e) => { if (fulfillDroneId && !droneStepBlocked) e.currentTarget.style.backgroundColor = "#d97706"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f59e0b"; }}
                      >
                        {droneStepBlocked ? "Dispatch unavailable — no-fly restriction" : "Continue to payment →"}
                      </button>
                    </>
                    );
                  })()}

                  {/* ── STEP 2: Seller payment ────────────────────────────── */}
                  {fulfillStep === "payment" && (
                    <>
                      <div>
                        <p className="text-sm font-semibold mb-1" style={{ color: "var(--g-tx)" }}>Shipping payment</p>
                        <p className="text-xs mb-3" style={{ color: "var(--g-tx3)" }}>Select a payment method for the drone delivery charge.</p>

                        {/* Saved cards */}
                        {sellerCards.length > 0 && !showSellerCardForm && (
                          <div className="space-y-2">
                            {sellerCards.map((card) => {
                              const isSel = card.id === sellerCardId;
                              return (
                                <div
                                  key={card.id}
                                  onClick={() => setSellerCardId(card.id)}
                                  className="rounded-xl border p-4 cursor-pointer transition-all"
                                  style={{
                                    backgroundColor: isSel ? "#f59e0b0e" : "var(--g-s1)",
                                    borderColor: isSel ? "#f59e0b" : "var(--g-bd)",
                                    boxShadow: isSel ? "0 0 0 1px #f59e0b33" : "none",
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                                      style={{ borderColor: isSel ? "#f59e0b" : "var(--g-bd)", backgroundColor: isSel ? "#f59e0b" : "transparent" }}>
                                      {isSel && <div className="w-1.5 h-1.5 rounded-full bg-[#070b10]" />}
                                    </div>
                                    <div className="w-10 h-6 rounded flex items-center justify-center shrink-0 text-[9px] font-black text-white"
                                      style={{ backgroundColor: brandColor(card.brand) }}>
                                      {card.brand === "Mastercard" ? "MC" : card.brand.slice(0, 4).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold" style={{ color: "var(--g-tx)" }}>{card.brand} •••• {card.last4}</p>
                                        {isSel && <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#f59e0b] text-[#070b10]">SELECTED</span>}
                                      </div>
                                      <p className="text-xs" style={{ color: "var(--g-tx2)" }}>{card.holderName} · Expires {card.expMonth}/{card.expYear}</p>
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setSellerCards((prev) => prev.filter((c) => c.id !== card.id)); if (sellerCardId === card.id) setSellerCardId(""); }}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 shrink-0"
                                      style={{ backgroundColor: "var(--g-s2)", color: "#ef4444" }}
                                    >
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add new payment method */}
                        {!showSellerCardForm ? (
                          <button
                            onClick={() => { setShowSellerCardForm(true); setSellerCardId(""); setSellerCardForm(emptySellerCardForm()); }}
                            className="w-full border rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold mt-2 transition-colors hover:opacity-80"
                            style={{ borderColor: "#f59e0b44", borderStyle: "dashed", color: "#f59e0b", backgroundColor: "#f59e0b08" }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add new payment method
                          </button>
                        ) : (
                          <div className="border rounded-2xl p-4 space-y-3 mt-2" style={{ backgroundColor: "var(--g-s1)", borderColor: "#f59e0b44" }}>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold" style={{ color: "var(--g-tx)" }}>New card</p>
                              {sellerCards.length > 0 && (
                                <button onClick={() => { setShowSellerCardForm(false); setSellerCardId(sellerCards[0].id); }} className="text-xs hover:opacity-70" style={{ color: "var(--g-tx2)" }}>← Use saved</button>
                              )}
                            </div>
                            {[
                              { label: "Cardholder name", key: "holderName" as const, placeholder: "TechGoods Store", type: "text" },
                              { label: "Card number", key: "number" as const, placeholder: "1234 5678 9012 3456", type: "text" },
                            ].map(({ label, key, placeholder }) => (
                              <div key={key}>
                                <label className="text-xs font-medium block mb-1" style={{ color: "var(--g-tx2)" }}>{label}</label>
                                <input
                                  value={sellerCardForm[key]}
                                  onChange={(e) => setSellerCardForm((f) => ({ ...f, [key]: key === "number" ? sellerFormatCard(e.target.value) : e.target.value }))}
                                  placeholder={placeholder}
                                  maxLength={key === "number" ? 19 : undefined}
                                  className="w-full border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none transition-colors"
                                  style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                                  onFocus={(e) => (e.currentTarget.style.borderColor = "#f59e0b66")}
                                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--g-bd)")}
                                />
                              </div>
                            ))}
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { label: "Month", key: "expMonth" as const, placeholder: "MM", max: 2 },
                                { label: "Year", key: "expYear" as const, placeholder: "YY", max: 2 },
                                { label: "CVV", key: "cvv" as const, placeholder: "•••", max: 4 },
                              ].map(({ label, key, placeholder, max }) => (
                                <div key={key}>
                                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--g-tx2)" }}>{label}</label>
                                  <input
                                    value={sellerCardForm[key]}
                                    onChange={(e) => setSellerCardForm((f) => ({ ...f, [key]: e.target.value.replace(/\D/g, "").slice(0, max) }))}
                                    placeholder={placeholder}
                                    maxLength={max}
                                    type={key === "cvv" ? "password" : "text"}
                                    className="w-full border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none transition-colors"
                                    style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                                    onFocus={(e) => (e.currentTarget.style.borderColor = "#f59e0b66")}
                                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--g-bd)")}
                                  />
                                </div>
                              ))}
                            </div>
                            <label className="flex items-center gap-2.5 cursor-pointer">
                              <button type="button" onClick={() => setSellerCardForm((f) => ({ ...f, saveCard: !f.saveCard }))}
                                className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                                style={{ borderColor: sellerCardForm.saveCard ? "#f59e0b" : "var(--g-bd)", backgroundColor: sellerCardForm.saveCard ? "#f59e0b" : "transparent" }}>
                                {sellerCardForm.saveCard && <svg viewBox="0 0 24 24" fill="none" stroke="#070b10" strokeWidth={3} className="w-2.5 h-2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                              </button>
                              <span className="text-xs" style={{ color: "var(--g-tx3)" }}>Save this card for future shipments</span>
                            </label>
                            <button disabled={!sellerCardFormValid} onClick={submitSellerCard}
                              className="w-full rounded-xl py-2.5 text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              style={{ backgroundColor: "#f59e0b", color: "#070b10" }}>
                              Use this card
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Shipping cost breakdown */}
                      {fulfillDrone && (
                        <div className="border rounded-xl overflow-hidden" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--g-bd)" }}>
                            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--g-tx4)" }}>Shipping cost breakdown</p>
                          </div>
                          <div className="px-4 py-3 space-y-1.5">
                            <div className="flex justify-between text-xs" style={{ color: "var(--g-tx3)" }}>
                              <span>Drone fee ({fulfillDrone.id})</span>
                              <span className="font-mono">${fulfillDrone.cost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs" style={{ color: "var(--g-tx3)" }}>
                              <span>Platform fee (9%)</span>
                              <span className="font-mono">${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold pt-2 border-t" style={{ borderColor: "var(--g-bd)", color: "var(--g-tx)" }}>
                              <span>Shipping total</span>
                              <span className="font-mono">${shippingTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button onClick={() => setFulfillStep("drone")} className="flex-1 py-2.5 rounded-xl text-sm border transition-colors hover:opacity-80"
                          style={{ borderColor: "var(--g-bd)", color: "var(--g-tx2)" }}>
                          ← Back
                        </button>
                        <button
                          disabled={!fulfillCard || showSellerCardForm}
                          onClick={() => setFulfillStep("review")}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ backgroundColor: "#f59e0b", color: "#070b10" }}
                          onMouseEnter={(e) => { if (fulfillCard && !showSellerCardForm) e.currentTarget.style.backgroundColor = "#d97706"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f59e0b"; }}
                        >
                          Review →
                        </button>
                      </div>
                    </>
                  )}

                  {/* ── STEP 3: Review & dispatch ─────────────────────────── */}
                  {fulfillStep === "review" && fulfillDrone && fulfillCard && (
                    <>
                      <div className="border rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--g-bd)" }}>
                          <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--g-tx4)" }}>Fulfillment review</p>
                        </div>
                        {[
                          { label: "Order", value: `${fulfillOrder.id} · ${fulfillOrder.customer}` },
                          { label: "Items", value: fulfillOrder.products.map((p) => `${p.name} ×${p.qty}`).join(", ") },
                          { label: "Delivery address", value: `${fulfillOrder.deliveryName} · ${fulfillOrder.deliveryAddress}` },
                          { label: "Drone", value: `${fulfillDrone.id} · Capacity ${fulfillDrone.capacity}` },
                          { label: "Estimated delivery", value: `~${fulfillDrone.etaMin} min` },
                          { label: "Shipping cost", value: `$${shippingTotal.toFixed(2)} (incl. fees)` },
                          { label: "Payment method", value: `${fulfillCard.brand} •••• ${fulfillCard.last4} · ${fulfillCard.holderName}` },
                        ].map((row) => (
                          <div key={row.label} className="px-5 py-3 flex gap-4 border-b last:border-0" style={{ borderColor: "var(--g-s2)" }}>
                            <span className="text-xs w-36 shrink-0 pt-0.5" style={{ color: "var(--g-tx2)" }}>{row.label}</span>
                            <span className="text-xs font-medium flex-1" style={{ color: "var(--g-tx)" }}>{row.value}</span>
                          </div>
                        ))}
                      </div>

                      {(() => {
                        const dispatchBlocked = currentHourIsNoFly() || (fulfillDrone ? deliveryConflictsNoFly(fulfillDrone.etaMin) : false);
                        const dispatchNoFlyBlocks = noFlyWindows();
                        return (
                          <>
                            {dispatchBlocked && (
                              <div className="rounded-xl border p-4" style={{ backgroundColor: "#ef444410", borderColor: "#ef444440" }}>
                                <div className="flex items-start gap-2.5">
                                  <span className="text-base shrink-0">🚫</span>
                                  <div>
                                    <p className="text-sm font-bold" style={{ color: "#ef4444" }}>Dispatch blocked — no-fly restriction</p>
                                    <p className="text-xs mt-0.5" style={{ color: "var(--g-tx3)" }}>
                                      Restriction active: <span className="font-mono font-semibold">{dispatchNoFlyBlocks.map((b) => b.split("–").map(fmt12).join("–")).join(", ")}</span>.
                                      Return to drone selection and choose a drone that delivers outside this window.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button onClick={() => setFulfillStep("payment")} className="flex-1 py-2.5 rounded-xl text-sm border transition-colors hover:opacity-80"
                                style={{ borderColor: "var(--g-bd)", color: "var(--g-tx2)" }}>
                                ← Back
                              </button>
                              <button
                                disabled={dispatchBlocked}
                                onClick={dispatchDrone}
                                className="flex-1 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                style={{ backgroundColor: "#f59e0b", color: "#070b10" }}
                                onMouseEnter={(e) => { if (!dispatchBlocked) e.currentTarget.style.backgroundColor = "#d97706"; }}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f59e0b")}
                              >
                                {dispatchBlocked ? "Dispatch unavailable" : "🚁 Pay & Dispatch Drone"}
                              </button>
                            </div>
                            <p className="text-center text-[10px]" style={{ color: "var(--g-tx4)" }}>
                              🔒 Payment is encrypted and secure
                            </p>
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
              );
            }

            // ── Standard orders table ────────────────────────────────────
            return (
              <div className="max-w-5xl mx-auto space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="font-bold text-xl" style={{ color: "var(--g-tx)" }}>Current & Pending Orders</h2>
                  <span className="text-xs font-mono" style={{ color: "var(--g-tx2)" }}>
                    {orders.filter((o) => !["Delivered","Failed"].includes(o.status)).length} active
                  </span>
                </div>

                {/* ── Filter & sort controls ── */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status filter */}
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--g-tx2)" }}>Status</label>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="border rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none transition-colors"
                      style={{ backgroundColor: "var(--g-s2)", borderColor: orderStatusFilter !== "All" ? "#f59e0b88" : "var(--g-bd)", color: "var(--g-tx)", cursor: "pointer" }}
                    >
                      {ORDER_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--g-tx2)" }}>Sort</label>
                    <select
                      value={orderSort}
                      onChange={(e) => setOrderSort(e.target.value as OrderSortKey)}
                      className="border rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none transition-colors"
                      style={{ backgroundColor: "var(--g-s2)", borderColor: orderSort !== "newest" ? "#f59e0b88" : "var(--g-bd)", color: "var(--g-tx)", cursor: "pointer" }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="customer">Customer Name</option>
                      <option value="value-desc">Order Total ↓</option>
                      <option value="value-asc">Order Total ↑</option>
                    </select>
                  </div>

                  {/* Active indicator + clear */}
                  {filtersActive && (
                    <>
                      <span className="text-[10px] font-mono px-2 py-1 rounded-full" style={{ backgroundColor: "#f59e0b18", color: "#f59e0b", border: "1px solid #f59e0b44" }}>
                        {visibleOrders.length} of {orders.length} shown
                      </span>
                      <button
                        onClick={clearOrderFilters}
                        className="text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-colors hover:opacity-80"
                        style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx2)" }}
                      >
                        ✕ Clear filters
                      </button>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { l: "Active",    v: orders.filter((o) => !["Delivered","Failed"].includes(o.status)).length, c: "#f59e0b" },
                    { l: "To Fulfill", v: orders.filter((o) => o.status === "Ready to Fulfill").length,           c: "#a78bfa" },
                    { l: "Delivered", v: orders.filter((o) => o.status === "Delivered").length,                   c: "#22c55e" },
                    { l: "Failed",    v: orders.filter((o) => o.status === "Failed").length,                      c: "#ef4444" },
                  ].map((s) => (
                    <div key={s.l} className="border rounded-xl p-4" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                      <p className="text-xs mb-1" style={{ color: "var(--g-tx2)" }}>{s.l}</p>
                      <p className="text-xl font-bold font-mono" style={{ color: s.c }}>{s.v}</p>
                    </div>
                  ))}
                </div>

                <div className="border rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead>
                        <tr className="border-b" style={{ borderColor: "var(--g-bd)" }}>
                          {["Order", "Customer", "Item", "Delivery Address", "Status", "Drone", "ETA", "Value", "Action"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--g-tx2)" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleOrders.length === 0 && (
                          <tr>
                            <td colSpan={9} className="px-4 py-10 text-center text-sm font-mono" style={{ color: "var(--g-tx4)" }}>
                              No orders match the current filters
                            </td>
                          </tr>
                        )}
                        {visibleOrders.map((o) => (
                          <tr key={o.id} className="border-b last:border-0 transition-colors hover:opacity-90" style={{ borderColor: "var(--g-s2)" }}>
                            <td className="px-4 py-3 font-mono text-xs text-[#f59e0b]">{o.id}</td>
                            <td className="px-4 py-3 text-sm" style={{ color: "var(--g-tx)" }}>{o.customer}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: "var(--g-tx3)" }}>{o.item}</td>
                            <td className="px-4 py-3 text-xs max-w-[180px]" style={{ color: "var(--g-tx3)" }}>
                              <span title={o.deliveryAddress} className="block truncate">{o.deliveryAddress}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border" style={{ color: STATUS_COLOR[o.status], borderColor: STATUS_COLOR[o.status] + "44", backgroundColor: STATUS_COLOR[o.status] + "10" }}>
                                {o.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--g-tx2)" }}>{o.drone}</td>
                            <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--g-tx2)" }}>{o.eta}</td>
                            <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: "var(--g-tx)" }}>{o.value}</td>
                            <td className="px-4 py-3">
                              {o.status === "Ready to Fulfill" && (
                                <button
                                  onClick={() => startFulfill(o.id)}
                                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap"
                                  style={{ backgroundColor: "#a78bfa18", color: "#a78bfa", border: "1px solid #a78bfa44" }}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#a78bfa28"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#a78bfa18"; }}
                                >
                                  🚁 Fulfill Order
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ══ FLEET & TRACKING ══ */}
          {tab === "fleet" && (() => {
            const selColor = DRONE_STATUS_COLOR[selectedDrone.status];
            const linkedOrder = orders.find((o) => o.drone === selectedDrone.id);
            return (
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="font-bold text-xl" style={{ color: "var(--g-tx)" }}>Fleet & Live Tracking</h2>
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
                        <p className="font-mono text-xl font-bold" style={{ color: s.c }}>{s.v}</p>
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
              <h2 className="font-bold text-xl mb-4" style={{ color: "var(--g-tx)" }}>Weather — Delivery Zone</h2>
              <WeatherPanel accentColor="#f59e0b" />
            </div>
          )}

          {/* ══ CUSTOMER CHAT ══ */}
          {tab === "chat" && (
            <div className="max-w-4xl mx-auto">
              <h2 className="font-bold text-xl mb-4" style={{ color: "var(--g-tx)" }}>Customer Messages</h2>
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
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="font-bold text-xl" style={{ color: "var(--g-tx)" }}>Contact GID Support</h2>
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
                    className="w-full bg-[#f59e0b] text-[#070b10] rounded-xl py-3.5 text-base font-semibold hover:bg-[#d97706] transition-colors"
                  >
                    Submit Ticket
                  </button>
                </div>
              )}

              {/* ── My Support Tickets ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-semibold text-sm" style={{ color: "var(--g-tx)" }}>My Support Tickets</h3>
                  <span className="text-xs font-mono" style={{ color: "var(--g-tx2)" }}>{mySellerTickets.length} ticket{mySellerTickets.length !== 1 ? "s" : ""}</span>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--g-tx2)" }}>Status</label>
                    <select
                      value={sellerTicketStatusFilter}
                      onChange={(e) => setSellerTicketStatusFilter(e.target.value)}
                      className="border rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                      style={{ backgroundColor: "var(--g-s2)", borderColor: sellerTicketStatusFilter !== "All" ? "#f59e0b88" : "var(--g-bd)", color: "var(--g-tx)", cursor: "pointer" }}
                    >
                      {["All", "Open", "In Review", "Waiting for Customer", "Waiting for Support", "Resolved", "Closed"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--g-tx2)" }}>Sort</label>
                    <select
                      value={sellerTicketSort}
                      onChange={(e) => setSellerTicketSort(e.target.value as "newest" | "oldest")}
                      className="border rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                      style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)", cursor: "pointer" }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>

                {/* Ticket detail view */}
                {openSellerTicket && (
                  <div className="border rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                    <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "var(--g-bd)" }}>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setOpenSellerTicketId(null)} className="text-xs hover:opacity-70 flex items-center gap-1" style={{ color: "var(--g-tx2)" }}>← Back</button>
                        <span className="font-mono text-xs text-[#f59e0b]">{openSellerTicket.id}</span>
                      </div>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border"
                        style={{ color: SELLER_TICKET_STATUS_COLOR[openSellerTicket.status].text, backgroundColor: SELLER_TICKET_STATUS_COLOR[openSellerTicket.status].bg, borderColor: SELLER_TICKET_STATUS_COLOR[openSellerTicket.status].border }}>
                        {openSellerTicket.status}
                      </span>
                    </div>
                    <div className="px-5 py-4 border-b space-y-1" style={{ borderColor: "var(--g-bd)" }}>
                      <p className="font-semibold text-sm" style={{ color: "var(--g-tx)" }}>{openSellerTicket.type}</p>
                      <div className="flex flex-wrap gap-3 text-[10px] font-mono" style={{ color: "var(--g-tx2)" }}>
                        <span>Order: {openSellerTicket.orderId}</span>
                        <span>Submitted: {openSellerTicket.submittedDate}</span>
                        <span>Updated: {openSellerTicket.lastUpdated}</span>
                        <span style={{ color: SELLER_PRIORITY_COLOR[openSellerTicket.priority] }}>Priority: {openSellerTicket.priority}</span>
                      </div>
                      {openSellerTicket.status === "Waiting for Customer" && (
                        <p className="text-[10px] font-semibold mt-1" style={{ color: "#a78bfa" }}>⚡ Support is waiting for your response</p>
                      )}
                      {(openSellerTicket.status === "Open" || openSellerTicket.status === "In Review" || openSellerTicket.status === "Waiting for Support") && (
                        <p className="text-[10px] font-semibold mt-1" style={{ color: "#f59e0b" }}>⏳ Support team is reviewing your ticket</p>
                      )}
                    </div>
                    <div className="px-5 py-4 space-y-3">
                      {openSellerTicket.conversation.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.author === "user" ? "flex-row-reverse" : ""}`}>
                          <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold"
                            style={{ backgroundColor: msg.author === "user" ? "#f59e0b22" : "var(--g-s2)", color: msg.author === "user" ? "#f59e0b" : "var(--g-tx2)" }}>
                            {msg.author === "user" ? "TG" : "GID"}
                          </div>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.author === "user" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                            style={{ backgroundColor: msg.author === "user" ? "#f59e0b14" : "var(--g-s2)" }}>
                            <p className="text-xs" style={{ color: "var(--g-tx)" }}>{msg.text}</p>
                            <p className="text-[9px] mt-1 font-mono" style={{ color: "var(--g-tx4)" }}>{msg.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ticket list */}
                {!openSellerTicket && (
                  <div className="space-y-2">
                    {visibleSellerTickets.length === 0 && (
                      <p className="text-sm text-center py-6 font-mono" style={{ color: "var(--g-tx4)" }}>No tickets match the current filter</p>
                    )}
                    {visibleSellerTickets.map((t) => {
                      const sc = SELLER_TICKET_STATUS_COLOR[t.status];
                      return (
                        <button key={t.id} onClick={() => setOpenSellerTicketId(t.id)}
                          className="w-full text-left border rounded-2xl p-4 transition-all hover:opacity-90 space-y-2"
                          style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-mono text-[10px] text-[#f59e0b]">{t.id}</span>
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full border"
                                  style={{ color: SELLER_PRIORITY_COLOR[t.priority], backgroundColor: SELLER_PRIORITY_COLOR[t.priority] + "18", borderColor: SELLER_PRIORITY_COLOR[t.priority] + "44" }}>
                                  {t.priority}
                                </span>
                              </div>
                              <p className="text-sm font-medium truncate" style={{ color: "var(--g-tx)" }}>{t.type}</p>
                              <p className="text-[10px] font-mono" style={{ color: "var(--g-tx2)" }}>Order {t.orderId} · {t.submittedDate}</p>
                            </div>
                            <span className="shrink-0 font-mono text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap"
                              style={{ color: sc.text, backgroundColor: sc.bg, borderColor: sc.border }}>
                              {t.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-mono" style={{ color: "var(--g-tx3)" }}>Updated {t.lastUpdated}</p>
                            {t.status === "Waiting for Customer" && (
                              <span className="text-[10px] font-semibold" style={{ color: "#a78bfa" }}>Your turn to respond</span>
                            )}
                            {(t.status === "Open" || t.status === "In Review" || t.status === "Waiting for Support") && (
                              <span className="text-[10px] font-semibold" style={{ color: "#f59e0b" }}>Support responding</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
