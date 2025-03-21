import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const UserAgent = createParamDecorator((_: string, ctx: ExecutionContext) => {
  const request: Request = ctx.switchToHttp().getRequest();
  return request.headers['user-agent'];
});
