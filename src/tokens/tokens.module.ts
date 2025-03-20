import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { options } from '../tokens/config';
// import { JwtStrategy } from 'src/tokens/jwt.strategy';

@Module({
  // providers: [TokensService, JwtStrategy],
  providers: [TokensService],
  exports: [TokensService, JwtModule, PassportModule],
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule.registerAsync(options())],
})
export class TokensModule {}
