import { BadRequestException, Inject } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { CurrentUserId } from '../auth/current-user.decorator';
import { ChatsService } from '../chats/chats.service';
import { Chat } from '../chats/entities/chat.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SendMessageInput } from './dto/send-message.input';
import { Message } from './entities/message.entity';
import { MessagesService } from './messages.service';

@Resolver(() => Message)
export class MessagesResolver {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
    private readonly chatsService: ChatsService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub
  ) {}

  @Mutation(() => Message)
  async sendMessage(
    @Args('input') message: SendMessageInput,
    @CurrentUserId() userId: number
  ) {
    if (await this.chatsService.findOne(message.chatId)) {
      const newMessage = await this.messagesService.send(message, userId);
      this.pubSub.publish('newMessage', {
        newMessage,
      });
      return newMessage;
    }
    throw new BadRequestException("Chat doesn't exists");
  }

  @Subscription(() => Message, {
    name: 'newMessage',
    filter(this: MessagesResolver, payload, variables) {
      console.log(payload, variables);

      return true;
    },
  })
  async subscribeToNewMessages(@CurrentUserId() userId: number) {
    return this.pubSub.asyncIterator('newMessage');
  }

  @ResolveField('fromUser', () => User)
  async getFromUser(@Parent() parent: Message) {
    return await this.usersService.findOne(parent.fromUserId);
  }

  @ResolveField('chat', () => Chat)
  async getChat(@Parent() parent: Message) {
    return await this.chatsService.findOne(parent.chatId);
  }
}
