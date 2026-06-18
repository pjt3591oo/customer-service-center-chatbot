import { usePGlite, useLiveQuery } from "@electric-sql/pglite-react"
import { uuidv7 } from "uuidv7";
import { useNavigate } from "react-router";

export interface ChatSession {
  id: string;
  chatSessionId: string;
  status: string;
  mode: string;
  createdAt: string;
  updatedat: string;
  lastmessage?: string;
  lastfrom?: string;
}

const useHistoryChat = () => {
  const db = usePGlite()
  const a = useLiveQuery(`
    SELECT * FROM "chatSession"
    ORDER BY "createdAt" DESC
  `);
  console.log('a')
  console.log(a)
  const chatSessions = useLiveQuery<ChatSession>(`
  SELECT 
    "chatSession".id,
    "chatSession"."chatSessionId",
    "chatSession".status,
    "chatSession".mode,
    "chatSession"."createdAt",
    "chatSession"."updatedAt",
    last_chat.content AS "lastMessage",
    last_chat."from" AS "lastFrom"
  FROM "chatSession"
  LEFT JOIN LATERAL (
    SELECT content, "from"
    FROM "chat"
    WHERE "chat"."chatSessionId" = "chatSession"."chatSessionId"
    ORDER BY "chat"."createdAt" DESC
    LIMIT 1
  ) AS last_chat ON true
  ORDER BY "chatSession"."createdAt" DESC
  `);
  const navigate = useNavigate();
  console.log(chatSessions);
  const onNewChatSession = async () => {
    console.log('Creating new chat session');
    const chatSessionId = uuidv7();
    const newSession: ChatSession = {
      id: chatSessionId,
      chatSessionId: chatSessionId,
      status: 'active',
      mode: 'AGENT',
      createdAt: new Date().toISOString(),
      updatedat: new Date().toISOString(),
    };

    await db.query(`
      INSERT INTO "chatSession" ("chatSessionId", status, mode, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5)
    `, [newSession.chatSessionId, newSession.status, newSession.mode, newSession.createdAt, newSession.updatedat]);
  }

  const onSelectChatSession = (chatSessionId: string) => {
    navigate(`/chat/${chatSessionId}`);
  }

  return {
    chatSessions: chatSessions?.rows ?? [],
    onNewChatSession,
    onSelectChatSession
  }
}

export default useHistoryChat;