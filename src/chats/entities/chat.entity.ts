import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId
} from 'typeorm';
import { Message } from '../../messages/entities/message.entity';
import { User } from '../../users/entities/user.entity';

@ObjectType()
@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  name: string;

  @Field()
  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @RelationId((chat: Chat) => chat.owner)
  ownerId: number;

  @ManyToMany(() => User, {
    cascade: true
  })
  @Field(() => [User])
  @JoinTable()
  members: User[];

  @RelationId((c: Chat) => c.members)
  membersIds: number[];

  @OneToMany(() => Message, message => message.chat, { cascade: true })
  messages: Message[];
}
