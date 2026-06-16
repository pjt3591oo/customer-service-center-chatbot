import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

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
  from: 'USER' | 'BOT' | 'ADMIN' | 'SYSTEM';
  content: string;
  mode: "AGENT" | "REALTIME";
}

interface ReceiveMsg {
  answer: string;
  question: string;
  section: string;
}

const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);

  const [chats, setChats] = useState<Chat[]>([]);

  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    fetch('http://localhost:3000/chat/sessions')
      .then((response) => response.json())
      .then((data) => {console.log('Fetched sessions:', data); return data})
      .then((data) => setSessions(data));
  }, []);

  useEffect(() => {

    // eslint-disable-next-line react-hooks/immutability
    getHistoryAndConnect(activeSession?.chatSessionId ?? '');
  }, [activeSession])

  const getHistoryAndConnect = async (chatSessionId: string) => {
    const res = await fetch(`http://localhost:3000/chat/history?chatSessionId=${chatSessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    console.log('Fetched chat history:', data);
    setChats(data);

    socketRef.current = io(`http://127.0.0.1:3001/chat`, {
      transports: ["websocket"],
      query: { chatSessionId },
    });

    socketRef.current.on('message', async (incoming: Chat) => {
      console.log('Received real-time message:', incoming);

      // Update local state with new message
      setChats((prevChats) => [...prevChats, incoming]);
    });
  }


  const onSelectChatSession = (chatSessionId: string) => {
    const session = sessions.find(s => s.chatSessionId === chatSessionId) || null;
    setActiveSession(session);
  }

  const onSendMessage = async (content: string) => {
    console.log('Sending message:', content);
    if (!activeSession) return;
    if (!content.trim()) return;

    
    const newChat = {
      chatSessionId: activeSession.chatSessionId,
      from: 'ADMIN',
      msg: content,
    };
    console.log(newChat)
    // Save to backend
    socketRef.current?.emit('message/admin', newChat);
  }

  return {sessions, activeSession, chats, onSelectChatSession, onSendMessage};
}

export default useChat;