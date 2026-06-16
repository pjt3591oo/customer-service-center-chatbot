import {
  // ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { From, Msg, ChatMode } from './dto/chat.dto';
import { ChatService } from './chat.service';

@WebSocketGateway(3001, { cors: true, namespace: 'chat' })
export class ChatGateway {
  @WebSocketServer()
  private server: Server | undefined;

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    const { chatSessionId } = client.handshake?.query as {
      chatSessionId?: string;
    };

    // const chats = JSON.parse(chatsString) as Msg[];
    if (chatSessionId) {
      console.log(`Client joining chat session: ${chatSessionId}`);
      await client.join(chatSessionId);
    }
  }

  // Triggered automatically when a client disconnects
  async handleDisconnect(client: Socket) {
    console.log(client.handshake.query);
    console.log(`Client disconnected: ${client.id}`);
    const { chatSessionId } = client.handshake?.query as {
      chatSessionId?: string;
    };

    if (chatSessionId) {
      await client.leave(chatSessionId);
    }
  }

  @SubscribeMessage('message/user')
  async handleMessageUser(
    // @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatSessionId: string; msg: string },
  ): Promise<void> {
    console.log(payload);
    const msg = this.generateMsgFromPayload(payload, From.USER);

    await this.chatService.addChat(payload.chatSessionId, [msg]);
    console.log(payload.chatSessionId);
    this.server?.to(payload.chatSessionId).emit('message', msg); // 해당 채팅 세션 ID를 가진 클라이언트에게 메시지 전송

    // return { success: true };
  }

  @SubscribeMessage('message/admin')
  async handleMessageAdmin(
    // @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatSessionId: string; msg: string },
  ): Promise<void> {
    const msg = this.generateMsgFromPayload(payload, From.ADMIN);

    await this.chatService.addChat(payload.chatSessionId, [msg]);

    this.server?.to(payload.chatSessionId).emit('message', msg); // 해당 채팅 세션 ID를 가진 클라이언트에게 메시지 전송

    // return { success: true };
  }

  generateMsgFromPayload(
    payload: { chatSessionId: string; msg: string },
    from: From,
  ): Msg {
    return {
      chatSessionId: payload.chatSessionId,
      from,
      content: payload.msg,
      mode: ChatMode.REALTIME,
    };
  }
}
