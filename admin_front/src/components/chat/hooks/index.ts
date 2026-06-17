import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { ChatFrom, type From, type Mode } from "../../../utils/enum";
import { HTTP_URL, WS_URL } from "../../../utils/endpoint";

export interface ChatSession {
  id: string;
  chatSessionId: string;
  status: string;
  mode: string;
  createdAt: string;
}

export interface Chat {
  id?: number;
  chatSessionId: string;
  from: From;
  content: string;
  mode: Mode;
  createdAt: string;
}

const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);

  const [chats, setChats] = useState<Chat[]>([]);

  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    fetch(`${HTTP_URL}/chat/sessions`)
      .then((response) => response.json())
      .then((data) => setSessions(data));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    getHistoryAndConnect(activeSession?.chatSessionId ?? '');
  }, [activeSession])

  const getHistoryAndConnect = async (chatSessionId: string) => {
    const res = await fetch(`${HTTP_URL}/chat/history?chatSessionId=${chatSessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    const { chats: responseChats, chatSession } = data as { chats: Chat[]; chatSession: { chatSessionId: string; status: string; createdAt: string } };

    const isClosed = chatSession.status === 'closed';

    if (isClosed) {
      return
    } else {
      setChats(responseChats);
      
      socketRef.current = io(`${WS_URL}/chat`, {
        transports: ["websocket"],
        query: { chatSessionId },
      });
  
      socketRef.current.on('message', async (incoming: Chat) => {
        console.log(incoming);
        setChats((prevChats) => [...prevChats, incoming]);
      });
    }

  }


  const onSelectChatSession = (chatSessionId: string) => {
    const session = sessions.find(s => s.chatSessionId === chatSessionId) || null;
    setActiveSession(session);
  }

  const onSendMessage = async (content: string) => {
    console.log('Sending message:', content);
    if (!activeSession || activeSession.status !== 'active') return;
    if (!content.trim()) return;
    
    const newChat = {
      chatSessionId: activeSession.chatSessionId,
      from: ChatFrom.ADMIN,
      msg: content,
    };
    // Save to backend
    socketRef.current?.emit('message/admin', newChat);
  }

  const onCloseChatSession = async (chatSessionId: string) => {
    await fetch(`${HTTP_URL}/chat/close?chatSessionId=${chatSessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Update local state
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.chatSessionId === chatSessionId ? { ...session, status: 'closed' } : session
      )
    );

    if (activeSession?.chatSessionId === chatSessionId) {
      setActiveSession(null);
      setChats([]);
    }
  }

  return {sessions, activeSession, chats, onSelectChatSession, onSendMessage, onCloseChatSession};
}

export default useChat;