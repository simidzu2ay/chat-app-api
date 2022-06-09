import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { JwtTokens } from './entities/jwt.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtServise: JwtService,
    private readonly configService: ConfigService
  ) {}

  async hashPassword(password: string) {
    return await bcrypt.hash(
      password,
      this.configService.get('hashing.password.salt.round')
    );
  }

  async comparePassword(plainPassword: string, hashPassword: string) {
    return await bcrypt.compare(plainPassword, hashPassword);
  }

  // TODO: Make sessions
  async getTokens(userId: number): Promise<JwtTokens> {
    const accessToken = await this.jwtServise.signAsync({
      id: userId
    });

    const refreshToken = await this.jwtServise.signAsync(
      {
        id: userId
      },
      { secret: this.configService.get('jwt.secret.refresh'), expiresIn: '1y' }
    );

    return {
      accessToken,
      refreshToken
    };
  }
}
