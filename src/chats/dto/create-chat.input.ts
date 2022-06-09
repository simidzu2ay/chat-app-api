import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateChatInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @Field(() => [Int])
  @IsNumber(
    {},
    {
      each: true
    }
  )
  members: number[];
}
