import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SendMessageInput } from './dto/send-message.input';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private messagesRepository: Repository<Message>
  ) {}

  async send(messageInput: SendMessageInput, from: number) {
    const message = await this.messagesRepository
      .createQueryBuilder()
      .insert()
      .into(Message)
      .values({
        // @ts-ignore
        chat: messageInput.chatId,
        // @ts-ignore
        fromUser: from,
        text: messageInput.text,
        chatMessageId: () =>
          `((SELECT COALESCE(MAX(chat_message_id), 0) FROM message WHERE chat_id = ${messageInput.chatId}) + 1)`
      })
      .returning('*')
      .execute();

    return message.generatedMaps[0];
  }

  // TODO: count & offset
  async getMessages(chatId: number) {
    // Get last ${num} messages from chat
    const messages = await this.messagesRepository
      .createQueryBuilder('message')
      .select()
      .where('message.chat_id = :chatId', { chatId })
      .orderBy('chat_message_id', 'DESC')
      .take(100)
      .getMany();

    return messages.sort((a, b) => a.chatMessageId - b.chatMessageId);
  }
}
