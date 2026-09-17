import { createContext, useContext, useState, type ReactNode } from "react";

export interface SupportTicket {
  id: string;
  from: "customer" | "seller";
  fromName: string;
  orderId: string;
  type: string;
  description: string;
  status: "Open" | "In Review" | "Resolved";
  priority: "Low" | "Medium" | "High";
  time: string;
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
  updateTicketStatus: (id: string, status: SupportTicket["status"]) => void;
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
    fromName: "Jordan Lee",
    orderId: "GID-88462",
    type: "Delivery delayed",
    description: "My order was supposed to arrive 20 minutes ago and the drone tracking shows it has not moved.",
    status: "In Review",
    priority: "High",
    time: "09:58",
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
  },
  {
    id: "SUP-44190",
    from: "customer",
    fromName: "Riley Scott",
    orderId: "GID-88310",
    type: "Package damaged",
    description: "Package arrived but the seal was broken and one item is missing.",
    status: "Resolved",
    priority: "Medium",
    time: "Yesterday",
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
    setTickets((prev) => [
      {
        ...data,
        id,
        status: "Open",
        priority: "Medium",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      ...prev,
    ]);
    return id;
  }

  function updateTicketStatus(id: string, status: SupportTicket["status"]) {
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
