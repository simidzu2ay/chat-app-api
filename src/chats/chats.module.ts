import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../messages/entities/message.entity';
import { MessagesModule } from '../messages/messages.module';
import { UsersModule } from '../users/users.module';
import { ChatsResolver } from './chats.resolver';
import { ChatsService } from './chats.service';
import { Chat } from './entities/chat.entity';

@Module({
  providers: [ChatsResolver, ChatsService],
  imports: [
    TypeOrmModule.forFeature([Chat, Message]),
    forwardRef(() => MessagesModule),
    UsersModule
  ],
  exports: [ChatsService]
})
export class ChatsModule {}
