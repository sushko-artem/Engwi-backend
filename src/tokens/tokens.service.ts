import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Token, User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { Response } from 'express';
import ms from 'ms';

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(dto: Partial<User>, res: Response) {
    const accessToken = this.jwtService.sign(dto);
    this.saveAccessTokenToCookies(accessToken, res);
    return accessToken;
  }

  async generateRefreshToken(dto: User, res: Response) {
    const isExistRefreshToken = await this.prisma.token.findFirst({
      where: {
        userId: dto.id,
      },
    });
    if (isExistRefreshToken) {
      await this.prisma.token.delete({
        where: {
          token: isExistRefreshToken.token,
        },
      });
    }
    const refreshToken = this.jwtService.sign(dto, {
      expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES'),
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
    await this.saveRefreshToken(dto.id, refreshToken, res);
    return refreshToken;
  }

  private saveAccessTokenToCookies(token: string, res: Response) {
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV', 'development') === 'production',
      maxAge: ms(this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES')),
    });
  }

  private async saveRefreshToken(userId: string, refreshToken: string, res: Response) {
    const maxAge = ms(this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES'));
    if (maxAge === undefined) {
      throw new Error('Invalid JWT_REFRESH_EXPIRES value');
    }
    const expiresAt = new Date(Date.now() + maxAge);
    await this.prisma.token.create({
      data: {
        token: refreshToken,
        userId,
        exp: expiresAt,
      },
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV', 'development') === 'production',
      maxAge: ms(this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES')),
    });
  }

  async verifyRefreshToken(refreshToken: string): Promise<Token | null> {
    return await this.jwtService
      .verifyAsync<Token>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }
}
