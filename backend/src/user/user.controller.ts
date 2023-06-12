import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
} from "@nestjs/common";
import { Public } from "../common/decorators";
import { UserService } from "./user.service";
import { User } from "@prisma/client";
import { ModifyUserDto } from "./dto";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Public()
  @Post("modify")
  @HttpCode(HttpStatus.OK)
  modifyUser(@Body() dto: ModifyUserDto) {
    this.userService.modifyUser(dto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  getUser(@Body() dto: User): Promise<User> {
    return this.userService.getUser(dto);
  }
}
