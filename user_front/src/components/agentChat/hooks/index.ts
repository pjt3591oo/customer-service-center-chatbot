import { useEffect, useRef, useState } from 'react';
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react';
import { fetchSSE } from '../../../utils/sse';
import io from "socket.io-client";
import { uuidv7 } from 'uuidv7';

export interface Chat {
  id: string;
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

const useAgentChat = ({ chatSessionId }: { chatSessionId: string }) => {
  const db = usePGlite();
  const [msg, setMsg] = useState<string>('');
  // const [mode, setMode] = useState<"AGENT" | "REALTIME">("AGENT");
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  // ── 현재 세션 메시지 실시간 조회 ──────────────────────
  const result = useLiveQuery<Chat>(`
    SELECT id, chatSessionId, "from", content, mode
    FROM chat
    WHERE chatSessionId = $1
    ORDER BY id ASC
  `, [chatSessionId]);

  const mode = useLiveQuery<{ mode: "AGENT" | "REALTIME" }>(`
    SELECT mode FROM chatSession WHERE chatSessionId = $1
  `, [chatSessionId])?.rows[0]?.mode ?? 'AGENT';


  useEffect(() => {
    if (mode === "REALTIME") {
      // TODO: result.rows의 마지막 메시지를 기준으로 추가된 메시지 받아오기
    }
  }, [mode])

  const chats: Chat[] = result?.rows ?? [];

  // ── 메시지 저장 헬퍼 ──────────────────────────────────
  const saveChat = async (chat: Chat) => {
    await db.query(`
      INSERT INTO chat (id, chatSessionId, "from", content, mode)
      VALUES ($1, $2, $3, $4, $5)
    `, [chat.id, chat.chatSessionId, chat.from, chat.content, chat.mode]);
  };

  // ── REALTIME 모드 전환 ────────────────────────────────
  useEffect(() => {
    if (mode === "AGENT") return;

    // eslint-disable-next-line react-hooks/immutability
    connectRealTimeChat();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [mode]);

  async function connectRealTimeChat() {

    const lastChat = chats[chats.length - 1];
    const lastId = lastChat?.id ?? 0;
    const res = await fetch(`http://localhost:3000/chat/history?chatSessionId=${chatSessionId}&lastId=${lastId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    console.log('Fetched chat history:', data);
    data.forEach((chat: Chat) => {
      saveChat({
        id: chat.id,
        chatSessionId: chat.chatSessionId,
        from: chat.from,
        content: chat.content,
        mode: "REALTIME",
      });
    });

    socketRef.current = io(`http://127.0.0.1:3001/chat`, {
      transports: ["websocket"],
      query: { chatSessionId },
    });

    socketRef.current.on('message', async (incoming: Chat) => {
      await saveChat({
        id: uuidv7(),
        chatSessionId: incoming.chatSessionId,
        from: incoming.from,
        content: incoming.content,
        mode: "REALTIME",
      });
    });

    await saveChat({
      id: uuidv7(),
      chatSessionId,
      from: "SYSTEM",
      content: "상담원과 연결되었습니다.",
      mode: "REALTIME",
    });

  }

  // ── 메시지 전송 ───────────────────────────────────────
  const onSendMessage = async () => {
    if (!msg.trim()) return;

    if (mode === "AGENT") {
      const payload = { msg, chatSessionId };

      await saveChat({
        id: uuidv7(),
        chatSessionId,
        from: 'USER',
        content: msg,
        mode: "AGENT",
      });

      setMsg('');
      fetchSSE(payload, receiveMessage);

    } else if (mode === "REALTIME") {
      socketRef.current?.emit('message/user', { chatSessionId, msg });

      setMsg('');
    }
  };

  // ── SSE 응답 수신 ─────────────────────────────────────
  const receiveMessage = async (data: { qna_candidates: ReceiveMsg[] } | null) => {
    if (!data) return;

    const parsedData = JSON.parse(data as unknown as string) as { qna_candidates: ReceiveMsg[] };

    for (const candidate of parsedData.qna_candidates) {
      await saveChat({
        id: uuidv7(),
        chatSessionId,
        from: 'BOT',
        content: candidate.answer,
        mode: "AGENT",
      });
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);
  };

  const onChangeMode = async (newMode: "AGENT" | "REALTIME") => {
    // setMode(newMode);
    db.query(`
      UPDATE chatSession
      SET mode = $1, updatedAt = CURRENT_TIMESTAMP
      WHERE chatSessionId = $2
    `, [newMode, chatSessionId]);

    if (newMode === "REALTIME") {
      await saveChat({
        id: uuidv7(),
        chatSessionId,
        from: "SYSTEM",
        content: "상담원과 연결중입니다.",
        mode: "REALTIME",
      });

      await fetch(`http://127.0.0.1:3000/chat/sync?chatSessionId=${chatSessionId}`, {
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