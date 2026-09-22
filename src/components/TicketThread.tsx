import { useState, useRef, useEffect } from "react";
import { useTickets, type SupportTicket, type TicketStatus } from "@/context/TicketContext";

// ── Status colour map ────────────────────────────────────────────────────────

export const STATUS_COLOR: Record<TicketStatus, { bg: string; text: string; border: string }> = {
  "Open":                 { bg: "#00d4ff18", text: "#00d4ff", border: "#00d4ff44" },
  "In Review":            { bg: "#f59e0b18", text: "#f59e0b", border: "#f59e0b44" },
  "Waiting for Customer": { bg: "#a78bfa18", text: "#a78bfa", border: "#a78bfa44" },
  "Waiting for Seller":   { bg: "#fb923c18", text: "#fb923c", border: "#fb923c44" },
  "Waiting for IT":       { bg: "#fbbf2418", text: "#fbbf24", border: "#fbbf2444" },
  "Resolved":             { bg: "#22c55e18", text: "#22c55e", border: "#22c55e44" },
  "Closed":               { bg: "#6b728018", text: "#6b7280", border: "#6b728044" },
};

export const PRIORITY_COLOR: Record<string, string> = {
  High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e",
};

// ── Status badge ─────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: TicketStatus }) {
  const c = STATUS_COLOR[status] ?? STATUS_COLOR["Open"];
  return (
    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap"
      style={{ color: c.text, backgroundColor: c.bg, borderColor: c.border }}>
      {status}
    </span>
  );
}

// ── "Who's turn" banner shown inside ticket detail ───────────────────────────

function TurnBanner({ status, from }: { status: TicketStatus; from: "customer" | "seller" }) {
  if (status === "Waiting for Customer" && from === "customer")
    return <p className="text-[10px] font-semibold" style={{ color: "#a78bfa" }}>⚡ IT Support is waiting for your response</p>;
  if (status === "Waiting for Seller" && from === "seller")
    return <p className="text-[10px] font-semibold" style={{ color: "#fb923c" }}>⚡ IT Support is waiting for your response</p>;
  if (status === "Waiting for IT")
    return <p className="text-[10px] font-semibold" style={{ color: "#fbbf24" }}>⏳ IT Support is reviewing your reply</p>;
  if (status === "Open" || status === "In Review")
    return <p className="text-[10px] font-semibold" style={{ color: "#f59e0b" }}>⏳ Support team is reviewing your ticket</p>;
  if (status === "Resolved")
    return <p className="text-[10px] font-semibold" style={{ color: "#22c55e" }}>✓ This ticket has been resolved</p>;
  if (status === "Closed")
    return <p className="text-[10px] font-semibold" style={{ color: "#6b7280" }}>This ticket is closed</p>;
  return null;
}

// ── Single message bubble ─────────────────────────────────────────────────────

function Bubble({
  msg,
  userAccent,
  userInitials,
  showInternal,
}: {
  msg: { author: "user" | "support"; authorName: string; text: string; time: string; isInternal?: boolean };
  userAccent: string;
  userInitials: string;
  showInternal: boolean;
}) {
  if (msg.isInternal && !showInternal) return null;

  const isUser = msg.author === "user";
  const isNote = msg.isInternal;

  const bubbleBg = isNote
    ? "#fbbf2412"
    : isUser
    ? `${userAccent}14`
    : "var(--g-s2)";

  const avatarBg = isNote
    ? "#fbbf2422"
    : isUser
    ? `${userAccent}22`
    : "var(--g-s2)";

  const avatarColor = isNote ? "#fbbf24" : isUser ? userAccent : "var(--g-tx2)";
  const initials = isUser ? userInitials : isNote ? "📝" : "GID";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold"
        style={{ backgroundColor: avatarBg, color: avatarColor }}
        title={msg.authorName}
      >
        {initials}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 space-y-1 ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}`}
        style={{ backgroundColor: bubbleBg, border: isNote ? "1px dashed #fbbf2433" : "none" }}
      >
        {isNote && (
          <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "#fbbf24" }}>
            Internal note
          </p>
        )}
        <p className="text-xs leading-relaxed" style={{ color: "var(--g-tx)" }}>{msg.text}</p>
        <div className={`flex items-center gap-2 ${isUser ? "justify-start flex-row-reverse" : ""}`}>
          <p className="text-[9px] font-mono" style={{ color: "var(--g-tx4)" }}>{msg.time}</p>
          <p className="text-[9px]" style={{ color: "var(--g-tx4)" }}>{msg.authorName}</p>
        </div>
      </div>
    </div>
  );
}

// ── Reply input ───────────────────────────────────────────────────────────────

function ReplyBox({
  ticketId,
  author,
  authorName,
  accent,
  canToggleInternal,
  disabled,
}: {
  ticketId: string;
  author: "user" | "support";
  authorName: string;
  accent: string;
  canToggleInternal: boolean;
  disabled: boolean;
}) {
  const { replyToTicket } = useTickets();
  const [text, setText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function send() {
    if (!text.trim() || sending) return;
    setSending(true);
    setTimeout(() => {
      replyToTicket(ticketId, text.trim(), author, authorName, isInternal);
      setText("");
      setSending(false);
      setSent(true);
      setIsInternal(false);
      setTimeout(() => setSent(false), 2500);
      textareaRef.current?.focus();
    }, 600);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !disabled) send();
  }

  const btnBg = !text.trim() || disabled
    ? `${accent}15`
    : pressed ? `${accent}50` : hovered ? `${accent}35` : `${accent}22`;
  const btnColor = !text.trim() || disabled ? `${accent}55` : accent;
  const btnBorder = !text.trim() || disabled ? `${accent}25` : pressed ? `${accent}88` : `${accent}44`;

  return (
    <div className="border-t" style={{ borderColor: "var(--g-bd)" }}>
      {canToggleInternal && (
        <div className="px-4 pt-3 flex items-center gap-2">
          <button
            onClick={() => setIsInternal((v) => !v)}
            className="flex items-center gap-1.5 text-xs rounded-lg px-2.5 py-1 border transition-all"
            style={{
              backgroundColor: isInternal ? "#fbbf2415" : "transparent",
              borderColor: isInternal ? "#fbbf2444" : "var(--g-bd)",
              color: isInternal ? "#fbbf24" : "var(--g-tx2)",
            }}
          >
            <span>{isInternal ? "📝" : "💬"}</span>
            {isInternal ? "Internal note" : "Reply to user"}
          </button>
          {isInternal && (
            <span className="text-[10px]" style={{ color: "var(--g-tx3)" }}>Hidden from customer/seller</span>
          )}
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled || sending}
            rows={3}
            placeholder={
              disabled
                ? "This ticket is closed"
                : isInternal
                ? "Write an internal note (only visible to IT staff)…"
                : "Write your reply… (Ctrl+Enter to send)"
            }
            className="w-full border rounded-xl px-4 py-3 text-sm resize-none transition-all duration-150"
            style={{
              backgroundColor: "var(--g-s2)",
              borderColor: focused ? `${isInternal ? "#fbbf24" : accent}88` : "var(--g-bd)",
              color: "var(--g-tx)",
              outline: "none",
              boxShadow: focused ? `0 0 0 3px ${isInternal ? "#fbbf24" : accent}15` : "none",
              opacity: disabled ? 0.5 : 1,
            }}
          />
        </div>

        {sent && (
          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: "#22c55e18", color: "#22c55e", border: "1px solid #22c55e30" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {isInternal ? "Note saved." : "Reply sent."}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[10px]" style={{ color: "var(--g-tx4)" }}>Ctrl+Enter to send</span>
          <button
            onClick={send}
            disabled={!text.trim() || disabled || sending}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setPressed(false); }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
              backgroundColor: btnBg,
              color: btnColor,
              border: `1px solid ${btnBorder}`,
              transform: pressed && text.trim() && !disabled ? "scale(0.96)" : "scale(1)",
              cursor: !text.trim() || disabled || sending ? "not-allowed" : "pointer",
              outline: "none",
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2 focus-visible:ring-2"
          >
            {sending && (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
              </svg>
            )}
            {sending ? "Sending…" : isInternal ? "Save Note" : "Send Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────

interface TicketThreadProps {
  ticket: SupportTicket;
  onBack: () => void;
  // Who is viewing this thread
  viewerRole: "customer" | "seller" | "support";
  viewerName: string;
  viewerAccent: string;
  viewerInitials: string;
  // IT-only: extra controls panel
  itControls?: React.ReactNode;
}

export default function TicketThread({
  ticket,
  onBack,
  viewerRole,
  viewerName,
  viewerAccent,
  viewerInitials,
  itControls,
}: TicketThreadProps) {
  const isIT = viewerRole === "support";
  const isUser = !isIT;
  const replyAuthor: "user" | "support" = isIT ? "support" : "user";
  const isClosed = ticket.status === "Closed";
  const threadRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [ticket.conversation.length]);

  const visibleMessages = isIT
    ? ticket.conversation
    : ticket.conversation.filter((m) => !m.isInternal);

  return (
    <div className="border rounded-2xl overflow-hidden flex flex-col" style={{ backgroundColor: "var(--g-s1)", borderColor: "var(--g-bd)", maxHeight: "80vh" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b shrink-0" style={{ borderColor: "var(--g-bd)" }}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="text-xs hover:opacity-70 flex items-center gap-1 shrink-0 transition-opacity"
            style={{ color: "var(--g-tx2)" }}
          >
            ← Back
          </button>
          <span className="font-mono text-xs truncate" style={{ color: viewerAccent }}>{ticket.id}</span>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      {/* Ticket meta */}
      <div className="px-5 py-3 border-b shrink-0 space-y-1" style={{ borderColor: "var(--g-bd)" }}>
        <div className="flex items-start gap-2 justify-between">
          <p className="font-semibold text-sm" style={{ color: "var(--g-tx)" }}>{ticket.type}</p>
          <span className="text-[10px] font-mono shrink-0 px-1.5 py-0.5 rounded border"
            style={{ color: PRIORITY_COLOR[ticket.priority], backgroundColor: PRIORITY_COLOR[ticket.priority] + "18", borderColor: PRIORITY_COLOR[ticket.priority] + "44" }}>
            {ticket.priority}
          </span>
        </div>
        <div className="flex flex-wrap gap-3 text-[10px] font-mono" style={{ color: "var(--g-tx2)" }}>
          <span>Order: {ticket.orderId}</span>
          <span>Submitted: {ticket.submittedDate}</span>
          <span>Updated: {ticket.lastUpdated}</span>
          {isIT && <span style={{ color: ticket.from === "customer" ? "#00d4ff" : "#f59e0b" }}>From: {ticket.fromName} ({ticket.from})</span>}
        </div>
        {isUser && <TurnBanner status={ticket.status} from={ticket.from} />}
      </div>

      {/* IT controls (status/priority selectors) */}
      {itControls && (
        <div className="px-5 py-3 border-b shrink-0" style={{ borderColor: "var(--g-bd)", backgroundColor: "var(--g-s2)" }}>
          {itControls}
        </div>
      )}

      {/* Conversation thread */}
      <div ref={threadRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
        {visibleMessages.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: "var(--g-tx4)" }}>No messages yet.</p>
        )}
        {visibleMessages.map((msg, i) => (
          <Bubble
            key={i}
            msg={msg}
            userAccent={viewerAccent}
            userInitials={viewerInitials}
            showInternal={isIT}
          />
        ))}
      </div>

      {/* Reply box */}
      <div className="shrink-0">
        <ReplyBox
          ticketId={ticket.id}
          author={replyAuthor}
          authorName={viewerName}
          accent={viewerAccent}
          canToggleInternal={isIT}
          disabled={isClosed}
        />
      </div>
    </div>
  );
}
