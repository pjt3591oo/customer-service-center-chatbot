import { useEffect } from "react";
import { usePGlite, useLiveQuery } from "@electric-sql/pglite-react"
import { uuidv7 } from "uuidv7";
import { useNavigate } from "react-router";

interface ChatSession {
  id: string;
  chatSessionId: string;
  status: string;
  mode: string;
}

const useHistoryChat = () => {
  const db = usePGlite()
  const chatSessions = useLiveQuery<ChatSession[]>(`
    SELECT id, chatSessionId, status, mode FROM chatSession ORDER BY id DESC
  `);
  const navigate = useNavigate();


  useEffect(() => {
    console.log('Chat sessions updated:', chatSessions);
  }, [chatSessions?.rows])

  const onNewChatSession = async () => {
    console.log('Creating new chat session');
    const chatSessionId = uuidv7();
    const newSession: ChatSession = {
      id: chatSessionId,
      chatSessionId: chatSessionId,
      status: 'active',
      mode: 'AGENT'
    };

    await db.query(`
      INSERT INTO chatSession (chatSessionId, status, mode, createdAt, updatedAt)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [newSession.chatSessionId, newSession.status, newSession.mode]);

  }

  const onSelectChatSession = (chatSessionId: string) => {
    console.log('Selected chat session:', chatSessionId); 
    navigate(`/chat/${chatSessionId}`);
  }

  return {
    chatSessions: chatSessions?.rows ?? [],
    onNewChatSession,
    onSelectChatSession
  }
}

export default useHistoryChat;