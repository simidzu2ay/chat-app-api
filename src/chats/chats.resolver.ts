import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql';
import { CurrentUserId } from '../auth/current-user.decorator';
import { Message } from '../messages/entities/message.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ChatsService } from './chats.service';
import { CreateChatInput } from './dto/create-chat.input';
import { Chat } from './entities/chat.entity';

@Resolver(() => Chat)
export class ChatsResolver {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly usersServise: UsersService
  ) {}

  @Mutation(() => Chat)
  async createChat(
    @Args('chat') createChatInput: CreateChatInput,
    @CurrentUserId() userId
  ) {
    const members = [...new Set([userId, ...createChatInput.members])];

    return await this.chatsService.create({
      members,
      name: createChatInput.name,
      ownerId: userId
    });
  }

  @Query(() => [Chat], { name: 'chats' })
  async getUsersChats(
    @CurrentUserId() userId: number,
    @Args('offset', { defaultValue: 0 }) offset: number,
    @Args('count', { defaultValue: 10 }) count: number
  ) {
    return await this.chatsService.findUsersChats(userId, offset, count);
  }

  @ResolveField('members', () => [User])
  async getChatMembers(@Parent() parent: Chat) {
    return await this.usersServise.findMany(parent.membersIds);
  }

  @ResolveField('owner', () => User)
  async getChatOwner(@Parent() parent: Chat) {
    return await this.usersServise.findOne(parent.ownerId);
  }

  @ResolveField('lastMessage', () => Message, { nullable: true })
  async getChatLastMessage(@Parent() parent: Chat) {
    return await this.chatsService.getLastMessage(parent.id);
  }
}
