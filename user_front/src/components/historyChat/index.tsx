import {
  History,
  Plus,
  Search,
} from "lucide-react";
import React, { useState } from "react";

import useHistoryChat, { type ChatSession } from "./hooks";
import UserIcon from "../../assets/userIcon";
import { formatDate } from "../../utils/date";

type TabId = "history" | "explore" | "settings";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "history", label: "History", icon: <History size={20} /> },
  // { id: "settings", label: "Settings", icon: <Settings size={20} /> },
];

function HistoryCard({ item, onClick }: { item: ChatSession; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl bg-white px-4 py-4 text-left shadow-sm transition-colors hover:bg-slate-50"
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl`}>
        {/* 임의 아이콘 넣기 svg */}
        <UserIcon />
        
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-slate-800">
            {item.status} {" "}
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                item.status === "active" ? "bg-green-500" : "bg-gray-400"
              } mr-2`}
            ></span>
          </span>
          <span className="shrink-0 text-xs text-slate-400">{formatDate(item.createdat)}</span>
        </div>
        <p className="mt-0.5 truncate text-sm text-slate-400">{item.lastfrom}: {item.lastmessage}</p>
      </div>
    </button>
  );
}

export default function HistoryChat() {
  const { chatSessions, onNewChatSession, onSelectChatSession } = useHistoryChat();
  const [activeTab, setActiveTab] = useState<TabId>("history");
  const [query, setQuery] = useState("");

  // TODO: add filter by search query
  const filtered = chatSessions;

  return (
    <div className="mx-auto flex h-[800px] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 relative">
      {/* Header */}
      <header className="flex items-center justify-between bg-white px-4 py-3">
        <button className="text-slate-700" aria-label="메뉴 열기">
          {/* <Menu size={22} /> */}
        </button>
        <h1 className="text-lg font-bold text-blue-600">고객센터 챗봇</h1>
        <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-200">
          <img
            src="https://i.pravatar.cc/36"
            alt="프로필"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Title */}
        <h2 className="mt-6 mb-4 text-2xl font-bold text-slate-800">History</h2>

        {/* Search */}
        <div className="mb-5 flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
          />
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onClick={() => onSelectChatSession?.(item.chatsessionid)}
              />
            ))
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">검색 결과가 없습니다.</p>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={onNewChatSession}
        aria-label="새 채팅"
        className="absolute bottom-20 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700"
        style={{ position: "absolute", bottom: "72px", right: "24px" }}
      >
        <Plus size={22} />
      </button>

      {/* Bottom tab bar */}
      <nav className="flex border-t border-slate-100 bg-white">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div
                className={`rounded-xl px-4 py-1 ${isActive ? "bg-blue-50" : ""}`}
              >
                {tab.icon}
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}