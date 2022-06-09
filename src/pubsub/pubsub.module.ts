import { Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

const provider = {
  provide: 'PUB_SUB',
  useValue: pubSub
};

export const Subscriptions = {
  NEW_MESSAGE: 'newMessage'
};

@Module({
  providers: [provider],
  exports: [provider]
})
export class PubSubModule {}
