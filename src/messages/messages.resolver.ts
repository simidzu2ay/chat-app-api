import { BadRequestException, Inject } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
  Subscription
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { CurrentUserId } from '../auth/current-user.decorator';
import { ChatsService } from '../chats/chats.service';
import { Chat } from '../chats/entities/chat.entity';
import { Subscriptions } from '../pubsub/pubsub.module';
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
    @Args('message') message: SendMessageInput,
    @CurrentUserId() userId: number
  ) {
    const chat = await this.chatsService.findOne(message.chatId);

    if (!chat) throw new BadRequestException("Chat doesn't exists");

    if (!chat.membersIds.includes(userId))
      throw new BadRequestException('You are not a member of this chat');

    const newMessage = await this.messagesService.send(message, userId);

    this.pubSub.publish(Subscriptions.NEW_MESSAGE, {
      newMessage
    });

    return newMessage;
  }

  @Subscription(() => Message, {
    name: Subscriptions.NEW_MESSAGE,
    async filter(
      this: MessagesResolver,
      { newMessage }: { newMessage: Message },
      variables
    ) {
      const userId: number = variables.userId;
      const chat = await this.chatsService.findOne(newMessage.chatId);

      return chat.membersIds.includes(userId);
    }
  })
  async subscribeToNewMessages(
    @Args('userId') userIdByUser: number,
    @CurrentUserId() userId: number
  ) {
    // I don't know any others ways to pass userId into variables in filter
    if (userIdByUser !== userId)
      throw new BadRequestException('Passed wrong id');
    return this.pubSub.asyncIterator(Subscriptions.NEW_MESSAGE);
  }

  @ResolveField('from', () => User)
  async getFromUser(@Parent() parent: Message) {
    return await this.usersService.findOne(parent.fromUserId);
  }

  @ResolveField('chat', () => Chat)
  async getChat(@Parent() parent: Message) {
    return await this.chatsService.findOne(parent.chatId);
  }
}
