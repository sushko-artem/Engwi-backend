import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { LoginUserDto, RegisterUserDto } from './DTO';
import { TokensService } from 'src/tokens/tokens.service';
import { Response } from 'express';
import { Token } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly tokensService: TokensService,
  ) {}

  async register(dto: RegisterUserDto) {
    const user = await this.userService.findOne(dto.email).catch((err) => {
      this.logger.error(err);
      return null;
    });
    if (user) {
      throw new ConflictException('User with that email is already exist');
    }
    return this.userService.save(dto).catch((err) => {
      this.logger.error(err);
      return null;
    });
  }

  async login(dto: LoginUserDto, res: Response) {
    const user = await this.userService.findOne(dto.email).catch((err) => {
      this.logger.error(err);
      return null;
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = this.tokensService.generateAccessToken(dto, res);
    const refreshToken = await this.tokensService.generateRefreshToken(user, res);
    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(refreshToken: Token) {
    await this.tokensService.verifyRefreshToken(refreshToken.token);
  }
}
