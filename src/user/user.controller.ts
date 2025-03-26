import { Controller, Delete, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':idOrEmail')
  async getOneUser(@Param('idOrEmail') idOrEmail: string) {
    return await this.userService.findOne(idOrEmail);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return await this.userService.delete(id);
  }
}
