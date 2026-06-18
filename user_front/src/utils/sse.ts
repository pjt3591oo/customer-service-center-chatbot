interface Payload {
  msg: string;
  chatSessionId: string;
}

export interface ReceiveMsg {
  answer: string;
  question: string;
  section: string;
}

export const fetchSSE = (payload: Payload, cb: (data: {id: string, content: string}) => void) => {
    const eventSource = new EventSource(`http://localhost:3000/chat/agent?msg=${payload.msg}&chatSessionId=${payload.chatSessionId}`); // SSE 엔드포인트 URL

    eventSource.onopen = () => {
      // 연결 시 할 일
    };

    eventSource.onmessage = async (e) => {
      const res = await e.data;
      const parsedData = JSON.parse(res);
      cb(parsedData);
      // 받아오는 data로 할 일
    };

    eventSource.onerror = (e: any) => {
      // 종료 또는 에러 발생 시 할 일
      eventSource.close();

      if (e.error) {
        // 에러 발생 시 할 일
      }

      if (e.target.readyState === EventSource.CLOSED) {
        // 종료 시 할 일
      }
    };
 };

 