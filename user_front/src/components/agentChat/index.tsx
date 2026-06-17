import { useRef, useEffect } from "react";
import useAgentChat, { type Chat } from "./hooks";
import { Menu, Plus, Send, Headphones } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChatFrom, ChatMode } from "../../utils/enum";
import { formatDate } from "../../utils/date";

interface Props {
  chatSessionId: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function Avatar({ from }: { from: Chat["from"] }) {
  if (from === ChatFrom.BOT) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="7" width="14" height="11" rx="3" fill="currentColor" />
          <circle cx="9.5" cy="12.5" r="1.4" fill="white" />
          <circle cx="14.5" cy="12.5" r="1.4" fill="white" />
          <rect x="9" y="15.2" width="6" height="1.4" rx="0.7" fill="white" />
          <line x1="12" y1="7" x2="12" y2="4" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="3.2" r="1.2" fill="currentColor" />
        </svg>
      </div>
    );
  }
 
  if (from === ChatFrom.ADMIN) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3 L19 6 V12 C19 16.5 12 19.5 12 19.5 C12 19.5 5 16.5 5 12 V6 Z"
            fill="currentColor"
          />
          <path
            d="M8.5 11.8 L11 14.3 L15.5 9.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    );
  }
 
  // USER
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-300 text-slate-600">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="9" r="3.4" fill="currentColor" />
        <path
          d="M5 19c0-3.9 3.1-6 7-6s7 2.1 7 6"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}


function MessageBubble({ chat }: { chat: Chat }) {
  const isUser = chat.from === ChatFrom.USER;
  const isSystem = chat.from === ChatFrom.SYSTEM;

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-400">
          {chat.content}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-400">{formatDate(chat?.createdat)}</span>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <Avatar from={chat.from} />

      <div className={`flex max-w-[78%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "rounded-tr-sm bg-blue-600 text-white"
              : chat.from === ChatFrom.ADMIN
                ? "rounded-tl-sm bg-amber-50 text-slate-800 border border-amber-200"
                : "rounded-tl-sm bg-blue-50 text-slate-800"
          }`}
        >
          {chat.from === ChatFrom.ADMIN && (
            <div className="mb-1 text-xs font-semibold text-amber-600">관리자</div>
          )}
          <p className="whitespace-pre-wrap">{chat.content}</p>
        </div>

        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-400 mt-2">{formatDate(chat?.createdat)}</div>
      </div>
    </div>
  );
}
function AgentChat({ chatSessionId }: Props) {
  
  const {chats, msg, onInputChange, onSendMessage, onChangeMode, mode} = useAgentChat({chatSessionId});

  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chats]);
 
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSendMessage();
  };

  const QUICK_ACTIONS: QuickAction[] = [
    {
      id: "counselor",
      label: "Contact Counselor",
      icon: <Headphones size={18} />,
      onClick: () => onChangeMode("REALTIME"),
    },
    // {
    //   id: "summarize",
    //   label: "Summarize Doc",
    //   icon: <FileText size={18} />,
    //   onClick: () => (void 0),
    // },
  ];

  return (
    <div className="mx-auto flex h-[800px] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
        <button className="text-slate-700" aria-label="메뉴 열기">
          <Menu size={22} onClick={() => navigate('/')} />
        </button>
        <h1 className="text-lg font-bold text-blue-600">고객센터 상담 센터({mode})</h1>
        <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200">
          <Avatar from={ChatFrom.ADMIN} />
        </div>
      </header>
 
      {/* Message list */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {chats.map((chat, i) => (
          <MessageBubble key={i} chat={chat} />
        ))}
      </div>
 
      {mode === ChatMode.AGENT && (
        <div className="flex gap-2 border-t border-slate-100 bg-white px-4 py-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              onClick={action.onClick}
            >
              {action.icon}
              <span className="truncate">{action.label}</span>
            </button>
          ))}
        </div>
      )}
 
      {/* Input bar */}
      <div className="flex items-center gap-2 border-t border-slate-100 bg-white px-4 py-3">
        <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500" aria-label="추가">
          <Plus size={20} />
        </button>
        <input
          value={msg}
          onChange={onInputChange}
          onKeyUp={handleKeyUp}
          placeholder="Ask InsightBot anything..."
          className="flex-1 rounded-full bg-slate-100 px-4 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
        <button
          onClick={onSendMessage}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
          aria-label="전송"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
 
export default AgentChat;