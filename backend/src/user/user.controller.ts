import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Header,
  Get,
  // UseGuards,
  // Delete,
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

  // @Public()
  @Post("friends/add")
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  addFriend(@GetCurrentUserId() userId: number, @Body() friend: User) {
    this.userService.addFriends(userId, friend.id);
  }

  // @Public()
  @Post("friends/del")
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  delFriend(@GetCurrentUserId() userId: number, @Body() friend: User) {
    this.userService.removeFriends(userId, friend.id);
  }

  // @Public()
  @Get("friends/:id")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  findFriends(@Param("id") param: string): Promise<User[]> {
    const id = parseInt(param);
    return this.userService.findFriendsById(id);
  }

  @Post("chatsocket")
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  updateChatSocket(
    @GetCurrentUserId() userId: number,
    @Body() chatSocket: any,
  ) {
    console.log(chatSocket.socket);
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
    const id = parseInt(param);
    return this.userService.findById(id);
  }

  @Get("!self")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  findAllButSelf(@Param("id") param: string): Promise<User[]> {
    const id = parseInt(param);
    return this.userService.findAllButSelf(id);
  }

  // // @Public()
  // @Delete(":id")
  // // @UseGuards(AtGuard)
  // @HttpCode(HttpStatus.OK)
  // @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  // deleteUser(@GetCurrentUserId() userId: number, @Param("id") param: string) {
  //   const id = parseInt(param.split("=")[1]);
  //   return this.userService.remove(userId, id);
  // }
}
