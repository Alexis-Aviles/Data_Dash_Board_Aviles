import { createContext, useContext, useState, type ReactNode } from "react";

export type TicketStatus = "Open" | "In Review" | "Waiting for Customer" | "Waiting for Support" | "Resolved" | "Closed";

export interface SupportTicket {
  id: string;
  from: "customer" | "seller";
  fromName: string;
  orderId: string;
  type: string;
  description: string;
  status: TicketStatus;
  priority: "Low" | "Medium" | "High";
  time: string;
  submittedDate: string;
  lastUpdated: string;
  conversation: { author: "user" | "support"; text: string; time: string }[];
}

interface TicketContextValue {
  tickets: SupportTicket[];
  addTicket: (data: {
    from: "customer" | "seller";
    fromName: string;
    orderId: string;
    type: string;
    description: string;
  }) => string;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  updateTicketPriority: (id: string, priority: SupportTicket["priority"]) => void;
}

const TicketContext = createContext<TicketContextValue>({
  tickets: [],
  addTicket: () => "",
  updateTicketStatus: () => {},
  updateTicketPriority: () => {},
});

const SEED: SupportTicket[] = [
  {
    id: "SUP-44201",
    from: "customer",
    fromName: "Alex Morgan",
    orderId: "GID-88421",
    type: "Delivery delayed",
    description: "My order was supposed to arrive 20 minutes ago and the drone tracking shows it has not moved.",
    status: "In Review",
    priority: "High",
    time: "09:58",
    submittedDate: "20 Sep 2026",
    lastUpdated: "20 Sep 2026, 10:12",
    conversation: [
      { author: "user", text: "My order was supposed to arrive 20 minutes ago and the drone tracking shows it has not moved.", time: "09:58" },
      { author: "support", text: "Thanks for reaching out. We can see DR-07 is currently holding position due to a temporary airspace restriction. It should resume shortly. We will keep you updated.", time: "10:12" },
    ],
  },
  {
    id: "SUP-44190",
    from: "customer",
    fromName: "Alex Morgan",
    orderId: "GID-87930",
    type: "Package damaged",
    description: "Package arrived but the seal was broken and one item is missing.",
    status: "Waiting for Customer",
    priority: "Medium",
    time: "Yesterday",
    submittedDate: "19 Sep 2026",
    lastUpdated: "19 Sep 2026, 16:40",
    conversation: [
      { author: "user", text: "Package arrived but the seal was broken and one item is missing.", time: "14:20" },
      { author: "support", text: "We are sorry to hear that. Could you please send a photo of the damaged packaging? This will help us process a replacement quickly.", time: "16:40" },
    ],
  },
  {
    id: "SUP-44175",
    from: "customer",
    fromName: "Alex Morgan",
    orderId: "GID-87614",
    type: "Wrong item delivered",
    description: "I ordered the Matcha Latte Kit but received a different product entirely.",
    status: "Resolved",
    priority: "Medium",
    time: "18 Sep 2026",
    submittedDate: "18 Sep 2026",
    lastUpdated: "18 Sep 2026, 18:05",
    conversation: [
      { author: "user", text: "I ordered the Matcha Latte Kit but received a different product entirely.", time: "11:30" },
      { author: "support", text: "We have confirmed the mix-up with UrbanMart. A replacement will be dispatched within the hour at no extra charge. Apologies for the inconvenience.", time: "13:10" },
      { author: "user", text: "Replacement arrived, thank you!", time: "18:00" },
      { author: "support", text: "Glad to hear it. Marking this ticket as resolved. Have a great day!", time: "18:05" },
    ],
  },
  {
    id: "SUP-44198",
    from: "seller",
    fromName: "TechGoods Store",
    orderId: "GID-88201",
    type: "Drone malfunction",
    description: "DR-05 lost connection mid-flight during delivery. Package status unknown.",
    status: "In Review",
    priority: "High",
    time: "08:35",
    submittedDate: "20 Sep 2026",
    lastUpdated: "20 Sep 2026, 09:15",
    conversation: [
      { author: "user", text: "DR-05 lost connection mid-flight during delivery. Package status unknown.", time: "08:35" },
      { author: "support", text: "We have flagged this to the fleet operations team. DR-05 telemetry shows it landed safely 0.4km from the delivery point. Recovery is underway.", time: "09:15" },
    ],
  },
  {
    id: "SUP-44182",
    from: "seller",
    fromName: "TechGoods Store",
    orderId: "GID-88100",
    type: "Payment not received",
    description: "Order GID-88100 was marked delivered 2 days ago but the payout has not appeared in my account.",
    status: "Waiting for Support",
    priority: "High",
    time: "19 Sep 2026",
    submittedDate: "19 Sep 2026",
    lastUpdated: "19 Sep 2026, 14:00",
    conversation: [
      { author: "user", text: "Order GID-88100 was marked delivered 2 days ago but the payout has not appeared in my account.", time: "11:00" },
      { author: "support", text: "We are investigating with the payments team. We will update you within 24 hours.", time: "14:00" },
    ],
  },
  {
    id: "SUP-44160",
    from: "seller",
    fromName: "TechGoods Store",
    orderId: "GID-87850",
    type: "Incorrect delivery address",
    description: "Customer provided an address outside the delivery zone but the order was accepted anyway.",
    status: "Closed",
    priority: "Low",
    time: "15 Sep 2026",
    submittedDate: "15 Sep 2026",
    lastUpdated: "16 Sep 2026, 10:30",
    conversation: [
      { author: "user", text: "Customer provided an address outside the delivery zone but the order was accepted anyway.", time: "09:00" },
      { author: "support", text: "This has been corrected in the zone validation rules. Thank you for flagging it. The affected order has been refunded to the customer.", time: "10:30" },
    ],
  },
];

export function TicketProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<SupportTicket[]>(SEED);

  function addTicket(data: {
    from: "customer" | "seller";
    fromName: string;
    orderId: string;
    type: string;
    description: string;
  }): string {
    const id = `SUP-${Math.floor(Math.random() * 90000) + 10000}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    setTickets((prev) => [
      {
        ...data,
        id,
        status: "Open",
        priority: "Medium",
        time: timeStr,
        submittedDate: dateStr,
        lastUpdated: `${dateStr}, ${timeStr}`,
        conversation: [{ author: "user", text: data.description, time: timeStr }],
      },
      ...prev,
    ]);
    return id;
  }

  function updateTicketStatus(id: string, status: TicketStatus) {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  function updateTicketPriority(id: string, priority: SupportTicket["priority"]) {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, priority } : t)));
  }

  return (
    <TicketContext.Provider value={{ tickets, addTicket, updateTicketStatus, updateTicketPriority }}>
      {children}
    </TicketContext.Provider>
  );
}

export const useTickets = () => useContext(TicketContext);
