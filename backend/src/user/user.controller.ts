import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Header,
  Get,
  // UseGuards,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { GetCurrentUserId } from "../common/decorators";
import { UserService } from "./user.service";
import { User } from "@prisma/client";
// import { AtGuard } from "../common/guards";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  // @Public()
  @Post("update")
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  updateUser(@GetCurrentUserId() userId: number, @Body() updateUserDto: User) {
    this.userService.update(userId, updateUserDto);
  }

  @Post("chatsocket")
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  updateChatSocket(
    @GetCurrentUserId() userId: number,
    @Body() chatSocket: any,
  ) {
    this.userService.updateChatSocket(userId, chatSocket.socket);
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
  findUser(@Param("id") param: string): Promise<User> {
    console.log(param);
    const id = parseInt(param);
    console.log(id);
    return this.userService.findById(id);
  }

  // @Public()
  @Delete(":id")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  deleteUser(
    @GetCurrentUserId() userId: number,
    @Param("id") param: string,
  ): Promise<User> {
    const id = parseInt(param.split("=")[1]);
    return this.userService.remove(userId, id);
  }
}
