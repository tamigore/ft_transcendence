import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Header,
  Get,
  UseGuards,
  Delete,
} from "@nestjs/common";
import { GetCurrentUserId, Public } from "../common/decorators";
import { UserService } from "./user.service";
import { User } from "@prisma/client";
import { ModifyUserDto } from "./dto";
import { AtGuard, RtGuard } from "../common/guards";

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

  @Public()
  @Post("update")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  updateUser(
    @GetCurrentUserId() userId: number,
    id: number,
    updateUserDto: any
  ) {
    this.userService.update(userId, id, updateUserDto);
  }

  @Public()
  @Get()
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  findUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Public()
  @Get(":id")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  findUser(@GetCurrentUserId() userId: number, id: number): Promise<User> {
    return this.userService.findById(userId, id);
  }

  @Public()
  @Delete(":id")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  deleteUser(@GetCurrentUserId() userId: number, id: number): Promise<User> {
    return this.userService.remove(userId, id);
  }
}
