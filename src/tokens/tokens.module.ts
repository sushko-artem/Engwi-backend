import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { JwtModule } from '@nestjs/jwt';
import { options } from './config';

@Module({
  providers: [TokensService],
  exports: [TokensService, JwtModule],
  imports: [JwtModule.registerAsync(options())],
})
export class TokensModule {}
