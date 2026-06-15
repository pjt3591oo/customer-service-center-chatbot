import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { QnaGeneratorService } from 'src/qna-generator/qna-generator.service';
import { PrismaService } from 'src/db/prisma.service';
import { ChatGateway } from './chat.gateway';

@Module({
  controllers: [ChatController],
  providers: [ChatService, QnaGeneratorService, PrismaService, ChatGateway],
})
export class ChatModule {}
