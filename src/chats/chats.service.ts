import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../messages/entities/message.entity';
import { CreateChatInput } from './dto/create-chat.input';
import { Chat } from './entities/chat.entity';

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

  async findUsersChats(
    userId: number,
    offset = 0,
    count = 10
  ): Promise<Chat[]> {
    const chats = await this.chatsRepository
      .createQueryBuilder('chat')
      .skip(offset)
      .take(count)
      .leftJoinAndSelect('chat.members', 'members')
      .where('members.id = :userId', { userId })
      .getMany();

    // const lastMessages = await this.messagesReposityry
    //   .createQueryBuilder('message')
    //   .take(chats.length)
    //   .orderBy('id', 'DESC')
    //   .where('message.chat_id IN (:...chatIds)', {
    //     chatIds: chats.map(c => c.id)
    //   })
    //   .getMany();

    // const ChatsWithLastMessages = chats.map(chat => {
    //   // Should help with large amount of data
    //   const lastMessageIndex = lastMessages.findIndex(
    //     message => message.chatId === chat.id
    //   );
    //   const lastMessage =
    //     lastMessageIndex !== -1
    //       ? lastMessages.splice(lastMessageIndex, 1)[0]
    //       : null;

    //   return {
    //     ...chat,
    //     lastMessage
    //   } as ChatWithLastMessage;
    // });

    return chats;
  }

  async getLastMessage(chatId: number) {
    return await this.messagesReposityry
      .createQueryBuilder('message')
      .select()
      .where('message.chat_id = :chatId', { chatId })
      .orderBy('id', 'DESC')
      .getOne();
  }

  async search(chatName: string, userId: number) {
    return await this.chatsRepository
      .createQueryBuilder('chat')
      .select()
      .where('LOWER(chat.name) like LOWER(:chatName)', {
        chatName: `%${chatName}%`
      })
      .leftJoinAndSelect('chat.members', 'member')
      .andWhere('member.id = :userId', { userId })
      .getMany();
  }
}
