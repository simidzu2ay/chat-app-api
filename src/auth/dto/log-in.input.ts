import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class LogInInput {
  @IsString()
  @Field()
  username: string;

  @IsString()
  @Field()
  password: string;
}
