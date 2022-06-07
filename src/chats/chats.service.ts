import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChatInput } from './dto/create-chat.input';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat) private readonly chatsRepository: Repository<Chat>
  ) {}

  async create(createChatInput: CreateChatInput & { ownerId: number }) {
    const chat = this.chatsRepository.create({
      membersIds: createChatInput.members,
      messages: [],
      name: createChatInput.name,
      ownerId: createChatInput.ownerId,
    });

    // ---->  https://github.com/typeorm/typeorm/issues/1795
    chat.members = createChatInput.members.map(member => ({
      id: member,
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
}
