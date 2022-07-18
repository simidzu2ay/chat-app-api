import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  async findOneById(@Args('id', { type: () => ID }) id: number): Promise<User> {
    return await this.usersService.findOne(id);
  }
}
