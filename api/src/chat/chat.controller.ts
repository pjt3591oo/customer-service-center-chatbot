import { Body, Controller, Get, Post, Query, Sse } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Observable } from 'rxjs/internal/Observable';
import { MessageEvent } from '@nestjs/common';
import { Msg } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/history')
  async getChatHistory(
    @Query('chatSessionId') chatSessionId: string,
    @Query('lastId') lastId?: string,
  ): Promise<Msg[]> {
    return this.chatService.getChatHistory(chatSessionId, lastId);
  }

  @Sse('/agent')
  agent(@Query() query): Observable<MessageEvent> {
    const { msg, chatSessionId } = query as {
      msg: string;
      chatSessionId: string;
    };
    return this.chatService.agent(msg, chatSessionId);
  }

  @Post('/sync')
  async syncChat(
    @Query('chatSessionId') chatSessionId: string,
    @Body() msgs: Msg[],
  ): Promise<{ success: boolean }> {
    await this.chatService.syncChat(chatSessionId, msgs);
    return { success: true };
  }

  @Get('/sessions')
  async getChatSession(): Promise<any> {
    return this.chatService.getChatSessions();
  }

  @Post('/close')
  async closeChatSession(
    @Query('chatSessionId') chatSessionId: string,
  ): Promise<{ success: boolean }> {
    await this.chatService.closeChatSession(chatSessionId);
    return { success: true };
  }
}
