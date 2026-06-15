import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { QnaGeneratorService } from './qna-generator/qna-generator.service';
import { PrismaModule } from './db/prisma.module';

@Module({
  imports: [ConfigModule.forRoot(), ChatModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, QnaGeneratorService],
})
export class AppModule {}
