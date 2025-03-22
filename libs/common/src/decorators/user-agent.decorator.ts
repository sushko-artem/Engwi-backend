import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const UserAgent = createParamDecorator((_: string, ctx: ExecutionContext): string => {
  const request: Request = ctx.switchToHttp().getRequest();
  const userAgent = request.headers['user-agent'];
  if (!userAgent) {
    throw new Error('User-Agent header is missing');
  }
  return userAgent;
});
