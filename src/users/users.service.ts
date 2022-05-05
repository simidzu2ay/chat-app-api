import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepositpry: Repository<User>
  ) {}

  async create(createUserInput: CreateUserInput) {
    const user = this.userRepositpry.create(createUserInput);

    return await this.userRepositpry.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepositpry.find();
  }

  async findOne(id: number): Promise<User> {
    return await this.userRepositpry.findOne(id);
  }

  async findByName(name: string): Promise<User> {
    return await this.userRepositpry.findOne({
      where: {
        username: name,
      },
    });
  }

  async findMany(ids: number[]): Promise<User[]> {
    return await this.userRepositpry.findByIds(ids);
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}