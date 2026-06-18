import { useEffect, useRef, useState } from 'react';
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react';
import { fetchSSE } from '../../../utils/sse';
import io from "socket.io-client";
import { uuidv7 } from 'uuidv7';
import { ChatFrom, ChatMode, type From, type Mode } from '../../../utils/enum';
import { HTTP_URL, WS_URL } from '../../../utils/endpoint';
import { extractPartialXml } from '../../../utils/parse';

export interface Chat {
  id: string;
  chatSessionId: string;
  from: From;
  content: string;
  mode: Mode;
  createdAt: string;
}

export interface IncomingChat {
  id: string;
  chatSessionId: string;
  from: From;
  content: string;
  mode: Mode;
  createdAt: string;
}

const useAgentChat = ({ chatSessionId }: { chatSessionId: string }) => {
  const db = usePGlite();
  const [msg, setMsg] = useState<string>('');

  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  // ── 현재 세션 메시지 실시간 조회 ──────────────────────
  const result = useLiveQuery<Chat>(`
    SELECT id, "chatSessionId", "from", content, mode, "createdAt"
    FROM chat
    WHERE "chatSessionId" = $1
    ORDER BY id ASC
  `, [chatSessionId]);

  const mode = useLiveQuery<{ mode: "AGENT" | "REALTIME" }>(`
    SELECT mode FROM "chatSession" WHERE "chatSessionId" = $1
  `, [chatSessionId])?.rows[0]?.mode ?? 'AGENT';

  const chats: Chat[] = result?.rows ?? [];

  // ── 메시지 저장 헬퍼 ──────────────────────────────────
  const saveChat = async (chat: Chat) => {
    await db.query(`
      INSERT INTO chat (id, "chatSessionId", "from", content, mode, "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [chat.id, chat.chatSessionId, chat.from, chat.content, chat.mode, chat.createdAt]);
  };

  useEffect(() => {
    console.log(result?.rows)
  }, [result?.rows])

  // ── REALTIME 모드 전환 ────────────────────────────────
  useEffect(() => {
    if (mode === ChatMode.AGENT) return;

    // eslint-disable-next-line react-hooks/immutability
    connectRealTimeChat();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [mode]);

  async function fetchChatHistory() {
    const lastChat = chats[chats.length - 1];
    const lastId = lastChat?.id ?? '';
    const res = await fetch(`${HTTP_URL}/chat/history?chatSessionId=${chatSessionId}&lastId=${lastId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    
    const { chats: responseChats, chatSession } = data as { chats: Chat[]; chatSession: { chatSessionId: string; status: string; createdAt: string } };
    const isClosed = chatSession?.status === 'closed';  

    if (isClosed) {
      db.query(`
        UPDATE "chatSession"
        SET status = 'CLOSED', "updatedAt" = $1
        WHERE "chatSessionId" = $2
      `, [new Date(), chatSessionId]);
    }
    responseChats.forEach((chat: Chat) => {
      saveChat({
        id: chat.id,
        chatSessionId: chat.chatSessionId,
        from: chat.from,
        content: chat.content,
        mode: ChatMode.REALTIME,
        createdAt: chat.createdAt,
      });
    });

    return isClosed
  }

  async function connectRealTimeChat() {
    const isClosed = await fetchChatHistory();

    if (isClosed) {
      return;
    }
    
    socketRef.current = io(`${WS_URL}/chat`, {
      transports: ["websocket"],
      query: { chatSessionId },
    });

    socketRef.current.on('message', async (incoming: IncomingChat) => {
      await saveChat({
        id: uuidv7(),
        chatSessionId: incoming.chatSessionId,
        from: incoming.from,
        content: incoming.content,
        mode: ChatMode.REALTIME,
        createdAt: incoming.createdAt,
      });
    });

    await saveChat({
      id: uuidv7(),
      chatSessionId,
      from: ChatFrom.SYSTEM,
      content: "상담원과 연결되었습니다.",
      mode: ChatMode.REALTIME,
      createdAt: new Date().toISOString(),  
    });

  }

  // ── 메시지 전송 ───────────────────────────────────────
  const onSendMessage = async () => {
    if (!msg.trim()) return;

    const payload = { chatSessionId, msg };

    if (mode === "AGENT") {
      await saveChat({
        id: uuidv7(),
        chatSessionId,
        from: ChatFrom.USER,
        content: msg,
        mode: ChatMode.AGENT,
        createdAt: new Date().toISOString(),
      });

      fetchSSE(payload, receiveMessage);
    } else if (mode === ChatMode.REALTIME) {
      socketRef.current?.emit('message/user', payload);
    }

    setMsg('');
  };

  // ── SSE 응답 수신 ─────────────────────────────────────
  const receiveMessage = async (data: {id: string, content: string}) => {
    if (!data) return;

    const answer = extractPartialXml(data.content, 'answer');

    // console.log(answer)
    const existingChat = await db.query(`
      SELECT id from chat WHERE id = $1
    `, [data.id]);
    if (existingChat.rows.length > 0) {
      await db.query(`
        UPDATE chat
        SET content = $1
        WHERE id = $2
      `, [answer, data.id]);
      return;
    } else {
      await saveChat({
        id: data.id,
        chatSessionId,
        from: ChatFrom.BOT,
        content: answer,
        mode: ChatMode.AGENT,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);
  };

  const onChangeMode = async (newMode: Mode) => {
    // setMode(newMode);
    db.query(`
      UPDATE 
        "chatSession"
      SET 
        mode = $1, "updatedAt" = $2
      WHERE "chatSessionId" = $3
    `, [newMode, new Date(), chatSessionId]);

    if (newMode === ChatMode.REALTIME) {
      await saveChat({
        id: uuidv7(),
        chatSessionId,
        from: ChatFrom.SYSTEM,
        content: "상담원과 연결중입니다.",
        mode: ChatMode.REALTIME,
        createdAt: new Date().toISOString(),
      });

      await fetch(`${HTTP_URL}/chat/sync?chatSessionId=${chatSessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chats),
      })
    }
  };

  return {
    chats,
    msg,
    setMsg,
    onSendMessage,
    onInputChange,
    onChangeMode,
    mode,
  };
};

export default useAgentChat;