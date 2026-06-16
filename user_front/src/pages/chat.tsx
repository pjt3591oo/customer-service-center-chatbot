import AgentChat from "../components/agentChat";
import { useParams } from 'react-router-dom';

function ChatPage() {

  const { chatSessionId } = useParams<{ chatSessionId: string }>();

  console.log('ChatPage chatSessionId:', chatSessionId);
  if (!chatSessionId) {
    return <div>Chat session ID is missing.</div>;
  }

  return (
    <>
      <AgentChat chatSessionId={chatSessionId} />
    </>
  );
}
 
export default ChatPage;