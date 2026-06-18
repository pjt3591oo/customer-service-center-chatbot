/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Injectable } from '@nestjs/common';
import { MessageEvent } from '@nestjs/common';
import { Observable, Subscriber } from 'rxjs';
import { QnaGeneratorService } from 'src/qna-generator/qna-generator.service';
import * as fs from 'fs/promises';
import { readdirSync } from 'fs';
import path from 'path';
import { uuidv7 } from 'uuidv7';
import { PrismaService } from 'src/db/prisma.service';
import { ChatMode, ChatSession, From, Msg } from './dto/chat.dto';
import {
  MessageFrom as MessageFromPrisma,
  ChatMode as ChatModePrisma,
  Chat,
} from '@prisma/client';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

interface ChatResponse {
  qna_candidates?: {
    question: string;
    answer: string;
    section: string;
  }[];
}

const FromToMessageFrom = {
  [From.USER]: MessageFromPrisma.USER,
  [From.BOT]: MessageFromPrisma.BOT,
  [From.SYSTEM]: MessageFromPrisma.SYSTEM,
  [From.ADMIN]: MessageFromPrisma.ADMIN,
};

const ChatModeToPrisma = {
  [ChatMode.AGENT]: ChatModePrisma.AGENT,
  [ChatMode.REALTIME]: ChatModePrisma.REALTIME,
};

@Injectable()
export class ChatService {
  constructor(
    private readonly qnaGeneratorService: QnaGeneratorService,
    private readonly prisma: PrismaService,
  ) {}

  agent(msg: string, chatSessionId: string): Observable<MessageEvent> {
    console.log(
      'ChatService received message:',
      msg,
      'Chat Session ID:',
      chatSessionId,
    );

    return new Observable((subscriber) => {
      this.handle(msg, chatSessionId, subscriber).catch((err) => {
        console.error('Error in ChatService.agent:', err);
        subscriber.error(err);
      });
    });
  }

  async handle(
    msg: string,
    chatSessionId: string,
    subscriber: Subscriber<MessageEvent>,
  ): Promise<void> {
    console.log(
      'Handling message in ChatService:',
      msg,
      'Chat Session ID:',
      chatSessionId,
    );

    const similarQna = await this.qnaGeneratorService.findSimilar(msg, 0.8);
    console.log('Similar QnA from cache:', similarQna);

    // cache hit
    if (similarQna) {
      subscriber.next({
        // data: {
        //   answer: similarQna.answer,
        //   question: msg,
        // },
        data: {
          content: `
            <answer>${similarQna.answer}</answer>
            <question>${similarQna.question}</question>
          `,
          id: uuidv7(),
        },
      });
    } else {
      // TODO: 파일을 직접 읽는 방식은 임시방편
      const conceptsDir = path.join(process.cwd(), '../llmwiki/wiki/concepts');
      const mdFiles = readdirSync(conceptsDir)
        .filter((file: string) => file.endsWith('.md'))
        .map((file) => path.join(conceptsDir, file));
      const res = await this.qnaGeneratorService.generateQnaCandidates(
        msg,
        mdFiles,
      );
      let content = '';
      const chatId = uuidv7();
      for await (const item of res) {
        content += item.message?.content ?? '';
        subscriber.next({
          data: {
            content,
            id: chatId,
          },
        });
      }
      console.log('Final generated content:', content);

      // cache 저장
      const version = await fs.readFile(
        path.join(process.cwd(), '../qna_generator/qna_candidates/.version'),
        'utf-8',
      );
      const parsedContent = parser.parse(content);
      const answer = parsedContent.answer ?? '';
      const section = parsedContent.section ?? '';

      await this.qnaGeneratorService.saveQnaCache({
        question: msg,
        answer: answer,
        section: section,
        version: parseInt(version, 10),
      });
      // for (const candidate of parsedContent.qna_candidates ?? []) {
      // }
    }

    subscriber.complete();
  }

  async syncChat(chatSessionId: string, msg: Msg[]): Promise<void> {
    console.log('Saving chat messages:', msg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const chatSession = await this.prisma.chatSession.findFirst({
      where: { id: chatSessionId },
    });
    console.log('Found chat session:', chatSession);
    if (chatSession) {
      console.log('Chat session already exists, adding chat messages');
      await this.addChat(chatSessionId, msg);
    }

    console.log('Creating new chat session with ID:', chatSessionId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await this.prisma.chatSession.create({
      data: {
        id: uuidv7(),
        chatSessionId,
        status: 'active',
      },
    });

    console.log('Chat session created, adding chat messages');
    await this.addChat(chatSessionId, msg);
  }

  async addChat(chatSessionId: string, msg: Msg[]): Promise<void> {
    const data = msg.map((m) => ({
      id: m.id,
      chatSessionId,
      from: FromToMessageFrom[m.from],
      content: m.content,
      mode: ChatModeToPrisma[m.mode],
      createdAt: new Date(),
    }));

    if (data.length > 0) {
      await this.prisma.chat.createMany({ data });
    }
  }

  async getChatHistory(
    chatSessionId: string,
    lastId?: string,
  ): Promise<{ chats: Msg[]; chatSession: ChatSession }> {
    const where = {
      chatSessionId,
      ...(lastId ? { id: { gt: lastId } } : {}),
    };
    const chats: Chat[] = await this.prisma.chat.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    const chatSession = await this.prisma.chatSession.findFirst({
      where: { chatSessionId },
    });
    console.log(chatSession);
    if (!chats) {
      return {
        chats: [],
        chatSession: {
          chatSessionId: '',
          status: '',
          createdAt: new Date(),
        },
      };
    }

    return {
      chatSession: {
        chatSessionId: chatSession?.chatSessionId ?? '',
        status: chatSession?.status ?? '',
        createdAt: chatSession?.createdAt ?? new Date(),
      },
      chats: chats.map((chat) => ({
        id: chat.id,
        chatSessionId: chat.chatSessionId,
        from: chat.from as From,
        content: chat.content,
        mode: chat.mode as ChatMode,
        createdAt: chat.createdAt,
      })),
    };
  }

  async getChatSessions(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const sessions = await this.prisma.chatSession.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((session) => ({
      chatSessionId: session.chatSessionId,
      status: session.status,
      mode: 'REALTIME',
      createdAt: session.createdAt,
    }));
  }

  async closeChatSession(chatSessionId: string): Promise<void> {
    await this.prisma.chatSession.updateMany({
      where: { chatSessionId },
      data: { status: 'closed' },
    });

    // 상담사와 채팅이 종료되었습니다 메시지 추가
    await this.prisma.chat.create({
      data: {
        id: uuidv7(),
        chatSessionId,
        from: MessageFromPrisma.SYSTEM,
        content: '상담사와 채팅이 종료되었습니다.',
        mode: ChatModePrisma.REALTIME,
      },
    });
  }
}
