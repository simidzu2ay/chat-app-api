import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../messages/entities/message.entity';
import { CreateChatInput } from './dto/create-chat.input';
import { Chat } from './entities/chat.entity';
import { ChatWithLastMessage } from './entities/last-message.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat) private readonly chatsRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messagesReposityry: Repository<Message>
  ) {}

  async create(createChatInput: CreateChatInput & { ownerId: number }) {
    const chat = this.chatsRepository.create({
      membersIds: createChatInput.members,
      messages: [],
      name: createChatInput.name,
      ownerId: createChatInput.ownerId
    });

    // ---->  https://github.com/typeorm/typeorm/issues/1795
    chat.members = createChatInput.members.map(member => ({
      id: member
    })) as any;

    const { id } = await this.chatsRepository.save(chat);
    // Allows the user to get a list of members immediately
    return await this.findOne(id);
  }

  async findOne(id: number) {
    return await this.chatsRepository.findOne({
      where: {
        id
      },
      loadRelationIds: {
        relations: ['members'],
        disableMixedMap: true
      }
    });
  }

  // TODO: Sort by last message time
  async findUsersChats(
    userId: number,
    offset = 0,
    count = 10
  ): Promise<ChatWithLastMessage[]> {
    const chats = await this.chatsRepository
      .createQueryBuilder('chat')
      .skip(offset)
      .take(count)
      .leftJoinAndSelect('chat.members', 'members')
      .where('members.id = :userId', { userId })
      .getMany();

    const lastMessages = await this.messagesReposityry
      .createQueryBuilder('message')
      .take(1)
      .orderBy('id', 'DESC')
      .where('message.chat_id IN (:...chatIds)', {
        chatIds: chats.map(c => c.id)
      })
      .getMany();

    const ChatsWithLastMessages = chats.map(chat => {
      // Should help with large amount of data
      const lastMessageIndex = lastMessages.findIndex(
        message => message.chatId === chat.id
      );
      const lastMessage = lastMessages.splice(lastMessageIndex, 1)[0];

      return {
        ...chat,
        lastMessage
      } as ChatWithLastMessage;
    });

    console.log(ChatsWithLastMessages);

    return ChatsWithLastMessages;
  }
}
