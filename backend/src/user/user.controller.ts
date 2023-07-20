import {
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
import { AtGuard } from "../common/guards";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  // @Public()
  @Post("update")
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  updateUser(@GetCurrentUserId() userId: number, updateUserDto: User) {
    this.userService.update(userId, updateUserDto);
  }

  // @Public()
  @Get()
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  findUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  // @Public()
  @Get(":id")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  findUser(@GetCurrentUserId() userId: number, id: number): Promise<User> {
    return this.userService.findById(userId, id);
  }

  // @Public()
  @Delete(":id")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  deleteUser(@GetCurrentUserId() userId: number, id: number): Promise<User> {
    return this.userService.remove(userId, id);
  }
}
