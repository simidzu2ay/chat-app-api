import { Field, ObjectType } from '@nestjs/graphql';
import { Message } from '../../messages/entities/message.entity';
import { Chat } from './chat.entity';

@ObjectType()
export class ChatWithLastMessage extends Chat {
  @Field({ nullable: true })
  lastMessage: Message;
}
