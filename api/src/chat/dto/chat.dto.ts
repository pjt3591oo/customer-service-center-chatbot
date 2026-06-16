import { ChatMode as ChatModePrisma, MessageFrom } from '@prisma/client';

export enum ChatMode {
  AGENT = 'AGENT',
  REALTIME = 'REALTIME',
}

export enum From {
  USER = 'USER',
  BOT = 'BOT',
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMIN',
}

export interface Msg {
  id: string;
  chatSessionId: string;
  from: MessageFrom;
  content: string;
  mode: ChatModePrisma;
}
