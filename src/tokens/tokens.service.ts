import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { IjwtPayload } from './interfaces';
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

  async generateAccessToken(payload: IjwtPayload, res: Response) {
    const accessToken = await this.jwtService.signAsync(payload);
    this.saveAccessTokenToCookies(accessToken, res);
    return accessToken;
  }

  async generateRefreshToken(payload: IjwtPayload, res: Response, agent: string) {
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES'),
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
    await this.saveRefreshToken(payload.id, refreshToken, agent, res);
    return refreshToken;
  }

  private saveAccessTokenToCookies(token: string, res: Response) {
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV', 'development') === 'production',
      maxAge: ms(this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES')),
    });
  }

  private async saveRefreshToken(userId: string, refreshToken: string, userAgent: string, res: Response) {
    const maxAge = ms(this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES'));
    if (maxAge === undefined) {
      throw new Error('Invalid JWT_REFRESH_EXPIRES value');
    }
    const expiresAt = new Date(Date.now() + maxAge);
    const isExistRefreshToken = await this.prisma.token.findFirst({
      where: {
        userId,
        userAgent,
      },
    });
    if (isExistRefreshToken) {
      await this.prisma.token.delete({
        where: {
          token: isExistRefreshToken.token,
        },
      });
    }
    await this.prisma.token.create({
      data: {
        token: refreshToken,
        userId,
        exp: expiresAt,
        userAgent,
      },
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV', 'development') === 'production',
      maxAge,
    });
  }

  async verifyRefreshToken(refreshToken: string): Promise<IjwtPayload | null> {
    return this.jwtService
      .verifyAsync<IjwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }

  async validateRefreshToken(token: string, userId: string) {
    return this.prisma.token
      .findUnique({
        where: {
          token,
          userId,
        },
      })
      .catch((err) => {
        this.logger.error(err);
        return null;
      });
  }
}
