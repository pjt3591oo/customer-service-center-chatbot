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
  ): Promise<Msg[]> {
    const chatHistory = await this.chatService.getChatHistory(chatSessionId);
    return chatHistory;
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
  async syncChat(@Body() body: Msg[]): Promise<{ success: boolean }> {
    await this.chatService.saveChat(body);
    return { success: true };
  }
}
