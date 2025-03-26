import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './DTO';
import { Request, Response } from 'express';
import { UserAgent } from '@common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const user = await this.authService.register(dto);
    if (!user) {
      throw new BadRequestException(`Can not register user with credentials ${JSON.stringify(dto)}`);
    }
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto, @Res() response: Response, @UserAgent() userAgent: string) {
    const tokens = await this.authService.login(dto, response, userAgent);
    if (!tokens) {
      throw new BadRequestException(`Can not enter with credentials ${JSON.stringify(dto)}`);
    }

    return response.status(HttpStatus.OK).json({ message: 'Login successful' });
  }

  @Post('refresh-tokens')
  async refresh(@Res() res: Response, @Req() req: Request) {
    const refreshToken = req.cookies['refreshToken'] as string | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const payload = await this.authService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValidRefreshToken = await this.authService.validateRefreshToken(refreshToken, payload.id);
    if (!isValidRefreshToken || new Date(isValidRefreshToken.exp) < new Date()) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const accessToken = await this.authService.generateAccessToken(
      { id: payload.id, email: payload.email, role: payload.role },
      res,
    );

    return res.status(HttpStatus.OK).json({ message: 'Token refreshed' });
  }
}
