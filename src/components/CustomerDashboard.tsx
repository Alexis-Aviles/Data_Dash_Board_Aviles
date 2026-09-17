import { useState } from "react";
import logo from "@/imports/image.png";
import DashHeader from "@/components/DashHeader";
import DroneMap from "@/components/DroneMap";
import WeatherPanel from "@/components/WeatherPanel";
import { useTickets } from "@/context/TicketContext";
import { useTheme } from "@/context/ThemeContext";

const TABS = [
  { id: "home",     label: "🏠 Home" },
  { id: "shop",     label: "🛒 Place Order" },
  { id: "orders",   label: "📦 My Orders" },
  { id: "tracking", label: "📍 Live Tracking" },
  { id: "weather",  label: "🌤 Weather" },
  { id: "chat",     label: "💬 Seller Chat" },
  { id: "support",  label: "🆘 Help" },
  { id: "account",  label: "👤 Account" },
];

const ORDERS = [
  { id: "GID-88421", item: "Wireless Earbuds Pro",    seller: "TechGoods Store", sellerInitials: "TG", status: "In Flight",  eta: "4 min",  drone: "DR-07", progress: 85,  placed: "10:41", value: "$89.99",  step: 3 },
  { id: "GID-88197", item: "Vitamin C Supplement ×3", seller: "GreenEats",       sellerInitials: "GE", status: "Preparing",  eta: "32 min", drone: "DR-12", progress: 20,  placed: "10:32", value: "$22.50",  step: 1 },
  { id: "GID-87930", item: "Phone Case — Obsidian",   seller: "TechGoods Store", sellerInitials: "TG", status: "Delivered",  eta: "—",      drone: "DR-03", progress: 100, placed: "09:12", value: "$19.99",  step: 4 },
  { id: "GID-87614", item: "Matcha Latte Kit",        seller: "UrbanMart",       sellerInitials: "UM", status: "Delivered",  eta: "—",      drone: "DR-09", progress: 100, placed: "Yesterday", value: "$34.00", step: 4 },
];

const STATUS_COLOR: Record<string, string> = {
  "In Flight": "#00d4ff",
  Preparing:   "#f59e0b",
  Delivered:   "#22c55e",
  Failed:      "#ef4444",
};

const STATUS_EMOJI: Record<string, string> = {
  "In Flight": "🚁",
  Preparing:   "📦",
  Delivered:   "✅",
  Failed:      "❌",
};

const STEPS = ["Order Placed", "Preparing", "Drone Assigned", "In Flight", "Delivered"];

// Per-order flight logs
const FLIGHT_LOGS: Record<string, { time: string; event: string; done?: boolean }[]> = {
  "GID-88421": [
    { time: "10:41", event: "Package picked up from TechGoods Store, Sector 4" },
    { time: "10:43", event: "Ascended to cruise altitude 80 m" },
    { time: "10:45", event: "En route — 1.2 km remaining" },
    { time: "10:46", event: "Approaching delivery zone" },
  ],
  "GID-88197": [
    { time: "10:32", event: "Order confirmed and forwarded to GreenEats" },
    { time: "10:34", event: "Seller accepted — packaging in progress" },
    { time: "10:37", event: "Awaiting drone assignment" },
  ],
  "GID-87930": [
    { time: "09:10", event: "Package picked up from TechGoods Store, Sector 4" },
    { time: "09:11", event: "Ascended to cruise altitude 75 m, speed 13.4 m/s" },
    { time: "09:12", event: "Arrived at delivery zone, descending" },
    { time: "09:13", event: "✅ Package delivered successfully — DR-03", done: true },
  ],
  "GID-87614": [
    { time: "17:10", event: "Package picked up from UrbanMart" },
    { time: "17:14", event: "In transit, altitude 78 m" },
    { time: "17:19", event: "Arrived at drop zone" },
    { time: "17:20", event: "✅ Package delivered successfully — DR-09", done: true },
  ],
};

// Per-order seller chat initial messages
const INIT_ORDER_CHATS: Record<string, { from: string; text: string; time: string }[]> = {
  "GID-88421": [
    { from: "seller", text: "Your order has been packed and handed to the drone fleet.", time: "10:42" },
    { from: "user",   text: "Thanks! About how long until it arrives?",                  time: "10:44" },
    { from: "seller", text: "ETA is about 4 minutes — the drone is 1.2 km away.",        time: "10:45" },
  ],
  "GID-88197": [
    { from: "seller", text: "Hi Alex! Your vitamin supplements are being packed right now. We'll hand them off to the drone fleet shortly.", time: "10:33" },
  ],
  "GID-87930": [
    { from: "seller", text: "Your phone case (Obsidian) has been delivered! Hope you love it.", time: "09:13" },
    { from: "user",   text: "Got it, thanks — looks great!",                                    time: "09:16" },
    { from: "seller", text: "Happy to hear it! Enjoy 😊",                                       time: "09:18" },
  ],
  "GID-87614": [
    { from: "seller", text: "Your matcha latte kit was delivered yesterday. Let us know how you like it!", time: "17:21" },
    { from: "user",   text: "Just tried it — absolutely delicious, will order again.",                     time: "18:05" },
  ],
};

const ACCOUNT = {
  name: "Alex Morgan", email: "alex.morgan@email.com",
  phone: "+31 6 1234 5678", address: "Prinsengracht 142, 1015 EA Amsterdam",
  joined: "March 2025", totalOrders: 47, delivered: 45,
};

const ISSUE_TYPES = ["Delivery delayed", "Package damaged", "Wrong item received", "Drone incident", "Other"];

const STORES = [
  { id: "techgoods", name: "TechGoods Store",  emoji: "🔌", tag: "Electronics" },
  { id: "greeneats",  name: "GreenEats",        emoji: "🥗", tag: "Food & Wellness" },
  { id: "urbanmart",  name: "UrbanMart",         emoji: "🏪", tag: "Everyday Essentials" },
  { id: "brewcraft",  name: "BrewCraft",         emoji: "☕", tag: "Beverages" },
  { id: "petpals",    name: "PetPals",           emoji: "🐾", tag: "Pet Care" },
  { id: "fitgear",    name: "FitGear",           emoji: "🏋️", tag: "Sports & Health" },
];

const CATALOG: Record<string, { id: string; name: string; price: string; desc: string; eta: string; stock: number }[]> = {
  techgoods: [
    { id: "tg1", name: "Wireless Earbuds Pro",      price: "$89.99",  desc: "35h battery, ANC, IPX5 waterproof",           eta: "~8 min",  stock: 12 },
    { id: "tg2", name: "USB-C Hub 7-in-1",          price: "$39.99",  desc: "4K HDMI, 100W PD, SD card reader",            eta: "~10 min", stock: 5  },
    { id: "tg3", name: "Phone Case — Obsidian",     price: "$19.99",  desc: "MagSafe compatible, drop-tested 6 ft",        eta: "~7 min",  stock: 30 },
    { id: "tg4", name: "Portable Charger 20000mAh", price: "$49.99",  desc: "Dual USB-A + USB-C, 22.5W fast charge",      eta: "~9 min",  stock: 8  },
    { id: "tg5", name: "Smart LED Strip 5m",        price: "$29.99",  desc: "16M colors, music sync, app control",         eta: "~11 min", stock: 20 },
    { id: "tg6", name: "Webcam 4K Ultra",           price: "$74.99",  desc: "Auto-focus, built-in ring light, USB-C",      eta: "~12 min", stock: 4  },
  ],
  greeneats: [
    { id: "ge1", name: "Vitamin C 1000mg ×30",      price: "$14.99",  desc: "Buffered formula, non-acidic, vegan",         eta: "~6 min",  stock: 50 },
    { id: "ge2", name: "Plant-Based Protein 500g",  price: "$34.99",  desc: "Chocolate fudge, 25g protein/serving",        eta: "~6 min",  stock: 15 },
    { id: "ge3", name: "Matcha Latte Kit",           price: "$22.00",  desc: "Ceremonial grade matcha + oat milk mix",      eta: "~5 min",  stock: 22 },
    { id: "ge4", name: "Vitamin D3 + K2 Pack",      price: "$18.00",  desc: "5000 IU D3, MenaQ7 K2, 60 softgels",         eta: "~6 min",  stock: 40 },
    { id: "ge5", name: "Cold Brew Coffee Pouch ×4", price: "$12.50",  desc: "Coarsely ground, single-origin Ethiopia",     eta: "~5 min",  stock: 18 },
  ],
  urbanmart: [
    { id: "um1", name: "Bamboo Cutting Board",       price: "$24.50",  desc: "Eco-friendly, antimicrobial, 38×28 cm",      eta: "~9 min",  stock: 10 },
    { id: "um2", name: "Ceramic Mug Set ×4",         price: "$34.00",  desc: "300 ml, dishwasher safe, matte finish",       eta: "~8 min",  stock: 7  },
    { id: "um3", name: "Reusable Grocery Bag ×3",    price: "$9.99",   desc: "Organic cotton, 15 kg capacity",             eta: "~7 min",  stock: 60 },
    { id: "um4", name: "Scented Soy Candle",         price: "$16.00",  desc: "60h burn time, lavender & eucalyptus",       eta: "~8 min",  stock: 25 },
  ],
  brewcraft: [
    { id: "bc1", name: "Single-Origin Espresso 250g", price: "$17.99", desc: "Ethiopian Yirgacheffe, medium roast",        eta: "~7 min",  stock: 20 },
    { id: "bc2", name: "Herbal Tea Variety Pack",     price: "$13.99", desc: "12 flavors, 60 bags, zero caffeine",         eta: "~6 min",  stock: 35 },
    { id: "bc3", name: "Frother Wand",                price: "$11.99", desc: "2-speed, stainless steel, USB rechargeable", eta: "~8 min",  stock: 14 },
    { id: "bc4", name: "Cold Brew Pitcher 1L",        price: "$26.99", desc: "BPA-free, stainless mesh filter, airtight",  eta: "~9 min",  stock: 9  },
  ],
  petpals: [
    { id: "pp1", name: "Premium Dry Dog Food 2kg",   price: "$28.00",  desc: "Grain-free, chicken & sweet potato",         eta: "~12 min", stock: 8  },
    { id: "pp2", name: "Cat Toy Bundle ×6",           price: "$15.99",  desc: "Feather wands, crinkle balls, catnip bag",   eta: "~8 min",  stock: 20 },
    { id: "pp3", name: "Odor-Control Cat Litter 5kg", price: "$19.99", desc: "Clumping clay, 4-week odor control",         eta: "~14 min", stock: 6  },
    { id: "pp4", name: "Dog Dental Chews ×30",       price: "$12.50",  desc: "Daily dental hygiene, chicken flavor",       eta: "~9 min",  stock: 30 },
  ],
  fitgear: [
    { id: "fg1", name: "Resistance Band Set ×5",     price: "$21.99",  desc: "10–50 lbs, anti-snap latex, door anchor",   eta: "~7 min",  stock: 25 },
    { id: "fg2", name: "Electrolyte Powder ×20",     price: "$16.99",  desc: "No sugar, 5 flavors, sodium + potassium",   eta: "~6 min",  stock: 40 },
    { id: "fg3", name: "Jump Rope — Speed",           price: "$14.99",  desc: "Ball bearings, adjustable cable, foam grip", eta: "~7 min",  stock: 15 },
    { id: "fg4", name: "Yoga Mat 6mm",               price: "$32.00",  desc: "Non-slip TPE, carrying strap included",     eta: "~9 min",  stock: 12 },
  ],
};

type OrderStat = "active" | "delivered" | "failed" | null;

export default function CustomerDashboard({ onLogout }: { onLogout: () => void }) {
  const { isDark } = useTheme();
  const [tab, setTab] = useState("home");
  const [activeOrder, setActiveOrder] = useState(ORDERS[0]);
  const [activeChatOrderId, setActiveChatOrderId] = useState(ORDERS[0].id);
  const [orderChats, setOrderChats] = useState(INIT_ORDER_CHATS);
  const [chatInput, setChatInput] = useState("");
  const [issueType, setIssueType] = useState(ISSUE_TYPES[0]);
  const [supportDesc, setSupportDesc] = useState("");
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [notifToggles, setNotifToggles] = useState({ drone: true, delivery: true, promos: false, summary: true });
  const [activeStat, setActiveStat] = useState<OrderStat>(null);
  const [shopStore, setShopStore] = useState<string | null>(null);
  const [shopSearch, setShopSearch] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [shopCategory, setShopCategory] = useState("All");
  const [checkoutDone, setCheckoutDone] = useState(false);
  const { addTicket } = useTickets();

  function toggleNotif(key: keyof typeof notifToggles) {
    setNotifToggles((p) => ({ ...p, [key]: !p[key] }));
  }

  function sendChatMessage() {
    if (!chatInput.trim()) return;
    const msg = { from: "user", text: chatInput, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setOrderChats((c) => ({ ...c, [activeChatOrderId]: [...(c[activeChatOrderId] ?? []), msg] }));
    setChatInput("");
  }

  function submitTicket() {
    const id = addTicket({
      from: "customer",
      fromName: "Alex Morgan",
      orderId: activeOrder.id,
      type: issueType,
      description: supportDesc || "(no description)",
    });
    setSubmittedTicketId(id);
    setSupportDesc("");
  }

  const activeChatOrder = ORDERS.find((o) => o.id === activeChatOrderId) ?? ORDERS[0];
  const activeChatMessages = orderChats[activeChatOrderId] ?? [];

  const stats = {
    active: ORDERS.filter((o) => o.status === "In Flight" || o.status === "Preparing"),
    delivered: ORDERS.filter((o) => o.status === "Delivered"),
    failed: ORDERS.filter((o) => o.status === "Failed"),
  };

  // Filtered orders for My Orders tab
  const filteredOrders = activeStat
    ? ORDERS.filter((o) => {
        if (activeStat === "active") return o.status === "In Flight" || o.status === "Preparing";
        if (activeStat === "delivered") return o.status === "Delivered";
        if (activeStat === "failed") return o.status === "Failed";
        return true;
      })
    : ORDERS;

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: "var(--g-bg)", fontFamily: "'Inter', sans-serif" }}>
      {/* Logo watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden" style={{ opacity: isDark ? 0.035 : 0.06 }} aria-hidden="true">
        <img src={logo} alt="" className="w-[60vw] max-w-2xl object-contain select-none" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <DashHeader role="Customer" name="Alex Morgan" onLogout={onLogout} accent="#00d4ff" />

        {/* Tab bar */}
        <div className="border-b px-2 overflow-x-auto shrink-0" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
          <div className="flex min-w-max">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${tab === t.id ? "border-[#00d4ff] text-[#00d4ff]" : "border-transparent hover:text-[#c8d8e8]"}`}
                style={tab !== t.id ? { color: "var(--g-tx2)" } : {}}
              >{t.label}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto">

          {/* ══ HOME ══ */}
          {tab === "home" && (
            <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
              <div className="rounded-2xl p-5 border" style={{ background: isDark ? "linear-gradient(135deg,#0d1a28,#0a1520)" : "linear-gradient(135deg,#ffffff,#f4f8ff)", borderColor: STATUS_COLOR[activeOrder.status] + "44" }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-2xl mb-1">{STATUS_EMOJI[activeOrder.status]}</p>
                    <h2 className="text-lg font-bold leading-tight" style={{ color: "var(--g-tx)" }}>
                      {activeOrder.status === "In Flight" && "Your drone is on the way!"}
                      {activeOrder.status === "Preparing" && "Getting your order ready…"}
                      {activeOrder.status === "Delivered" && "Order delivered!"}
                      {activeOrder.status === "Failed"    && "Delivery issue"}
                    </h2>
                    <p className="text-sm mt-0.5" style={{ color: "var(--g-tx3)" }}>{activeOrder.item}</p>
                  </div>
                  {activeOrder.eta !== "—" && (
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-[10px] uppercase tracking-widest font-mono" style={{ color: "var(--g-tx2)" }}>ETA</p>
                      <p className="text-3xl font-bold tabular-nums" style={{ color: STATUS_COLOR[activeOrder.status] }}>{activeOrder.eta}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center mb-4">
                  {STEPS.map((step, i) => {
                    const done = i <= activeOrder.step; const active = i === activeOrder.step;
                    return (
                      <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full border-2 transition-all" style={{ backgroundColor: done ? STATUS_COLOR[activeOrder.status] : "var(--g-s2)", borderColor: done ? STATUS_COLOR[activeOrder.status] : "var(--g-bd)", boxShadow: active ? `0 0 8px ${STATUS_COLOR[activeOrder.status]}` : "none" }} />
                          <p className="text-[8px] mt-1 text-center leading-tight w-14 hidden sm:block" style={{ color: "var(--g-tx4)" }}>{step}</p>
                        </div>
                        {i < STEPS.length - 1 && <div className="flex-1 h-0.5 mx-0.5 rounded" style={{ backgroundColor: i < activeOrder.step ? STATUS_COLOR[activeOrder.status] : "var(--g-bd)" }} />}
                      </div>
                    );
                  })}
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ backgroundColor: "var(--g-s2)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${activeOrder.progress}%`, backgroundColor: STATUS_COLOR[activeOrder.status] }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setTab("tracking")} className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors" style={{ borderColor: STATUS_COLOR[activeOrder.status] + "44", color: STATUS_COLOR[activeOrder.status], backgroundColor: STATUS_COLOR[activeOrder.status] + "11" }}>
                    📍 Track in detail
                  </button>
                  <button onClick={() => { setActiveChatOrderId(activeOrder.id); setTab("chat"); }} className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors hover:opacity-80" style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}>
                    Contact seller
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{ emoji: "🌤", label: "Weather", tab: "weather" }, { emoji: "🆘", label: "Get Help", tab: "support" }, { emoji: "👤", label: "Account", tab: "account" }].map((q) => (
                  <button key={q.tab} onClick={() => setTab(q.tab)} className="border rounded-xl py-4 flex flex-col items-center gap-1.5 transition-colors hover:opacity-80" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                    <span className="text-xl">{q.emoji}</span>
                    <span className="text-xs font-medium" style={{ color: "var(--g-tx3)" }}>{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══ PLACE ORDER / SHOP ══ */}
          {tab === "shop" && (() => {
            const cartItems = Object.entries(cart).filter(([, qty]) => qty > 0);
            const cartTotal = cartItems.reduce((sum, [id, qty]) => {
              const item = Object.values(CATALOG).flat().find((p) => p.id === id);
              return sum + (item ? parseFloat(item.price.replace("$", "")) * qty : 0);
            }, 0);
            const cartCount = cartItems.reduce((s, [, q]) => s + q, 0);

            const storeItems = shopStore ? (CATALOG[shopStore] ?? []) : [];
            const categories = ["All", ...new Set(STORES.map((s) => s.tag))];
            const visibleStores = shopCategory === "All" ? STORES : STORES.filter((s) => s.tag === shopCategory);
            const filteredItems = storeItems.filter((p) => p.name.toLowerCase().includes(shopSearch.toLowerCase()));

            function addToCart(id: string) { setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 })); }
            function removeFromCart(id: string) { setCart((c) => ({ ...c, [id]: Math.max((c[id] ?? 1) - 1, 0) })); }

            if (checkoutDone) return (
              <div className="max-w-md mx-auto p-6 flex flex-col items-center justify-center" style={{ minHeight: 400 }}>
                <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center mb-5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2.5} className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold mb-1" style={{ color: "var(--g-tx)" }}>Order placed!</h2>
                <p className="text-sm text-center mb-1" style={{ color: "var(--g-tx3)" }}>Your drone is being assigned. Track it in the Live Tracking tab.</p>
                <p className="font-mono text-xs mb-6" style={{ color: "var(--g-tx2)" }}>Estimated delivery: ~10 min</p>
                <button
                  onClick={() => { setCheckoutDone(false); setCart({}); setShopStore(null); }}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#00d4ff] text-[#070b10] hover:bg-[#00b8d9] transition-colors"
                >
                  Place another order
                </button>
              </div>
            );

            return (
              <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
                {/* Header + cart pill */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    {shopStore && (
                      <button onClick={() => { setShopStore(null); setShopSearch(""); }} className="flex items-center gap-1.5 text-xs mb-1 hover:opacity-70" style={{ color: "var(--g-tx2)" }}>
                        ← Back to stores
                      </button>
                    )}
                    <h2 className="font-bold text-base" style={{ color: "var(--g-tx)" }}>
                      {shopStore ? STORES.find((s) => s.id === shopStore)?.name : "Choose a Store"}
                    </h2>
                    {!shopStore && <p className="text-xs mt-0.5" style={{ color: "var(--g-tx2)" }}>Delivered by drone in minutes</p>}
                  </div>
                  {cartCount > 0 && (
                    <button
                      onClick={() => setCheckoutDone(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-[#00d4ff] text-[#070b10] hover:bg-[#00b8d9] transition-colors"
                    >
                      🛒 {cartCount} item{cartCount !== 1 ? "s" : ""} · ${cartTotal.toFixed(2)} — Checkout
                    </button>
                  )}
                </div>

                {/* Store browser */}
                {!shopStore && (
                  <>
                    {/* Category filter */}
                    <div className="flex gap-2 flex-wrap">
                      {categories.map((c) => (
                        <button
                          key={c}
                          onClick={() => setShopCategory(c)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                          style={shopCategory === c
                            ? { borderColor: "#00d4ff", backgroundColor: "#00d4ff18", color: "#00d4ff" }
                            : { borderColor: "var(--g-bd)", color: "var(--g-tx2)", backgroundColor: "transparent" }
                          }
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {visibleStores.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setShopStore(s.id)}
                          className="text-left border rounded-2xl p-5 transition-all hover:opacity-90 hover:border-[#00d4ff]/40"
                          style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}
                        >
                          <div className="text-3xl mb-3">{s.emoji}</div>
                          <p className="font-semibold text-sm mb-0.5" style={{ color: "var(--g-tx)" }}>{s.name}</p>
                          <p className="text-[10px] font-mono" style={{ color: "var(--g-tx2)" }}>{s.tag}</p>
                          <div className="mt-3 flex items-center gap-1.5">
                            <span className="live-dot w-1.5 h-1.5 rounded-full bg-[#22c55e] inline-block" />
                            <span className="text-[10px] font-mono text-[#22c55e]">Open · drone-ready</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Product listing */}
                {shopStore && (
                  <>
                    {/* Search */}
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--g-tx2)] text-sm">🔍</span>
                      <input
                        value={shopSearch}
                        onChange={(e) => setShopSearch(e.target.value)}
                        placeholder="Search products…"
                        className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#00d4ff]/50"
                        style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                      />
                    </div>

                    {filteredItems.length === 0 && (
                      <p className="text-center py-10 text-sm" style={{ color: "var(--g-tx2)" }}>No products match your search.</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredItems.map((p) => {
                        const qty = cart[p.id] ?? 0;
                        return (
                          <div key={p.id} className="border rounded-2xl p-4" style={{ backgroundColor: "var(--g-s1)", borderColor: qty > 0 ? "#00d4ff44" : "var(--g-bd)" }}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="min-w-0">
                                <p className="font-semibold text-sm leading-snug" style={{ color: "var(--g-tx)" }}>{p.name}</p>
                                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--g-tx2)" }}>{p.desc}</p>
                              </div>
                              <p className="font-mono text-sm font-bold shrink-0" style={{ color: "#00d4ff" }}>{p.price}</p>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2 text-[10px] font-mono" style={{ color: "var(--g-tx2)" }}>
                                <span>🚁 {p.eta}</span>
                                <span>·</span>
                                <span style={{ color: p.stock < 5 ? "#f59e0b" : "var(--g-tx2)" }}>
                                  {p.stock < 5 ? `Only ${p.stock} left!` : `${p.stock} in stock`}
                                </span>
                              </div>
                              {qty === 0 ? (
                                <button
                                  onClick={() => addToCart(p.id)}
                                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00d4ff] text-[#070b10] hover:bg-[#00b8d9] transition-colors"
                                >
                                  Add to cart
                                </button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => removeFromCart(p.id)} className="w-7 h-7 rounded-lg font-bold text-sm flex items-center justify-center hover:opacity-70 transition-colors" style={{ backgroundColor: "var(--g-s2)", color: "var(--g-tx)" }}>−</button>
                                  <span className="font-mono text-sm font-bold w-4 text-center" style={{ color: "#00d4ff" }}>{qty}</span>
                                  <button onClick={() => addToCart(p.id)} className="w-7 h-7 rounded-lg font-bold text-sm flex items-center justify-center hover:opacity-70 transition-colors" style={{ backgroundColor: "var(--g-s2)", color: "var(--g-tx)" }}>+</button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Cart summary strip */}
                    {cartCount > 0 && (
                      <div className="sticky bottom-4 border rounded-2xl p-4 flex items-center justify-between gap-3" style={{ backgroundColor: "var(--g-s1)", borderColor: "#00d4ff44", boxShadow: "0 4px 24px #00d4ff18" }}>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: "var(--g-tx)" }}>{cartCount} item{cartCount !== 1 ? "s" : ""} in cart</p>
                          <p className="font-mono text-[10px] mt-0.5" style={{ color: "var(--g-tx2)" }}>
                            {cartItems.map(([id, q]) => {
                              const item = Object.values(CATALOG).flat().find((p) => p.id === id);
                              return item ? `${item.name} ×${q}` : "";
                            }).filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        <button
                          onClick={() => setCheckoutDone(true)}
                          className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#00d4ff] text-[#070b10] hover:bg-[#00b8d9] transition-colors"
                        >
                          Checkout · ${cartTotal.toFixed(2)}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}

          {/* ══ MY ORDERS ══ */}
          {tab === "orders" && (
            <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
              <h2 className="font-bold text-base" style={{ color: "var(--g-tx)" }}>My Orders</h2>

              {/* Interactive stat chips */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "active" as OrderStat,    label: "Active",    count: stats.active.length,    color: "#f59e0b" },
                  { key: "delivered" as OrderStat, label: "Delivered", count: stats.delivered.length, color: "#22c55e" },
                  { key: "failed" as OrderStat,    label: "Failed",    count: stats.failed.length,    color: "#ef4444" },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setActiveStat(activeStat === s.key ? null : s.key)}
                    className="border rounded-xl p-4 text-left transition-all hover:opacity-90"
                    style={{
                      backgroundColor: activeStat === s.key ? s.color + "14" : "var(--g-s1)",
                      borderColor: activeStat === s.key ? s.color + "55" : "var(--g-bd)",
                    }}
                  >
                    <p className="text-xs mb-1" style={{ color: "var(--g-tx2)" }}>{s.label}</p>
                    <p className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.count}</p>
                  </button>
                ))}
              </div>

              {/* Drill-down chart */}
              {activeStat && (
                <div className="border rounded-2xl p-5 space-y-3" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--g-tx2)" }}>
                      {activeStat === "active" ? "Active Orders — Progress" : activeStat === "delivered" ? "Delivery History" : "Failed Deliveries"}
                    </p>
                    <button onClick={() => setActiveStat(null)} className="text-xs hover:opacity-80" style={{ color: "var(--g-tx2)" }}>✕ Close</button>
                  </div>
                  {filteredOrders.length === 0 ? (
                    <p className="text-sm text-center py-4" style={{ color: "var(--g-tx3)" }}>No orders in this category</p>
                  ) : filteredOrders.map((o) => (
                    <div key={o.id} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs font-medium" style={{ color: "var(--g-tx)" }}>{o.item}</p>
                          <p className="text-[10px] font-mono" style={{ color: "var(--g-tx2)" }}>{o.id} · {o.placed}</p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ color: STATUS_COLOR[o.status], backgroundColor: STATUS_COLOR[o.status] + "18" }}>{o.status}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--g-s2)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${o.progress}%`, backgroundColor: STATUS_COLOR[o.status] }} />
                      </div>
                      {activeStat === "delivered" && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px]">✅</span>
                          <span className="text-[10px]" style={{ color: "var(--g-tx3)" }}>Delivered via {o.drone} · {o.value}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Order list */}
              <div className="space-y-3">
                {(activeStat ? filteredOrders : ORDERS).map((o) => (
                  <button key={o.id} onClick={() => { setActiveOrder(o); setTab(o.status === "In Flight" ? "tracking" : "home"); }}
                    className="w-full text-left rounded-2xl border p-5 transition-all hover:opacity-90"
                    style={activeOrder.id === o.id ? { borderColor: "#00d4ff40", backgroundColor: isDark ? "#0d1a28" : "#f0f8ff" } : { backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{STATUS_EMOJI[o.status]}</span>
                          <span className="text-sm font-bold truncate" style={{ color: "var(--g-tx)" }}>{o.item}</span>
                        </div>
                        <p className="text-xs" style={{ color: "var(--g-tx2)" }}>{o.seller} · {o.id}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--g-tx2)" }}>{o.value} · Placed {o.placed}</p>
                      </div>
                      <div className="shrink-0 ml-3 text-right">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: STATUS_COLOR[o.status], backgroundColor: STATUS_COLOR[o.status] + "18" }}>{o.status}</span>
                        {o.eta !== "—" && <p className="text-xs mt-1" style={{ color: "var(--g-tx2)" }}>ETA {o.eta}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--g-s2)" }}>
                        <div className="h-full rounded-full" style={{ width: `${o.progress}%`, backgroundColor: STATUS_COLOR[o.status] }} />
                      </div>
                      <span className="text-[10px] font-mono" style={{ color: "var(--g-tx2)" }}>{o.drone}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══ LIVE TRACKING ══ */}
          {tab === "tracking" && (
            <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base" style={{ color: "var(--g-tx)" }}>Live Drone Tracking</h2>
                <button onClick={() => setTab("home")} className="text-xs transition-colors flex items-center gap-1 hover:opacity-80" style={{ color: "var(--g-tx2)" }}>← Back</button>
              </div>

              {/* Order selector */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {ORDERS.map((o) => (
                  <button key={o.id} onClick={() => setActiveOrder(o)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-xl border font-medium transition-all"
                    style={activeOrder.id === o.id
                      ? { borderColor: STATUS_COLOR[o.status], backgroundColor: STATUS_COLOR[o.status] + "14", color: STATUS_COLOR[o.status] }
                      : { borderColor: "var(--g-bd)", backgroundColor: "var(--g-s2)", color: "var(--g-tx2)" }}
                  >
                    {STATUS_EMOJI[o.status]} {o.id}
                  </button>
                ))}
              </div>

              {/* Order context */}
              <div className="rounded-xl px-4 py-3 border flex items-center justify-between" style={{ borderColor: STATUS_COLOR[activeOrder.status] + "33", backgroundColor: STATUS_COLOR[activeOrder.status] + "08" }}>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--g-tx)" }}>{activeOrder.item}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--g-tx2)" }}>{activeOrder.id} · {activeOrder.drone} · {activeOrder.seller}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: STATUS_COLOR[activeOrder.status], backgroundColor: STATUS_COLOR[activeOrder.status] + "18" }}>{activeOrder.status}</span>
                  {activeOrder.eta !== "—" && <p className="text-xs mt-1" style={{ color: "var(--g-tx2)" }}>ETA {activeOrder.eta}</p>}
                </div>
              </div>

              {/* Live map — only for in-flight/preparing */}
              {(activeOrder.status === "In Flight" || activeOrder.status === "Preparing") && (
                <DroneMap
                  drones={[{ id: activeOrder.drone === "—" ? "DR-07" : activeOrder.drone, x: 55, y: 42, altitude: 82, speed: 14.2, battery: 68, status: activeOrder.status === "In Flight" ? "in_flight" : "loading" }]}
                  accentColor={STATUS_COLOR[activeOrder.status]}
                />
              )}

              {/* Delivered / Failed confirmation banner */}
              {(activeOrder.status === "Delivered" || activeOrder.status === "Failed") && (
                <div className="rounded-2xl p-6 border flex items-center gap-4" style={{ borderColor: STATUS_COLOR[activeOrder.status] + "44", backgroundColor: STATUS_COLOR[activeOrder.status] + "0a" }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: STATUS_COLOR[activeOrder.status] + "18", border: `2px solid ${STATUS_COLOR[activeOrder.status]}55` }}>
                    <span className="text-2xl">{STATUS_EMOJI[activeOrder.status]}</span>
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: "var(--g-tx)" }}>{activeOrder.status === "Delivered" ? "Delivery Confirmed" : "Delivery Failed"}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--g-tx3)" }}>
                      {activeOrder.status === "Delivered" ? `${activeOrder.item} was successfully delivered via ${activeOrder.drone}.` : `${activeOrder.item} could not be delivered. Please contact support.`}
                    </p>
                  </div>
                </div>
              )}

              {/* Telemetry cards */}
              {activeOrder.status === "In Flight" && (
                <div className="grid grid-cols-3 gap-3">
                  {[{ label: "Altitude", value: "82 m", color: "#00d4ff" }, { label: "Speed", value: "14.2 m/s", color: "#00d4ff" }, { label: "Battery", value: "68%", color: "#22c55e" }].map((s) => (
                    <div key={s.label} className="border rounded-xl p-4 text-center" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                      <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--g-tx2)" }}>{s.label}</p>
                      <p className="font-mono text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Flight / delivery log — for ALL statuses */}
              <div className="border rounded-2xl p-5" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--g-tx2)" }}>
                  {activeOrder.status === "Delivered" ? "Delivery Log" : activeOrder.status === "Failed" ? "Incident Log" : "Flight Log"}
                </p>
                {(FLIGHT_LOGS[activeOrder.id] ?? []).map((l, i) => (
                  <div key={i} className="flex gap-3 py-2.5 border-b last:border-0" style={{ borderColor: "var(--g-s2)" }}>
                    <span className="font-mono text-[10px] w-10 shrink-0 pt-0.5" style={{ color: STATUS_COLOR[activeOrder.status] }}>{l.time}</span>
                    <span className="text-xs leading-snug" style={{ color: l.done ? "#22c55e" : "var(--g-tx3)" }}>{l.event}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ WEATHER ══ */}
          {tab === "weather" && (
            <div className="max-w-3xl mx-auto p-4 md:p-6">
              <h2 className="font-bold text-base mb-4" style={{ color: "var(--g-tx)" }}>Weather Conditions</h2>
              <WeatherPanel />
            </div>
          )}

          {/* ══ SELLER CHAT ══ */}
          {tab === "chat" && (
            <div className="max-w-3xl mx-auto p-4 md:p-6">
              <h2 className="font-bold text-base mb-4" style={{ color: "var(--g-tx)" }}>Seller Chat</h2>
              <div className="flex border rounded-2xl overflow-hidden" style={{ minHeight: 480, backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                {/* Thread list — orders */}
                <div className="w-56 border-r shrink-0 flex flex-col overflow-y-auto" style={{ borderColor: "var(--g-bd)" }}>
                  {ORDERS.map((o) => {
                    const msgs = orderChats[o.id] ?? [];
                    const last = msgs[msgs.length - 1];
                    const isActive = o.id === activeChatOrderId;
                    return (
                      <button key={o.id} onClick={() => setActiveChatOrderId(o.id)}
                        className="p-3.5 text-left border-b transition-colors text-left"
                        style={{ borderColor: "var(--g-bd)", backgroundColor: isActive ? "#00d4ff14" : "transparent" }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold" style={{ backgroundColor: STATUS_COLOR[o.status] + "20", color: STATUS_COLOR[o.status] }}>
                            {o.sellerInitials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold truncate" style={{ color: "var(--g-tx)" }}>{o.seller}</p>
                            <p className="font-mono text-[9px]" style={{ color: STATUS_COLOR[o.status] }}>{o.status}</p>
                          </div>
                        </div>
                        <p className="font-mono text-[9px] truncate mb-0.5" style={{ color: "var(--g-tx2)" }}>{o.id}</p>
                        {last && <p className="text-[10px] truncate" style={{ color: "var(--g-tx3)" }}>{last.from === "user" ? "You: " : ""}{last.text}</p>}
                      </button>
                    );
                  })}
                </div>

                {/* Chat area */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Header */}
                  <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: "var(--g-bd)" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-mono text-xs font-bold" style={{ backgroundColor: STATUS_COLOR[activeChatOrder.status] + "20", color: STATUS_COLOR[activeChatOrder.status] }}>
                      {activeChatOrder.sellerInitials}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--g-tx)" }}>{activeChatOrder.seller}</p>
                      <p className="font-mono text-[10px]" style={{ color: "var(--g-tx2)" }}>{activeChatOrder.id} · {activeChatOrder.item}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ color: STATUS_COLOR[activeChatOrder.status], backgroundColor: STATUS_COLOR[activeChatOrder.status] + "18" }}>
                        {activeChatOrder.status}
                      </span>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[260px]">
                    {activeChatMessages.map((m, i) => (
                      <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                        <div className="max-w-[75%] rounded-2xl px-4 py-2.5"
                          style={m.from === "user" ? { backgroundColor: "#00d4ff", color: "#070b10" } : { backgroundColor: "var(--g-s2)", border: "1px solid var(--g-bd)", color: "var(--g-tx)" }}>
                          <p className="text-sm leading-snug">{m.text}</p>
                          <p className="text-[10px] mt-1" style={{ color: m.from === "user" ? "#070b1099" : "var(--g-tx2)" }}>{m.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t flex gap-2" style={{ borderColor: "var(--g-bd)" }}>
                    <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                      placeholder={`Message ${activeChatOrder.seller}…`}
                      className="flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00d4ff]/50"
                      style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                    />
                    <button onClick={sendChatMessage} className="bg-[#00d4ff] text-[#070b10] px-5 rounded-xl font-bold text-sm hover:bg-[#00a8cc] transition-colors">Send</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ SUPPORT ══ */}
          {tab === "support" && (
            <div className="max-w-2xl mx-auto p-4 md:p-6">
              <h2 className="font-bold text-base mb-4" style={{ color: "var(--g-tx)" }}>Get Help</h2>
              {submittedTicketId ? (
                <div className="border border-[#22c55e]/30 rounded-2xl p-10 text-center" style={{ backgroundColor: "var(--g-s1)" }}>
                  <div className="w-14 h-14 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center mx-auto mb-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2.5} className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: "var(--g-tx)" }}>We got your request!</h3>
                  <p className="text-sm mb-2" style={{ color: "var(--g-tx3)" }}>Our team will look into this shortly.</p>
                  <p className="font-mono text-xs" style={{ color: "var(--g-tx2)" }}>Ticket ID: {submittedTicketId}</p>
                  <p className="font-mono text-xs mt-0.5" style={{ color: "var(--g-tx2)" }}>Expected response within 2 hours</p>
                  <button onClick={() => setSubmittedTicketId(null)} className="mt-6 text-sm text-[#00d4ff] hover:underline">Submit another request</button>
                </div>
              ) : (
                <div className="border rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                  <div className="p-4 border-b" style={{ borderColor: "var(--g-bd)" }}>
                    <p className="text-xs font-medium mb-3" style={{ color: "var(--g-tx2)" }}>Common issues</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["Where is my order?", "My item arrived damaged", "Wrong item delivered", "Delivery is late"].map((q) => (
                        <button key={q} onClick={() => setSupportDesc(q)}
                          className="text-left text-xs px-3 py-2.5 rounded-xl border transition-colors"
                          style={supportDesc === q ? { borderColor: "#00d4ff40", backgroundColor: "#00d4ff10", color: "#00d4ff" } : { borderColor: "var(--g-bd)", backgroundColor: "var(--g-s2)", color: "var(--g-tx3)" }}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--g-tx2)" }}>Related order</label>
                      <select className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                        value={activeOrder.id} onChange={(e) => setActiveOrder(ORDERS.find((o) => o.id === e.target.value) ?? ORDERS[0])}>
                        {ORDERS.map((o) => <option key={o.id} value={o.id}>{o.id} — {o.item}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--g-tx2)" }}>Issue type</label>
                      <select className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none" style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                        value={issueType} onChange={(e) => setIssueType(e.target.value)}>
                        {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--g-tx2)" }}>Tell us more</label>
                      <textarea value={supportDesc} onChange={(e) => setSupportDesc(e.target.value)} rows={4}
                        placeholder="What happened? The more detail, the faster we can help."
                        className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
                        style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }} />
                    </div>
                    <button onClick={submitTicket} className="w-full bg-[#00d4ff] text-[#070b10] rounded-xl py-3 text-sm font-bold hover:bg-[#00a8cc] transition-colors">Submit Request</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ ACCOUNT ══ */}
          {tab === "account" && (
            <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
              <h2 className="font-bold text-base mb-4" style={{ color: "var(--g-tx)" }}>My Account</h2>
              <div className="border rounded-2xl p-6" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#00d4ff]/10 border-2 border-[#00d4ff]/30 flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-[#00d4ff]">AM</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: "var(--g-tx)" }}>{ACCOUNT.name}</h3>
                    <p className="text-xs" style={{ color: "var(--g-tx2)" }}>Member since {ACCOUNT.joined}</p>
                    <span className="inline-block mt-1 text-xs text-[#00d4ff] bg-[#00d4ff]/10 px-2.5 py-0.5 rounded-full border border-[#00d4ff]/20">Verified ✓</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[{ label: "Email", value: ACCOUNT.email }, { label: "Phone", value: ACCOUNT.phone }, { label: "Address", value: ACCOUNT.address }].map((f) => (
                    <div key={f.label} className="flex items-start justify-between">
                      <span className="text-xs w-20 shrink-0 pt-0.5" style={{ color: "var(--g-tx2)" }}>{f.label}</span>
                      <span className="text-sm text-right flex-1" style={{ color: "var(--g-tx)" }}>{f.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex gap-2">
                  <button className="flex-1 py-2.5 rounded-xl border border-[#00d4ff]/30 text-[#00d4ff] text-sm font-semibold hover:bg-[#00d4ff]/10 transition-colors">Edit Profile</button>
                  <button className="flex-1 py-2.5 rounded-xl border text-sm transition-colors hover:opacity-80" style={{ borderColor: "var(--g-bd)", color: "var(--g-tx2)" }}>Change Password</button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[{ label: "Orders", value: String(ACCOUNT.totalOrders), color: "#00d4ff" }, { label: "Delivered", value: String(ACCOUNT.delivered), color: "#22c55e" }, { label: "Saved", value: "$184", color: "#f59e0b" }].map((s) => (
                  <div key={s.label} className="border rounded-xl p-4 text-center" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                    <p className="text-xs mb-1" style={{ color: "var(--g-tx2)" }}>{s.label}</p>
                    <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="border rounded-2xl p-5" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                <p className="text-sm font-semibold mb-4" style={{ color: "var(--g-tx)" }}>Notifications</p>
                {([{ key: "drone", label: "Drone in-flight updates" }, { key: "delivery", label: "Delivery confirmation" }, { key: "promos", label: "Promotions & offers" }, { key: "summary", label: "Weekly summary" }] as { key: keyof typeof notifToggles; label: string }[]).map((n) => {
                  const on = notifToggles[n.key];
                  return (
                    <div key={n.key} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: "var(--g-s2)" }}>
                      <span className="text-sm" style={{ color: "var(--g-tx3)" }}>{n.label}</span>
                      <button onClick={() => toggleNotif(n.key)}
                        className="w-10 h-6 rounded-full flex items-center px-1 transition-all duration-200 focus:outline-none"
                        style={{ backgroundColor: on ? "#00d4ff33" : "var(--g-s2)", border: `1px solid ${on ? "#00d4ff55" : "var(--g-bd)"}` }}
                        aria-pressed={on}>
                        <div className="w-4 h-4 rounded-full transition-all duration-200" style={{ backgroundColor: on ? "#00d4ff" : "var(--g-bd2)", transform: on ? "translateX(16px)" : "translateX(0)" }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
