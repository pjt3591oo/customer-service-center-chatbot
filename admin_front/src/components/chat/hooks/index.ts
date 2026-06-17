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
      .then((data) => {console.log('Fetched sessions:', data); return data})
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
    console.log('Fetched chat history:', data);
    setChats(data);

    socketRef.current = io(`${WS_URL}/chat`, {
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
      from: ChatFrom.ADMIN,
      msg: content,
    };
    console.log(newChat)
    // Save to backend
    socketRef.current?.emit('message/admin', newChat);
  }

  return {sessions, activeSession, chats, onSelectChatSession, onSendMessage};
}

export default useChat;