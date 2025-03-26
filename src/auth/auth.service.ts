import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { LoginUserDto, RegisterUserDto } from './DTO';
import { TokensService } from 'src/tokens/tokens.service';
import { Response } from 'express';
import { compareSync } from 'bcrypt';
import { IjwtPayload } from 'src/shared/interfaces/jwtPayloadInterface';

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
      throw new ConflictException('Пользователь с таким email уже существует');
    }
    return await this.userService.save(dto).catch((err) => {
      this.logger.error(err);
      return null;
    });
  }

  async login(dto: LoginUserDto, response: Response, userAgent: string) {
    const user = await this.userService.findOne(dto.email).catch((err) => {
      this.logger.error(err);
      return null;
    });
    if (!user || !compareSync(dto.password, user.password)) {
      throw new UnauthorizedException('Не верно указан email или пароль');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, password, createdAt, updatedAt, ...payload } = user;
    const accessToken = await this.generateAccessToken(payload, response);
    const refreshToken = await this.generateRefreshToken(payload, response, userAgent);
    return { accessToken, refreshToken };
  }

  async generateAccessToken(payload: IjwtPayload, response: Response) {
    return this.tokensService.generateAccessToken(payload, response);
  }

  private async generateRefreshToken(payload: IjwtPayload, response: Response, userAgent: string) {
    return this.tokensService.generateRefreshToken(payload, response, userAgent);
  }

  async verifyRefreshToken(refreshToken: string) {
    return this.tokensService.verifyRefreshToken(refreshToken);
  }

  async validateRefreshToken(refreshToken: string, userId: string) {
    return this.tokensService.validateRefreshToken(refreshToken, userId);
  }
}
