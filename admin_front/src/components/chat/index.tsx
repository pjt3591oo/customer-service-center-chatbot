import { useState } from "react";
import useChat, { type Chat } from "./hooks";
import { ChatFrom } from "../../utils/enum";
import { formatDate } from "../../utils/date";

type FilterType = "all" | "active" | "closed";

const QUICK_ACTIONS = [
  "Quick Action 0",
  "Quick Action 1"
];

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Closed", value: "closed" },
];

// ─── sub-components ──────────────────────────────────────────────────────────

function BotIcon() {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        border: "0.5px solid #e5e5e5",
        background: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {/* robot icon (inline SVG, Tabler outline style) */}
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#888"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <line x1="12" y1="7" x2="12" y2="11" />
        <line x1="8" y1="15" x2="8" y2="15" />
        <line x1="16" y1="15" x2="16" y2="15" />
      </svg>
    </div>
  );
}
function UserIcon() {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        border: "0.5px solid #e5e5e5",
        background: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="8" fill="#14B8A6"/>
        <circle cx="8" cy="8" r="4" fill="white"/>
        <path d="M10 12 C10 10 12 8 14 8 C16 8 18 10 18 12 Z" fill="white"/>
      </svg>
    </div>
  );
}

function MessageRow({ msg }: { msg: Chat }) {
  if (msg.from === ChatFrom.USER) {
    return (
     <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <UserIcon />
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: "72%" }}>
          <div style={{ fontSize: 11, color: "#999" }}>User</div>
          <div
            style={{
              background: "#fff",
              border: "0.5px solid #e5e5e5",
              borderRadius: 12,
              borderTopLeftRadius: 4,
              padding: "12px 14px",
              fontSize: 13,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
            </div>
            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
              {msg.content}
            </div>


          </div>
          <div className="text-xs text-gray-400">
            {formatDate(msg.createdAt)}
          </div>
        </div>
      </div>
    );
  }

  if (msg.from === ChatFrom.ADMIN) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <div style={{ fontSize: 11, color: "#999" }}>
          <span style={{ color: "#185FA5", fontWeight: 500 }}>상담사</span>
        </div>
        
        <div
          style={{
            background: "#185FA5",
            color: "#B5D4F4",
            padding: "10px 14px",
            borderRadius: 12,
            borderBottomRightRadius: 4,
            fontSize: 13,
            lineHeight: 1.6,
            maxWidth: "72%",
          }}
        >
          {msg.content}
        </div>

        <div className="text-xs text-gray-400">
          {formatDate(msg.createdAt)}
        </div>
      </div>
    );
  }

  if (msg.from === ChatFrom.BOT) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <BotIcon />
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: "72%" }}>
          <div style={{ fontSize: 11, color: "#999" }}>BOT</div>
          <div
            style={{
              background: "#fff",
              border: "0.5px solid #e5e5e5",
              borderRadius: 12,
              borderTopLeftRadius: 4,
              padding: "12px 14px",
              fontSize: 13,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 6,
              }}
            >
              {/* info circle */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#185FA5"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="8" />
                <line x1="12" y1="12" x2="12" y2="16" />
              </svg>
              {/* {msg.diagnostic!.title} */}
            </div>
            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
              {msg.content}
            </div>
            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: "0.5px solid #e5e5e5",
                textAlign: "center",
                fontSize: 12,
                color: "#185FA5",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {/* {msg.diagnostic!.link} */}
            </div>
          </div>
          <div className="text-xs text-gray-400">
            {formatDate(msg.createdAt)}
          </div>
        </div>
      </div>
    );
  }

  // system
  return (
    <div
      style={{
        textAlign: "center",
        fontSize: 11,
        color: "#bbb",
        position: "relative",
      }}
    >
      <span
        style={{
          background: "#F7F7F5",
          padding: "0 10px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {msg.content}
      </span>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function ChatPage() {
  const { sessions, activeSession, chats, onSelectChatSession, onSendMessage, onCloseChatSession } = useChat();

  const [filter, setFilter] = useState<FilterType>("all");
  const [inputValue, setInputValue] = useState("");

  const session = sessions.find((s) => s.chatSessionId === activeSession?.chatSessionId)!;

  const filteredSessions = sessions.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // handleSend();
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        // height: '100%',
        // maxHeight: '100vh',
        height: '800px',
        border: "0.5px solid #e5e5e5",
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#fff",
      }}
    >
      {/* ── sidebar ── */}
      <aside
        style={{
          background: "#F7F7F5",
          borderRight: "0.5px solid #e5e5e5",
          display: "flex",
          flexDirection: "column",
          padding: "16px 0",
        }}
      >
        {/* brand */}
        <div
          style={{
            padding: "0 14px 14px",
            borderBottom: "0.5px solid #e5e5e5",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                background: "#185FA5",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B5D4F4" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>ChatAdmin Pro</div>
              <div style={{ fontSize: 10, color: "#999" }}>Enterprise Plan</div>
            </div>
          </div>
        </div>

        {/* nav */}
        {[
          // { label: "Dashboard", icon: "grid" },
          { label: "Chat Sessions", icon: "chat", active: true },
          // { label: "Analytics", icon: "chart" },
          // { label: "Settings", icon: "settings" },
          // { label: "Help", icon: "help" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              fontSize: 12,
              color: item.active ? "#111" : "#666",
              background: item.active ? "#fff" : "transparent",
              borderLeft: item.active ? "2px solid #185FA5" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            <NavIcon name={item.icon} active={!!item.active} />
            {item.label}
          </div>
        ))}

        <div style={{ marginTop: "auto", padding: "14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
              fontSize: 12,
              color: "#999",
              cursor: "pointer",
            }}
            onClick={() => {alert("기능 미구현")}}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log Out
          </div>
        </div>
      </aside>

      {/* ── main ── */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", overflow: "hidden" }}>
        {/* session list */}
        <div
          style={{
            borderRight: "0.5px solid #e5e5e5",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* header */}
          <div
            style={{
              padding: "13px 14px",
              borderBottom: "0.5px solid #e5e5e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500 }}>Session Manager</span>
            <span
              style={{
                fontSize: 11,
                background: "#EBF3FC",
                color: "#185FA5",
                padding: "2px 8px",
                borderRadius: 999,
                fontWeight: 500,
              }}
            >
              24 Active
            </span>
          </div>

          {/* filter */}
          <div
            style={{
              display: "flex",
              gap: 5,
              padding: "8px 14px",
              borderBottom: "0.5px solid #e5e5e5",
              flexWrap: "wrap",
            }}
          >
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: "3px 10px",
                  fontSize: 11,
                  borderRadius: 999,
                  border: "0.5px solid",
                  borderColor: filter === f.value ? "#185FA5" : "#ddd",
                  background: filter === f.value ? "#185FA5" : "transparent",
                  color: filter === f.value ? "#B5D4F4" : "#666",
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* sessions */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filteredSessions.map((s) => (
              <div
                key={s.chatSessionId}
                onClick={() => onSelectChatSession(s.chatSessionId)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 14px",
                  borderBottom: "0.5px solid #e5e5e5",
                  cursor: "pointer",
                  background: activeSession?.chatSessionId === s.chatSessionId ? "#EBF3FC" : "transparent",
                }}
              >
                <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="24" fill="#14B8A6"/>
                  <circle cx="24" cy="18" r="7" fill="white"/>
                  <path d="M10 38 C10 28 16 24 24 24 C32 24 38 28 38 38 Z" fill="white"/>
                </svg>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>{s.chatSessionId.slice(30, 35)}...</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#888",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginTop: 2,
                    }}
                  >
                    {s.chatSessionId.slice(0, 20)}...
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "#bbb", flexShrink: 0 }}>{s.createdAt.slice(0, 10)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* chat area */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* chat header */}
          <div
            style={{
              padding: "11px 16px",
              borderBottom: "0.5px solid #e5e5e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            
            {session && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="24" fill="#14B8A6"/>
                  <circle cx="24" cy="18" r="7" fill="white"/>
                  <path d="M10 38 C10 28 16 24 24 24 C32 24 38 28 38 38 Z" fill="white"/>
                </svg>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#111" }}>{session.chatSessionId.slice(30, 35)}</span>
                    {session.status === 'active' && (
                      <span
                        style={{
                          fontSize: 10,
                          background: "#EAF3DE",
                          color: "#3B6D11",
                          padding: "1px 7px",
                          borderRadius: 999,
                          fontWeight: 500,
                        }}
                      >
                        ACTIVE
                      </span>
                    )}
                    {session.status === 'closed' && (
                      <span
                        style={{
                          fontSize: 10,
                          background: "#F5F5F5",
                          color: "#666",
                          padding: "1px 7px",
                          borderRadius: 999,
                          fontWeight: 500,
                        }}
                      >
                        CLOSED
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>
                    {session.chatSessionId}
                  </div>
                </div>
              </div>
            ) }

            <div style={{ display: "flex", gap: 7 }}>
              <button
                style={{
                  padding: "5px 12px",
                  fontSize: 12,
                  border: "0.5px solid #ddd",
                  borderRadius: 8,
                  background: "transparent",
                  color: "#555",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
                onClick={() => {alert("기능 미구현")}}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                Logs
              </button>
              <button
                style={{
                  padding: "5px 12px",
                  fontSize: 12,
                  border: "0.5px solid #F0997B",
                  borderRadius: 8,
                  background: "#FEF2EE",
                  color: "#993C1D",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
                onClick={() => onCloseChatSession(session.chatSessionId)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                End Session
              </button>
            </div>
          </div>

          {/* messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "#F7F7F5",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontSize: 11,
                color: "#bbb",
                position: "relative",
              }}
            >
              
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  height: "0.5px",
                  background: "#e5e5e5",
                  zIndex: 0,
                }}
              />
            </div>
            {chats.map((msg) => (
              <MessageRow key={msg.chatSessionId} msg={msg} />
            ))}
          </div>

          {/* quick actions */}
          <div
            style={{
              display: "flex",
              gap: 6,
              padding: "8px 14px",
              borderTop: "0.5px solid #e5e5e5",
              flexWrap: "wrap",
              background: "#fff",
            }}
          >
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                style={{
                  padding: "5px 11px",
                  fontSize: 11,
                  borderRadius: 999,
                  border: "0.5px solid #ddd",
                  background: "transparent",
                  color: "#555",
                  cursor: "pointer",
                }}
              >
                {action}
              </button>
            ))}
          </div>

          {/* input */}
          <div
            style={{
              padding: "9px 14px",
              borderTop: "0.5px solid #e5e5e5",
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "#fff",
            }}
          >
            {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0, cursor: "pointer" }} aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg> */}
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a professional response..."
              style={{
                flex: 1,
                border: "0.5px solid #e5e5e5",
                borderRadius: 8,
                padding: "8px 11px",
                fontSize: 12,
                background: "#F7F7F5",
                color: "#111",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0, cursor: "pointer" }} aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
            </svg> */}
            <button
              // onClick={handleSend}
              onClick={() => onSendMessage(inputValue)}
              aria-label="전송"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#185FA5",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B5D4F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 10,
              color: "#bbb",
              padding: "4px 0 8px",
              background: "#fff",
            }}
          >
            Press Shift + Enter for new line · Elena will see your reply immediately
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── nav icon helper ──────────────────────────────────────────────────────────

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? "#185FA5" : "#888";
  const s = { width: 15, height: 15 };
  const p = { fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  if (name === "grid") return (
    <svg {...s} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" {...p} />
      <rect x="14" y="3" width="7" height="7" rx="1" {...p} />
      <rect x="3" y="14" width="7" height="7" rx="1" {...p} />
      <rect x="14" y="14" width="7" height="7" rx="1" {...p} />
    </svg>
  );
  if (name === "chat") return (
    <svg {...s} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" {...p} />
    </svg>
  );
  if (name === "chart") return (
    <svg {...s} viewBox="0 0 24 24" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" {...p} />
      <line x1="12" y1="20" x2="12" y2="4" {...p} />
      <line x1="6" y1="20" x2="6" y2="14" {...p} />
    </svg>
  );
  if (name === "settings") return (
    <svg {...s} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" {...p} />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" {...p} />
    </svg>
  );
  return (
    <svg {...s} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" {...p} />
      <line x1="12" y1="8" x2="12" y2="8" {...p} />
      <line x1="12" y1="12" x2="12" y2="16" {...p} />
    </svg>
  );
}