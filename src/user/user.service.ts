import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { genSaltSync, hashSync } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: Omit<User, 'id' | 'role' | 'createdAt' | 'updatedAt'>) {
    const hashedPassword = this.hashePassword(user.password);
    return this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: ['USER'],
      },
    });
  }

  async findOne(idOrEmail: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ id: idOrEmail }, { email: idOrEmail }],
      },
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  private hashePassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }
}
