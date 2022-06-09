import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm';

enum AccountType {
  USER = 'user',
  ADMIN = 'admin'
}

@ObjectType()
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Field()
  @Column()
  username: string;

  @Column()
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    default: AccountType.USER
  })
  type: AccountType;

  @Field()
  @CreateDateColumn()
  createDate: Date;
}
