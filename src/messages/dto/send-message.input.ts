import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsString, Length, Min } from 'class-validator';

@InputType()
export class SendMessageInput {
  @Field()
  @IsString()
  @Length(1, 1024 * 4)
  text: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  chatId: number;
}
