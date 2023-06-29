import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Header,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Public } from "../common/decorators";
import { UserService } from "./user.service";
import { User } from "@prisma/client";
import { ModifyUserDto } from "./dto";
import { RtGuard } from "../common/guards";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Public()
  @Post("modify")
  @UseGuards(RtGuard)
  @HttpCode(HttpStatus.OK)
  modifyUser(@Body() dto: ModifyUserDto) {
    this.userService.modifyUser(dto);
  }

  @Public()
  @Get("findone")
  @HttpCode(HttpStatus.OK)
  getUser(@Body() query: string): Promise<User> {
    return this.userService.getUser(query);
  }

  @Public()
  @Get("findmany")
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  getUsers(@Body() query: string): Promise<User[]> {
    return this.userService.getUsers(query);
  }
}
