// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';
// import { Request } from 'express';
// import { User } from '@prisma/client';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(private configService: ConfigService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromExtractors([
//         (request: Request) => {
//           return request.cookies['accessToken'];
//         },
//       ]),
//       ignoreExpiration: false,
//       secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
//     });
//   }

//   async validate(payload: User) {
//     return { userId: payload.id, name: payload.name };
//   }
// }
