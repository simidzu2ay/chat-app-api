import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn
} from 'typeorm';
import { Chat } from '../../chats/entities/chat.entity';
import { User } from '../../users/entities/user.entity';

@ObjectType()
@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chat_message_id' })
  @Field(() => ID, { name: 'id' })
  chatMessageId: number;

  @ManyToOne(() => User)
  @Field(() => User)
  @JoinColumn({ name: 'from_user_id' })
  fromUser: User;

  @Column()
  @Field()
  text: string;

  @RelationId((m: Message) => m.fromUser)
  fromUserId: number;

  @Field(() => Chat)
  @ManyToOne(() => Chat, chat => chat.messages)
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @RelationId((t: Message) => t.chat)
  chatId: number;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn()
  updateDate: Date;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn()
  createDate: Date;
}
