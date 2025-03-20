import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { genSaltSync, hashSync } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  save(user: Partial<User>) {
    const hashedPassword = this.hashePassword(user.password!);
    return this.prisma.user.create({
      data: {
        name: user.name!,
        email: user.email!,
        password: hashedPassword,
        role: ['USER'],
      },
    });
  }

  findOne(idOrEmail: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ id: idOrEmail }, { email: idOrEmail }],
      },
    });
  }

  delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  private hashePassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }
}
