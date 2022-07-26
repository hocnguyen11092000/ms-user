import { Controller, UseGuards, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern } from '@nestjs/microservices';
import { User } from './user.entity';
import { AuthGuard } from '../guards/AuthGuard';
import { Role } from 'src/emums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ role: 'user', cmd: 'get' })
  getUser(data: any): Promise<User> {
    return this.userService.findOne({ username: data.username });
  }

  @UseGuards(AuthGuard)
  @Get('greet')
  async greet(): Promise<string> {
    return 'Greetings authenticated user';
  }

  @UseGuards(AuthGuard)
  @Roles(Role.Admin)
  @Get('test')
  async test(): Promise<string> {
    return 'test';
  }
}
