import { useState } from "react";
import logo from "@/imports/image.png";
import DashHeader from "@/components/DashHeader";
import AccountSettingsPanel from "@/components/AccountSettingsPanel";
import TicketThread from "@/components/TicketThread";
import DroneMap from "@/components/DroneMap";
import WeatherPanel from "@/components/WeatherPanel";
import { useTickets } from "@/context/TicketContext";
import { useTheme } from "@/context/ThemeContext";
import { deliveryConflictsNoFly, noFlyWindows, fmt12, availableFlyHours, HOURLY_FLYABILITY } from "@/utils/noFlyUtils";

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

type SavedAddress = {
  id: string;
  fullName: string;
  street: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
};

const INITIAL_ADDRESSES: SavedAddress[] = [
  { id: "addr-1", fullName: "Alex Morgan", street: "Prinsengracht 142", apt: "", city: "Amsterdam", state: "Noord-Holland", zip: "1015 EA", phone: "+31 6 1234 5678" },
];

function emptyAddress(): Omit<SavedAddress, "id"> {
  return { fullName: "", street: "", apt: "", city: "", state: "", zip: "", phone: "" };
}

type SavedCard = {
  id: string;
  brand: "Visa" | "Mastercard" | "Amex" | "Discover";
  last4: string;
  expMonth: string;
  expYear: string;
  holderName: string;
};

const CARD_BRAND_COLOR: Record<string, string> = {
  Visa: "#1a1f71", Mastercard: "#eb001b", Amex: "#007bc1", Discover: "#f76f20",
};

const INITIAL_CARDS: SavedCard[] = [
  { id: "card-1", brand: "Visa", last4: "4242", expMonth: "08", expYear: "27", holderName: "Alex Morgan" },
];

type CardForm = {
  holderName: string;
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  billingSameAsShipping: boolean;
  billingStreet: string;
  billingApt: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  saveCard: boolean;
};

function emptyCardForm(): CardForm {
  return {
    holderName: "", number: "", expMonth: "", expYear: "", cvv: "",
    billingSameAsShipping: true,
    billingStreet: "", billingApt: "", billingCity: "", billingState: "", billingZip: "",
    saveCard: true,
  };
}

function detectBrand(num: string): SavedCard["brand"] | null {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^6(?:011|5)/.test(n)) return "Discover";
  return null;
}

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export default function CustomerDashboard({ onLogout }: { onLogout: () => void }) {
  const { isDark } = useTheme();
  const [tab, setTab] = useState("home");
  const [activeOrder, setActiveOrder] = useState(ORDERS[0]);
  const [activeChatOrderId, setActiveChatOrderId] = useState(ORDERS[0].id);
  const [orderChats, setOrderChats] = useState(INIT_ORDER_CHATS);
  const [chatInput, setChatInput] = useState("");
  const [unreadChats, setUnreadChats] = useState<Set<string>>(
    () => new Set(ORDERS.filter((o) => (INIT_ORDER_CHATS[o.id] ?? []).some((m) => m.from === "seller")).map((o) => o.id))
  );
  const [issueType, setIssueType] = useState(ISSUE_TYPES[0]);
  const [supportDesc, setSupportDesc] = useState("");
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null); // null = ASAP
  const [ticketStatusFilter, setTicketStatusFilter] = useState("All");
  const [ticketSort, setTicketSort] = useState<"newest" | "oldest">("newest");
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);

  const [notifToggles, setNotifToggles] = useState({ drone: true, delivery: true, promos: false, summary: true });
  const [activeStat, setActiveStat] = useState<OrderStat>(null);
  const [shopStore, setShopStore] = useState<string | null>(null);
  const [shopSearch, setShopSearch] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [shopCategory, setShopCategory] = useState("All");
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "address" | "payment" | "done">("cart");
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(INITIAL_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("addr-1");
  const [addrModal, setAddrModal] = useState<{ open: boolean; editId: string | null }>({ open: false, editId: null });
  const [addrForm, setAddrForm] = useState<Omit<SavedAddress, "id">>(emptyAddress());
  const [addrSaveForFuture, setAddrSaveForFuture] = useState(true);
  const [savedCards, setSavedCards] = useState<SavedCard[]>(INITIAL_CARDS);
  const [selectedCardId, setSelectedCardId] = useState<string>("card-1");
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardForm, setCardForm] = useState<CardForm>(emptyCardForm());
  const { addTicket, tickets } = useTickets();

  const TICKET_STATUS_COLOR: Record<string, { bg: string; text: string; border: string }> = {
    "Open":                  { bg: "#00d4ff18", text: "#00d4ff", border: "#00d4ff44" },
    "In Review":             { bg: "#f59e0b18", text: "#f59e0b", border: "#f59e0b44" },
    "Waiting for Customer":  { bg: "#a78bfa18", text: "#a78bfa", border: "#a78bfa44" },
    "Waiting for Seller":    { bg: "#fb923c18", text: "#fb923c", border: "#fb923c44" },
    "Waiting for IT":        { bg: "#fbbf2418", text: "#fbbf24", border: "#fbbf2444" },
    "Waiting for Support":   { bg: "#fb923c18", text: "#fb923c", border: "#fb923c44" },
    "Resolved":              { bg: "#22c55e18", text: "#22c55e", border: "#22c55e44" },
    "Closed":                { bg: "var(--g-s2)",  text: "var(--g-tx3)", border: "var(--g-bd)" },
  };
  const PRIORITY_COLOR: Record<string, string> = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };

  const myTickets = tickets.filter((t) => t.from === "customer" && t.fromName === "Alex Morgan");
  const visibleTickets = (() => {
    let list = ticketStatusFilter === "All" ? myTickets : myTickets.filter((t) => t.status === ticketStatusFilter);
    return ticketSort === "oldest" ? [...list].reverse() : list;
  })();
  const openTicket = openTicketId ? myTickets.find((t) => t.id === openTicketId) ?? null : null;

  function toggleNotif(key: keyof typeof notifToggles) {
    setNotifToggles((p) => ({ ...p, [key]: !p[key] }));
  }

  function openAddAddress() {
    setAddrForm(emptyAddress());
    setAddrSaveForFuture(true);
    setAddrModal({ open: true, editId: null });
  }

  function openEditAddress(id: string) {
    const addr = savedAddresses.find((a) => a.id === id);
    if (!addr) return;
    const { id: _id, ...rest } = addr;
    setAddrForm(rest);
    setAddrModal({ open: true, editId: id });
  }

  function deleteAddress(id: string) {
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
    if (selectedAddressId === id) setSelectedAddressId(savedAddresses.find((a) => a.id !== id)?.id ?? "");
  }

  function saveAddrForm() {
    if (addrModal.editId) {
      setSavedAddresses((prev) => prev.map((a) => a.id === addrModal.editId ? { ...addrForm, id: addrModal.editId } : a));
    } else {
      const newId = `addr-${Date.now()}`;
      if (addrSaveForFuture) {
        setSavedAddresses((prev) => [...prev, { ...addrForm, id: newId }]);
        setSelectedAddressId(newId);
      } else {
        setSavedAddresses((prev) => {
          const tempId = `addr-temp-${Date.now()}`;
          const filtered = prev.filter((a) => !a.id.startsWith("addr-temp-"));
          setSelectedAddressId(tempId);
          return [...filtered, { ...addrForm, id: tempId }];
        });
      }
    }
    setAddrModal({ open: false, editId: null });
  }

  const addrFormValid = addrForm.fullName.trim() && addrForm.street.trim() && addrForm.city.trim() && addrForm.zip.trim();

  function deleteCard(id: string) {
    setSavedCards((prev) => prev.filter((c) => c.id !== id));
    if (selectedCardId === id) setSelectedCardId(savedCards.find((c) => c.id !== id)?.id ?? "");
  }

  function submitCardForm() {
    const digits = cardForm.number.replace(/\s/g, "");
    const brand = detectBrand(digits) ?? "Visa";
    const last4 = digits.slice(-4);
    if (cardForm.saveCard) {
      const newId = `card-${Date.now()}`;
      setSavedCards((prev) => [...prev, { id: newId, brand, last4, expMonth: cardForm.expMonth, expYear: cardForm.expYear, holderName: cardForm.holderName }]);
      setSelectedCardId(newId);
    } else {
      const tempId = `card-temp-${Date.now()}`;
      setSavedCards((prev) => [...prev.filter((c) => !c.id.startsWith("card-temp-")), { id: tempId, brand, last4, expMonth: cardForm.expMonth, expYear: cardForm.expYear, holderName: cardForm.holderName }]);
      setSelectedCardId(tempId);
    }
    setShowCardForm(false);
    setCardForm(emptyCardForm());
  }

  const cardFormValid =
    cardForm.holderName.trim() &&
    cardForm.number.replace(/\s/g, "").length >= 15 &&
    cardForm.expMonth && cardForm.expYear && cardForm.cvv.length >= 3 &&
    (cardForm.billingSameAsShipping || (cardForm.billingStreet.trim() && cardForm.billingCity.trim() && cardForm.billingZip.trim()));

  function openChat(orderId: string) {
    setActiveChatOrderId(orderId);
    setUnreadChats((prev) => { const next = new Set(prev); next.delete(orderId); return next; });
  }
  function toggleChatRead(orderId: string) {
    setUnreadChats((prev) => {
      const next = new Set(prev);
      next.has(orderId) ? next.delete(orderId) : next.add(orderId);
      return next;
    });
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

  // Filtered orders for My Orders tab (stat chips drill-down)
  const filteredOrders = activeStat
    ? ORDERS.filter((o) => {
        if (activeStat === "active") return o.status === "In Flight" || o.status === "Preparing";
        if (activeStat === "delivered") return o.status === "Delivered";
        if (activeStat === "failed") return o.status === "Failed";
        return true;
      })
    : ORDERS;

  // ── Order list filter / sort ──
  type CustSortKey = "newest" | "oldest" | "value-desc" | "value-asc" | "seller";
  const CUST_STATUS_OPTIONS = ["All", "In Flight", "Preparing", "Delivered", "Failed"] as const;
  const [custStatusFilter, setCustStatusFilter] = useState<string>("All");
  const [custSort, setCustSort] = useState<CustSortKey>("newest");

  const custFiltersActive = custStatusFilter !== "All" || custSort !== "newest";
  function clearCustFilters() { setCustStatusFilter("All"); setCustSort("newest"); }

  const baseOrders = activeStat ? filteredOrders : ORDERS;
  const visibleCustOrders = (() => {
    let list = [...baseOrders];
    if (custStatusFilter !== "All") list = list.filter((o) => o.status === custStatusFilter);
    switch (custSort) {
      case "oldest":     list.sort((a, b) => a.id.localeCompare(b.id)); break;
      case "seller":     list.sort((a, b) => a.seller.localeCompare(b.seller)); break;
      case "value-desc": list.sort((a, b) => parseFloat(b.value.replace(/[^0-9.]/g, "")) - parseFloat(a.value.replace(/[^0-9.]/g, ""))); break;
      case "value-asc":  list.sort((a, b) => parseFloat(a.value.replace(/[^0-9.]/g, "")) - parseFloat(b.value.replace(/[^0-9.]/g, ""))); break;
      default:           list.sort((a, b) => b.id.localeCompare(a.id)); break;
    }
    return list;
  })();

  return (
    <div className="min-h-full flex flex-col relative" style={{ backgroundColor: "var(--g-bg)", fontFamily: "'Inter', sans-serif" }}>

      <div className="relative z-10 flex flex-col flex-1">
        <DashHeader role="Customer" name="Alex Morgan" onLogout={onLogout} accent="#00d4ff" />

        {/* Tab bar */}
        <div className="border-b px-2 overflow-x-auto shrink-0" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
          <div className="flex min-w-max">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${tab === t.id ? "border-[#00d4ff] text-[#00d4ff]" : "border-transparent hover:text-[#c8d8e8]"}`}
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
                  <button onClick={() => { openChat(activeOrder.id); setTab("chat"); }} className="flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors hover:opacity-80" style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}>
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

            const selectedAddr = savedAddresses.find((a) => a.id === selectedAddressId);

            if (checkoutDone) return (
              <div className="max-w-md mx-auto p-6 flex flex-col items-center justify-center" style={{ minHeight: 400 }}>
                <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center mb-5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2.5} className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold mb-1" style={{ color: "var(--g-tx)" }}>Order placed!</h2>
                <p className="text-sm text-center mb-1" style={{ color: "var(--g-tx3)" }}>Your drone is being assigned. Track it in the Live Tracking tab.</p>
                <p className="font-mono text-xs mb-1" style={{ color: "var(--g-tx2)" }}>Estimated delivery: ~10 min</p>
                {selectedAddr && (
                  <p className="text-xs mb-6 text-center" style={{ color: "var(--g-tx3)" }}>
                    Delivering to: <span className="font-semibold" style={{ color: "var(--g-tx)" }}>{selectedAddr.street}, {selectedAddr.city}</span>
                  </p>
                )}
                <button
                  onClick={() => { setCheckoutDone(false); setCheckoutStep("cart"); setCart({}); setShopStore(null); }}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#00d4ff] text-[#070b10] hover:bg-[#00b8d9] transition-colors"
                >
                  Place another order
                </button>
              </div>
            );

            if (checkoutStep === "address") return (
              <div className="max-w-lg mx-auto p-4 md:p-6 space-y-4">
                {/* Header */}
                <div>
                  <button onClick={() => setCheckoutStep("cart")} className="flex items-center gap-1.5 text-xs mb-3 hover:opacity-70" style={{ color: "var(--g-tx2)" }}>
                    ← Back to cart
                  </button>
                  <h2 className="font-bold text-xl mb-0.5" style={{ color: "var(--g-tx)" }}>Shipping address</h2>
                  <p className="text-xs" style={{ color: "var(--g-tx3)" }}>Select a saved address or add a new one for drone delivery.</p>
                </div>

                {/* Saved address cards */}
                <div className="space-y-2">
                  {savedAddresses.map((addr) => {
                    const isSelected = addr.id === selectedAddressId;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className="rounded-xl border p-4 cursor-pointer transition-all"
                        style={{
                          backgroundColor: isSelected ? "#00d4ff0e" : "var(--g-s1)",
                          borderColor: isSelected ? "#00d4ff" : "var(--g-bd)",
                          boxShadow: isSelected ? "0 0 0 1px #00d4ff33" : "none",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Radio indicator */}
                          <div className="mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                            style={{ borderColor: isSelected ? "#00d4ff" : "var(--g-bd)", backgroundColor: isSelected ? "#00d4ff" : "transparent" }}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#070b10]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold" style={{ color: "var(--g-tx)" }}>{addr.fullName}</p>
                              {isSelected && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#00d4ff] text-[#070b10]">SELECTED</span>
                              )}
                            </div>
                            <p className="text-xs" style={{ color: "var(--g-tx3)" }}>
                              {addr.street}{addr.apt ? `, ${addr.apt}` : ""}
                            </p>
                            <p className="text-xs" style={{ color: "var(--g-tx3)" }}>
                              {addr.city}, {addr.state} {addr.zip}
                            </p>
                            {addr.phone && <p className="text-xs mt-0.5" style={{ color: "var(--g-tx2)" }}>{addr.phone}</p>}
                          </div>
                          {/* Edit / Delete */}
                          <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openEditAddress(addr.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
                              style={{ backgroundColor: "var(--g-s2)", color: "var(--g-tx2)" }}
                              title="Edit address"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteAddress(addr.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
                              style={{ backgroundColor: "var(--g-s2)", color: "#ef4444" }}
                              title="Delete address"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add new address button */}
                <button
                  onClick={openAddAddress}
                  className="w-full border rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ borderColor: "#00d4ff44", borderStyle: "dashed", color: "#00d4ff", backgroundColor: "#00d4ff08" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add new address
                </button>

                {/* Order summary */}
                <div className="border rounded-xl p-3 space-y-1" style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)" }}>
                  <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: "var(--g-tx4)" }}>Order summary</p>
                  {cartItems.map(([id, qty]) => {
                    const item = Object.values(CATALOG).flat().find((p) => p.id === id);
                    return item ? (
                      <div key={id} className="flex justify-between text-xs" style={{ color: "var(--g-tx3)" }}>
                        <span>{item.name} ×{qty}</span>
                        <span className="font-mono">${(parseFloat(item.price.replace("$", "")) * qty).toFixed(2)}</span>
                      </div>
                    ) : null;
                  })}
                  <div className="pt-2 mt-2 border-t flex justify-between text-sm font-bold" style={{ borderColor: "var(--g-bd)", color: "var(--g-tx)" }}>
                    <span>Total</span>
                    <span className="font-mono">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Delivery time selector */}
                {(() => {
                  const nowHour = new Date().getHours();
                  const upcomingSlots = HOURLY_FLYABILITY.filter((h) => parseInt(h.time) > nowHour);
                  return (
                    <div className="border rounded-xl p-4 space-y-3" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                      <p className="text-xs font-semibold" style={{ color: "var(--g-tx)" }}>When do you want delivery?</p>
                      <div className="flex flex-wrap gap-2">
                        {/* ASAP chip */}
                        <button
                          onClick={() => setScheduledTime(null)}
                          className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-all"
                          style={{
                            backgroundColor: scheduledTime === null ? "#00d4ff18" : "var(--g-s2)",
                            borderColor: scheduledTime === null ? "#00d4ff" : "var(--g-bd)",
                            color: scheduledTime === null ? "#00d4ff" : "var(--g-tx2)",
                          }}
                        >
                          🚁 As soon as possible
                        </button>
                        {/* Future flyable hours */}
                        {upcomingSlots.map((slot) => {
                          const isSel = scheduledTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              disabled={!slot.flyable}
                              onClick={() => setScheduledTime(slot.time)}
                              className="text-xs px-3 py-1.5 rounded-lg border font-mono transition-all disabled:opacity-35 disabled:cursor-not-allowed"
                              title={slot.flyable ? "" : "No-fly restriction"}
                              style={{
                                backgroundColor: isSel ? "#00d4ff18" : slot.flyable ? "var(--g-s2)" : "#ef444408",
                                borderColor: isSel ? "#00d4ff" : slot.flyable ? "var(--g-bd)" : "#ef444430",
                                color: isSel ? "#00d4ff" : slot.flyable ? "var(--g-tx2)" : "#ef4444",
                              }}
                            >
                              {slot.flyable ? fmt12(slot.time) : `${fmt12(slot.time)} 🚫`}
                            </button>
                          );
                        })}
                      </div>
                      {scheduledTime && (
                        <p className="text-[10px] font-mono" style={{ color: "var(--g-tx3)" }}>
                          Drone will be dispatched to arrive by <span style={{ color: "#00d4ff" }}>{fmt12(scheduledTime)}</span>
                        </p>
                      )}
                    </div>
                  );
                })()}

                <button
                  disabled={!selectedAddr}
                  onClick={() => setCheckoutStep("payment")}
                  className="w-full rounded-xl py-3.5 text-base font-semibold bg-[#00d4ff] text-[#070b10] hover:bg-[#00b8d9] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Continue to payment →
                </button>

                {/* Address modal */}
                {addrModal.open && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={() => setAddrModal({ open: false, editId: null })}>
                    <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ backgroundColor: "var(--g-s1)", border: "1px solid var(--g-bd)" }} onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm" style={{ color: "var(--g-tx)" }}>{addrModal.editId ? "Edit address" : "Add new address"}</h3>
                        <button onClick={() => setAddrModal({ open: false, editId: null })} className="hover:opacity-70 transition-opacity" style={{ color: "var(--g-tx2)" }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Full name", key: "fullName" as const, placeholder: "Alex Morgan", colSpan: "col-span-2" },
                          { label: "Street address", key: "street" as const, placeholder: "123 Main St", colSpan: "col-span-2" },
                          { label: "Apt / Unit", key: "apt" as const, placeholder: "Apt 4B (optional)", colSpan: "col-span-2" },
                          { label: "City", key: "city" as const, placeholder: "Amsterdam", colSpan: "" },
                          { label: "State / Province", key: "state" as const, placeholder: "Noord-Holland", colSpan: "" },
                          { label: "ZIP / Postcode", key: "zip" as const, placeholder: "1015 EA", colSpan: "" },
                          { label: "Phone number", key: "phone" as const, placeholder: "+31 6 1234 5678", colSpan: "" },
                        ].map(({ label, key, placeholder, colSpan }) => (
                          <div key={key} className={colSpan || ""}>
                            <label className="text-xs font-medium block mb-1" style={{ color: "var(--g-tx2)" }}>{label}</label>
                            <input
                              value={addrForm[key]}
                              onChange={(e) => setAddrForm((f) => ({ ...f, [key]: e.target.value }))}
                              placeholder={placeholder}
                              className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors"
                              style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                              onFocus={(e) => (e.currentTarget.style.borderColor = "#00d4ff66")}
                              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--g-bd)")}
                            />
                          </div>
                        ))}
                      </div>

                      {!addrModal.editId && (
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <button
                            type="button"
                            onClick={() => setAddrSaveForFuture((s) => !s)}
                            className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                            style={{ borderColor: addrSaveForFuture ? "#00d4ff" : "var(--g-bd)", backgroundColor: addrSaveForFuture ? "#00d4ff" : "transparent" }}
                          >
                            {addrSaveForFuture && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="#070b10" strokeWidth={3} className="w-2.5 h-2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                          </button>
                          <span className="text-xs" style={{ color: "var(--g-tx3)" }}>Save this address for future orders</span>
                        </label>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setAddrModal({ open: false, editId: null })}
                          className="flex-1 py-2.5 rounded-xl text-sm border transition-colors hover:opacity-80"
                          style={{ borderColor: "var(--g-bd)", color: "var(--g-tx2)" }}
                        >
                          Cancel
                        </button>
                        <button
                          disabled={!addrFormValid}
                          onClick={saveAddrForm}
                          className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#00d4ff] text-[#070b10] hover:bg-[#00b8d9] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {addrModal.editId ? "Save changes" : "Add address"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );

            if (checkoutStep === "payment") {
              const shipping = 0; // free drone delivery
              const tax = parseFloat((cartTotal * 0.09).toFixed(2));
              const grandTotal = parseFloat((cartTotal + shipping + tax).toFixed(2));
              const selectedCard = savedCards.find((c) => c.id === selectedCardId);
              const selectedAddr = savedAddresses.find((a) => a.id === selectedAddressId);
              const brand = detectBrand(cardForm.number.replace(/\s/g, ""));

              // No-fly validation
              const maxEtaMin = cartItems.reduce((max, [id]) => {
                const item = Object.values(CATALOG).flat().find((p) => p.id === id);
                if (!item) return max;
                const mins = parseInt(item.eta.replace(/[^0-9]/g, "")) || 0;
                return Math.max(max, mins);
              }, 0);
              const noFlyConflict = scheduledTime
                ? !(HOURLY_FLYABILITY.find((h) => h.time === scheduledTime)?.flyable ?? true)
                : deliveryConflictsNoFly(maxEtaMin);
              const noFlyBlocks = noFlyWindows();
              const flyableHours = availableFlyHours();
              const orderBlocked = noFlyConflict;

              return (
                <div className="max-w-lg mx-auto p-4 md:p-6 space-y-4">
                  {/* Header */}
                  <div>
                    <button onClick={() => setCheckoutStep("address")} className="flex items-center gap-1.5 text-xs mb-3 hover:opacity-70" style={{ color: "var(--g-tx2)" }}>
                      ← Back to shipping
                    </button>
                    <h2 className="font-bold text-xl mb-0.5" style={{ color: "var(--g-tx)" }}>Payment</h2>
                    <p className="text-xs" style={{ color: "var(--g-tx3)" }}>Select a saved card or add a new payment method.</p>
                  </div>

                  {/* Saved cards */}
                  {savedCards.length > 0 && !showCardForm && (
                    <div className="space-y-2">
                      {savedCards.map((card) => {
                        const isSel = card.id === selectedCardId;
                        const brandColor = CARD_BRAND_COLOR[card.brand] ?? "#00d4ff";
                        return (
                          <div
                            key={card.id}
                            onClick={() => { setSelectedCardId(card.id); setShowCardForm(false); }}
                            className="rounded-xl border p-4 cursor-pointer transition-all"
                            style={{
                              backgroundColor: isSel ? "#00d4ff0e" : "var(--g-s1)",
                              borderColor: isSel ? "#00d4ff" : "var(--g-bd)",
                              boxShadow: isSel ? "0 0 0 1px #00d4ff33" : "none",
                            }}
                          >
                            <div className="flex items-center gap-3">
                              {/* Radio */}
                              <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                                style={{ borderColor: isSel ? "#00d4ff" : "var(--g-bd)", backgroundColor: isSel ? "#00d4ff" : "transparent" }}>
                                {isSel && <div className="w-1.5 h-1.5 rounded-full bg-[#070b10]" />}
                              </div>
                              {/* Brand chip */}
                              <div className="w-10 h-6 rounded flex items-center justify-center shrink-0 text-[9px] font-black tracking-tight text-white"
                                style={{ backgroundColor: brandColor }}>
                                {card.brand === "Mastercard" ? "MC" : card.brand.slice(0, 4).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold" style={{ color: "var(--g-tx)" }}>
                                    {card.brand} •••• {card.last4}
                                  </p>
                                  {isSel && <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-[#00d4ff] text-[#070b10]">SELECTED</span>}
                                </div>
                                <p className="text-xs" style={{ color: "var(--g-tx2)" }}>
                                  {card.holderName} · Expires {card.expMonth}/{card.expYear}
                                </p>
                              </div>
                              {/* Delete */}
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-colors shrink-0"
                                style={{ backgroundColor: "var(--g-s2)", color: "#ef4444" }}
                                title="Remove card"
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

                  {/* Add new payment method toggle */}
                  {!showCardForm ? (
                    <button
                      onClick={() => { setShowCardForm(true); setSelectedCardId(""); setCardForm(emptyCardForm()); }}
                      className="w-full border rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
                      style={{ borderColor: "#00d4ff44", borderStyle: "dashed", color: "#00d4ff", backgroundColor: "#00d4ff08" }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add new payment method
                    </button>
                  ) : (
                    /* New card form */
                    <div className="border rounded-2xl p-4 space-y-3" style={{ backgroundColor: "var(--g-s1)", borderColor: "#00d4ff44" }}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold" style={{ color: "var(--g-tx)" }}>New card</p>
                        {savedCards.length > 0 && (
                          <button onClick={() => { setShowCardForm(false); setSelectedCardId(savedCards[0].id); }} className="text-xs hover:opacity-70" style={{ color: "var(--g-tx2)" }}>
                            ← Use saved card
                          </button>
                        )}
                      </div>

                      {/* Cardholder name */}
                      <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: "var(--g-tx2)" }}>Cardholder name</label>
                        <input
                          value={cardForm.holderName}
                          onChange={(e) => setCardForm((f) => ({ ...f, holderName: e.target.value }))}
                          placeholder="Alex Morgan"
                          className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors"
                          style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#00d4ff66")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--g-bd)")}
                        />
                      </div>

                      {/* Card number */}
                      <div>
                        <label className="text-xs font-medium block mb-1" style={{ color: "var(--g-tx2)" }}>
                          Card number
                          {brand && (
                            <span className="ml-2 text-[9px] font-black px-1.5 py-0.5 rounded text-white"
                              style={{ backgroundColor: CARD_BRAND_COLOR[brand] }}>
                              {brand === "Mastercard" ? "MC" : brand.slice(0, 4).toUpperCase()}
                            </span>
                          )}
                        </label>
                        <input
                          value={cardForm.number}
                          onChange={(e) => setCardForm((f) => ({ ...f, number: formatCardNumber(e.target.value) }))}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none transition-colors"
                          style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "#00d4ff66")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--g-bd)")}
                        />
                      </div>

                      {/* Expiry + CVV */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs font-medium block mb-1" style={{ color: "var(--g-tx2)" }}>Month</label>
                          <input
                            value={cardForm.expMonth}
                            onChange={(e) => setCardForm((f) => ({ ...f, expMonth: e.target.value.replace(/\D/g, "").slice(0, 2) }))}
                            placeholder="MM"
                            maxLength={2}
                            className="w-full border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none transition-colors"
                            style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = "#00d4ff66")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--g-bd)")}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium block mb-1" style={{ color: "var(--g-tx2)" }}>Year</label>
                          <input
                            value={cardForm.expYear}
                            onChange={(e) => setCardForm((f) => ({ ...f, expYear: e.target.value.replace(/\D/g, "").slice(0, 2) }))}
                            placeholder="YY"
                            maxLength={2}
                            className="w-full border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none transition-colors"
                            style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = "#00d4ff66")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--g-bd)")}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium block mb-1" style={{ color: "var(--g-tx2)" }}>CVV</label>
                          <input
                            value={cardForm.cvv}
                            onChange={(e) => setCardForm((f) => ({ ...f, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                            placeholder="•••"
                            maxLength={4}
                            type="password"
                            className="w-full border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none transition-colors"
                            style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = "#00d4ff66")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--g-bd)")}
                          />
                        </div>
                      </div>

                      {/* Billing address */}
                      <div className="pt-1">
                        <label className="flex items-center gap-2.5 cursor-pointer mb-3">
                          <button
                            type="button"
                            onClick={() => setCardForm((f) => ({ ...f, billingSameAsShipping: !f.billingSameAsShipping }))}
                            className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                            style={{ borderColor: cardForm.billingSameAsShipping ? "#00d4ff" : "var(--g-bd)", backgroundColor: cardForm.billingSameAsShipping ? "#00d4ff" : "transparent" }}
                          >
                            {cardForm.billingSameAsShipping && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="#070b10" strokeWidth={3} className="w-2.5 h-2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                          </button>
                          <span className="text-xs" style={{ color: "var(--g-tx3)" }}>Billing address same as shipping address</span>
                        </label>

                        {!cardForm.billingSameAsShipping && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--g-tx4)" }}>Billing address</p>
                            {[
                              { label: "Street address", key: "billingStreet" as const, placeholder: "123 Main St" },
                              { label: "Apt / Unit", key: "billingApt" as const, placeholder: "Apt 4B (optional)" },
                            ].map(({ label, key, placeholder }) => (
                              <div key={key}>
                                <label className="text-xs font-medium block mb-1" style={{ color: "var(--g-tx2)" }}>{label}</label>
                                <input
                                  value={cardForm[key]}
                                  onChange={(e) => setCardForm((f) => ({ ...f, [key]: e.target.value }))}
                                  placeholder={placeholder}
                                  className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors"
                                  style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                                  onFocus={(e) => (e.currentTarget.style.borderColor = "#00d4ff66")}
                                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--g-bd)")}
                                />
                              </div>
                            ))}
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { label: "City", key: "billingCity" as const, placeholder: "Amsterdam" },
                                { label: "State / Province", key: "billingState" as const, placeholder: "Noord-Holland" },
                                { label: "ZIP / Postcode", key: "billingZip" as const, placeholder: "1015 EA" },
                              ].map(({ label, key, placeholder }) => (
                                <div key={key}>
                                  <label className="text-xs font-medium block mb-1" style={{ color: "var(--g-tx2)" }}>{label}</label>
                                  <input
                                    value={cardForm[key]}
                                    onChange={(e) => setCardForm((f) => ({ ...f, [key]: e.target.value }))}
                                    placeholder={placeholder}
                                    className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors"
                                    style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)" }}
                                    onFocus={(e) => (e.currentTarget.style.borderColor = "#00d4ff66")}
                                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--g-bd)")}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Save card checkbox */}
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <button
                          type="button"
                          onClick={() => setCardForm((f) => ({ ...f, saveCard: !f.saveCard }))}
                          className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                          style={{ borderColor: cardForm.saveCard ? "#00d4ff" : "var(--g-bd)", backgroundColor: cardForm.saveCard ? "#00d4ff" : "transparent" }}
                        >
                          {cardForm.saveCard && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#070b10" strokeWidth={3} className="w-2.5 h-2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>
                        <span className="text-xs" style={{ color: "var(--g-tx3)" }}>Save this card for future orders</span>
                      </label>

                      <button
                        disabled={!cardFormValid}
                        onClick={submitCardForm}
                        className="w-full rounded-xl py-2.5 text-sm font-bold bg-[#00d4ff] text-[#070b10] hover:bg-[#00b8d9] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Use this card
                      </button>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t" style={{ borderColor: "var(--g-bd)" }} />

                  {/* Shipping address recap */}
                  {selectedAddr && (
                    <div className="rounded-xl border p-3 flex items-start gap-3" style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--g-tx2)" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: "var(--g-tx4)" }}>Shipping to</p>
                        <p className="text-xs font-semibold" style={{ color: "var(--g-tx)" }}>{selectedAddr.fullName}</p>
                        <p className="text-xs" style={{ color: "var(--g-tx3)" }}>
                          {selectedAddr.street}{selectedAddr.apt ? `, ${selectedAddr.apt}` : ""}, {selectedAddr.city} {selectedAddr.zip}
                        </p>
                      </div>
                      <button onClick={() => setCheckoutStep("address")} className="text-xs shrink-0 hover:opacity-70 transition-opacity" style={{ color: "#00d4ff" }}>Change</button>
                    </div>
                  )}

                  {/* Order total breakdown */}
                  <div className="border rounded-xl overflow-hidden" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                    <div className="px-4 py-3 border-b" style={{ borderColor: "var(--g-bd)" }}>
                      <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--g-tx4)" }}>Order summary</p>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      {cartItems.map(([id, qty]) => {
                        const item = Object.values(CATALOG).flat().find((p) => p.id === id);
                        return item ? (
                          <div key={id} className="flex justify-between text-xs" style={{ color: "var(--g-tx3)" }}>
                            <span className="truncate mr-2">{item.name} ×{qty}</span>
                            <span className="font-mono shrink-0">${(parseFloat(item.price.replace("$", "")) * qty).toFixed(2)}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                    <div className="px-4 pb-3 space-y-1.5 border-t" style={{ borderColor: "var(--g-bd)" }}>
                      <div className="flex justify-between text-xs pt-3" style={{ color: "var(--g-tx3)" }}>
                        <span>Subtotal</span>
                        <span className="font-mono">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs" style={{ color: "var(--g-tx3)" }}>
                        <span>Delivery</span>
                        <span className="font-mono" style={{ color: "#00d4ff" }}>
                          {scheduledTime ? `Scheduled · ${fmt12(scheduledTime)}` : "ASAP 🚁"}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs" style={{ color: "var(--g-tx3)" }}>
                        <span>Shipping</span>
                        <span className="font-mono text-[#22c55e]">Free 🚁</span>
                      </div>
                      <div className="flex justify-between text-xs" style={{ color: "var(--g-tx3)" }}>
                        <span>Taxes (9%)</span>
                        <span className="font-mono">${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-2 border-t" style={{ borderColor: "var(--g-bd)", color: "var(--g-tx)" }}>
                        <span>Total</span>
                        <span className="font-mono">${grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* No-fly restriction banner */}
                  {orderBlocked && (
                    <div className="rounded-xl border p-4 space-y-3" style={{ backgroundColor: "#ef444410", borderColor: "#ef444440" }}>
                      <div className="flex items-start gap-2.5">
                        <span className="text-base shrink-0">🚫</span>
                        <div>
                          <p className="text-sm font-bold" style={{ color: "#ef4444" }}>Drone delivery unavailable</p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--g-tx3)" }}>
                            No-fly restriction active: <span className="font-mono font-semibold">{noFlyBlocks.map((b) => b.split("–").map(fmt12).join("–")).join(", ")}</span>.
                            {scheduledTime ? " Your selected time falls within this window." : " Your estimated delivery would arrive during this window."}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--g-tx2)" }}>Select a different delivery time:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {flyableHours
                            .filter((h) => parseInt(h) >= new Date().getHours())
                            .slice(0, 8)
                            .map((h) => {
                              const isSel = scheduledTime === h;
                              return (
                                <button
                                  key={h}
                                  onClick={() => setScheduledTime(h)}
                                  className="font-mono text-[10px] px-2.5 py-1.5 rounded-lg border transition-all"
                                  style={{
                                    backgroundColor: isSel ? "#22c55e22" : "#22c55e10",
                                    borderColor: isSel ? "#22c55e" : "#22c55e44",
                                    color: "#22c55e",
                                    fontWeight: isSel ? 700 : 400,
                                    boxShadow: isSel ? "0 0 0 1px #22c55e55" : "none",
                                  }}
                                >
                                  {isSel ? "✓ " : ""}{fmt12(h)}
                                </button>
                              );
                            })}
                        </div>
                        {scheduledTime && !noFlyConflict && (
                          <p className="text-xs mt-2 font-semibold" style={{ color: "#22c55e" }}>
                            ✓ Delivery scheduled for {fmt12(scheduledTime)} — restriction cleared
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Place Order button */}
                  <button
                    disabled={!selectedCard || showCardForm || orderBlocked}
                    onClick={() => setCheckoutDone(true)}
                    className="w-full rounded-xl py-3.5 text-base font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#00d4ff", color: "#070b10" }}
                    onMouseEnter={(e) => { if (!(!selectedCard || showCardForm || orderBlocked)) e.currentTarget.style.backgroundColor = "#00b8d9"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#00d4ff"; }}
                  >
                    {orderBlocked
                      ? "Delivery unavailable — no-fly restriction"
                      : selectedCard
                        ? `Place Order · $${grandTotal.toFixed(2)}`
                        : "Select a payment method to continue"}
                  </button>

                  <p className="text-center text-[10px]" style={{ color: "var(--g-tx4)" }}>
                    🔒 Your payment is encrypted and secure
                  </p>
                </div>
              );
            }

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
                    <h2 className="font-bold text-xl" style={{ color: "var(--g-tx)" }}>
                      {shopStore ? STORES.find((s) => s.id === shopStore)?.name : "Choose a Store"}
                    </h2>
                    {!shopStore && <p className="text-xs mt-0.5" style={{ color: "var(--g-tx2)" }}>Delivered by drone in minutes</p>}
                  </div>
                  {cartCount > 0 && (
                    <button
                      onClick={() => setCheckoutStep("address")}
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
                          onClick={() => setCheckoutStep("address")}
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
              <h2 className="font-bold text-xl" style={{ color: "var(--g-tx)" }}>My Orders</h2>

              {/* ── Filter & sort controls ── */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--g-tx2)" }}>Status</label>
                  <select
                    value={custStatusFilter}
                    onChange={(e) => setCustStatusFilter(e.target.value)}
                    className="border rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none transition-colors"
                    style={{ backgroundColor: "var(--g-s2)", borderColor: custStatusFilter !== "All" ? "#00d4ff88" : "var(--g-bd)", color: "var(--g-tx)", cursor: "pointer" }}
                  >
                    {CUST_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--g-tx2)" }}>Sort</label>
                  <select
                    value={custSort}
                    onChange={(e) => setCustSort(e.target.value as CustSortKey)}
                    className="border rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none transition-colors"
                    style={{ backgroundColor: "var(--g-s2)", borderColor: custSort !== "newest" ? "#00d4ff88" : "var(--g-bd)", color: "var(--g-tx)", cursor: "pointer" }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="seller">Seller Name</option>
                    <option value="value-desc">Order Total ↓</option>
                    <option value="value-asc">Order Total ↑</option>
                  </select>
                </div>
                {custFiltersActive && (
                  <>
                    <span className="text-[10px] font-mono px-2 py-1 rounded-full" style={{ backgroundColor: "#00d4ff18", color: "#00d4ff", border: "1px solid #00d4ff44" }}>
                      {visibleCustOrders.length} of {baseOrders.length} shown
                    </span>
                    <button
                      onClick={clearCustFilters}
                      className="text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-colors hover:opacity-80"
                      style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx2)" }}
                    >
                      ✕ Clear filters
                    </button>
                  </>
                )}
              </div>

              {/* Order list */}
              <div className="space-y-3">
                {visibleCustOrders.length === 0 && (
                  <p className="text-sm text-center py-8 font-mono" style={{ color: "var(--g-tx4)" }}>No orders match the current filters</p>
                )}
                {visibleCustOrders.map((o) => (
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
                <h2 className="font-bold text-xl" style={{ color: "var(--g-tx)" }}>Live Drone Tracking</h2>
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
              <h2 className="font-bold text-xl mb-4" style={{ color: "var(--g-tx)" }}>Weather Conditions</h2>
              <WeatherPanel />
            </div>
          )}

          {/* ══ SELLER CHAT ══ */}
          {tab === "chat" && (
            <div className="max-w-3xl mx-auto p-4 md:p-6">
              <h2 className="font-bold text-xl mb-4" style={{ color: "var(--g-tx)" }}>Seller Chat</h2>
              <div className="flex border rounded-2xl overflow-hidden" style={{ minHeight: 480, backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                {/* Thread list — orders */}
                <div className="w-56 border-r shrink-0 flex flex-col overflow-y-auto" style={{ borderColor: "var(--g-bd)" }}>
                  {ORDERS.map((o) => {
                    const msgs = orderChats[o.id] ?? [];
                    const last = msgs[msgs.length - 1];
                    const isActive = o.id === activeChatOrderId;
                    const isUnread = unreadChats.has(o.id);
                    return (
                      <button key={o.id} onClick={() => openChat(o.id)}
                        className="w-full p-3.5 text-left border-b transition-colors"
                        style={{ borderColor: "var(--g-bd)", backgroundColor: isActive ? "#00d4ff14" : "transparent" }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="relative shrink-0">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: STATUS_COLOR[o.status] + "20", color: STATUS_COLOR[o.status] }}>
                              {o.sellerInitials}
                            </div>
                            {isUnread && (
                              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00d4ff] border border-[var(--g-s1)]" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold truncate" style={{ color: isUnread ? "var(--g-tx)" : "var(--g-tx)", fontWeight: isUnread ? 700 : 500 }}>{o.seller}</p>
                            <p className="font-mono text-[9px]" style={{ color: STATUS_COLOR[o.status] }}>{o.status}</p>
                          </div>
                        </div>
                        <p className="font-mono text-[9px] truncate mb-0.5" style={{ color: "var(--g-tx2)" }}>{o.id}</p>
                        {last && <p className="text-[10px] truncate" style={{ color: isUnread ? "var(--g-tx)" : "var(--g-tx3)", fontWeight: isUnread ? 600 : 400 }}>{last.from === "user" ? "You: " : ""}{last.text}</p>}
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
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => toggleChatRead(activeChatOrder.id)}
                        className="text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-colors hover:opacity-80"
                        style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx2)" }}
                        title={unreadChats.has(activeChatOrder.id) ? "Mark as read" : "Mark as unread"}
                      >
                        {unreadChats.has(activeChatOrder.id) ? "✓ Mark read" : "Mark unread"}
                      </button>
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
            <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
              <h2 className="font-bold text-xl" style={{ color: "var(--g-tx)" }}>Get Help</h2>
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
                    <button onClick={submitTicket} className="w-full bg-[#00d4ff] text-[#070b10] rounded-xl py-3.5 text-base font-semibold hover:bg-[#00a8cc] transition-colors">Submit Request</button>
                  </div>
                </div>
              )}

              {/* ── My Support Tickets ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-semibold text-sm" style={{ color: "var(--g-tx)" }}>My Support Tickets</h3>
                  <span className="text-xs font-mono" style={{ color: "var(--g-tx2)" }}>{myTickets.length} ticket{myTickets.length !== 1 ? "s" : ""}</span>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--g-tx2)" }}>Status</label>
                    <select
                      value={ticketStatusFilter}
                      onChange={(e) => setTicketStatusFilter(e.target.value)}
                      className="border rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                      style={{ backgroundColor: "var(--g-s2)", borderColor: ticketStatusFilter !== "All" ? "#00d4ff88" : "var(--g-bd)", color: "var(--g-tx)", cursor: "pointer" }}
                    >
                      {["All", "Open", "In Review", "Waiting for Customer", "Waiting for IT", "Resolved", "Closed"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--g-tx2)" }}>Sort</label>
                    <select
                      value={ticketSort}
                      onChange={(e) => setTicketSort(e.target.value as "newest" | "oldest")}
                      className="border rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none"
                      style={{ backgroundColor: "var(--g-s2)", borderColor: "var(--g-bd)", color: "var(--g-tx)", cursor: "pointer" }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>

                {/* Ticket detail view */}
                {openTicket && (
                  <TicketThread
                    ticket={openTicket}
                    onBack={() => setOpenTicketId(null)}
                    viewerRole="customer"
                    viewerName="Alex Morgan"
                    viewerAccent="#00d4ff"
                    viewerInitials="AM"
                  />
                )}

                {/* Ticket list */}
                {!openTicket && (
                  <div className="space-y-2">
                    {visibleTickets.length === 0 && (
                      <p className="text-sm text-center py-6 font-mono" style={{ color: "var(--g-tx4)" }}>No tickets match the current filter</p>
                    )}
                    {visibleTickets.map((t) => {
                      const sc = TICKET_STATUS_COLOR[t.status];
                      return (
                        <button key={t.id} onClick={() => setOpenTicketId(t.id)}
                          className="w-full text-left border rounded-2xl p-4 transition-all hover:opacity-90 space-y-2"
                          style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)" }}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-mono text-[10px] text-[#00d4ff]">{t.id}</span>
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full border"
                                  style={{ color: PRIORITY_COLOR[t.priority], backgroundColor: PRIORITY_COLOR[t.priority] + "18", borderColor: PRIORITY_COLOR[t.priority] + "44" }}>
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
                            {t.status === "Waiting for IT" && (
                              <span className="text-[10px] font-semibold" style={{ color: "#fbbf24" }}>IT reviewing your reply</span>
                            )}
                            {(t.status === "Open" || t.status === "In Review") && (
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

          {/* ══ ACCOUNT ══ */}
          {tab === "account" && (
            <div className="p-4 md:p-6">
              <h2 className="font-bold text-xl mb-5" style={{ color: "var(--g-tx)" }}>My Account</h2>
              <AccountSettingsPanel
                accent="#00d4ff"
                initials="AM"
                name={ACCOUNT.name}
                role={`Member since ${ACCOUNT.joined}`}
                initialEmail={ACCOUNT.email}
                initialPhone={ACCOUNT.phone}
                extraSummary={
                  <div className="hidden md:grid grid-cols-3 gap-4 text-center shrink-0">
                    {[{ label: "Orders", value: String(ACCOUNT.totalOrders), color: "#00d4ff" }, { label: "Delivered", value: String(ACCOUNT.delivered), color: "#22c55e" }, { label: "Saved", value: "$184", color: "#f59e0b" }].map((s) => (
                      <div key={s.label}>
                        <p className="text-xs mb-0.5" style={{ color: "var(--g-tx2)" }}>{s.label}</p>
                        <p className="text-base font-bold" style={{ color: s.color }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                }
              />
              {/* Notifications */}
              <div className="max-w-2xl mx-auto mt-5">
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
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
