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
import { ConfigService } from '@nestjs/config';
import { Token } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const user = await this.authService.register(dto);
    if (!user) {
      throw new BadRequestException(`Can not register user with credentials ${JSON.stringify(dto)}`);
    }
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto, @Res() res: Response) {
    const tokens = await this.authService.login(dto, res);
    if (!tokens) {
      throw new BadRequestException(`Can not enter with credentials ${JSON.stringify(dto)}`);
    }
    return res.status(HttpStatus.OK).json({ message: 'Login successful' });
  }

  @Post('refresh-tokens')
  refresh(@Res() res: Response, @Req() req: Request) {
    const refreshToken = req.cookies['refreshToken'] as Token;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
  }
}
