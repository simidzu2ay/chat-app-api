import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LogInInput } from './dto/log-in.input';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { SignUpInput } from './dto/sign-up.input';
import { JwtTokens } from './entities/jwt.entity';
import { Public } from './public.decorator';

@Resolver('auth')
@Public()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  @Mutation(() => JwtTokens)
  async signUp(
    @Args('input', { type: () => SignUpInput }) data: SignUpInput
  ): Promise<JwtTokens> {
    if (await this.usersService.findByName(data.username)) {
      // TODO: Move string to a locales file
      throw new BadRequestException(
        'User with this username already registered'
      );
    }

    const passwordHash = await this.authService.hashPassword(data.password);
    const user = await this.usersService.create({
      passwordHash,
      username: data.username
    });

    return await this.authService.getTokens(user.id);
  }

  @Mutation(() => JwtTokens)
  async logIn(@Args('data') logInData: LogInInput): Promise<JwtTokens> {
    const user = await this.usersService.findByName(logInData.username);

    if (user) {
      const isCorrectPassword = await this.authService.comparePassword(
        logInData.password,
        user.passwordHash
      );

      if (isCorrectPassword) {
        return await this.authService.getTokens(user.id);
      }
    }

    throw new UnauthorizedException('Wrong Username/Password');
  }

  @Mutation(() => JwtTokens)
  async refresh(
    @Args('data') { expiredToken, refreshToken }: RefreshTokenInput
  ) {
    try {
      await this.jwtService.verifyAsync(expiredToken);
    } catch (error) {
      if (error.message === 'jwt expired') {
        // TODO: refractor & catch bad refresh token
        await this.jwtService.verifyAsync(refreshToken, {
          secret: this.configService.get('jwt.secret.refresh')
        });

        const decodedExpired = this.jwtService.decode(expiredToken) as Record<
          string,
          any
        >;
        const decodedRefresh = this.jwtService.decode(refreshToken) as Record<
          string,
          any
        >;

        if (decodedExpired.id === decodedRefresh.id) {
          return await this.authService.getTokens(decodedRefresh.id);
        }
      }

      throw new BadRequestException(error.message);
    }
  }
}
