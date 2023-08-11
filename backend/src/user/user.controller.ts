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
  @Get()
  // @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  @HttpCode(HttpStatus.OK)
  findUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  // @Public()
  @Get("username/:name")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  findUserWithName(@Param("name") param: string): Promise<User> {
    return this.userService.findByUsername(param);
  }

  @Get("!self")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  findAllButSelf(@GetCurrentUserId() userId: number): Promise<User[]> {
    return this.userService.findAllButSelf(userId);
  }

  // @Public()
  @Get("friends")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  findAllFriends(@GetCurrentUserId() userId: number): Promise<User[]> {
    return this.userService.findFriends(userId);
  }

  // @Public()
  @Get("friends/:id")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  findFriends(
    @GetCurrentUserId() userId: number,
    @Param("id") param: string,
  ): Promise<User[]> {
    const id = parseInt(param);
    return this.userService.findFriendsById(userId, id);
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

  // @Public()
  @Get()
  // @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  @HttpCode(HttpStatus.OK)
  findUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  // @Public()
  @Get("username/:name")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  findUserWithName(@Param("name") param: string): Promise<User> {
    return this.userService.findByUsername(param);
  }

  @Get("!self")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  findAllButSelf(@GetCurrentUserId() userId: number): Promise<User[]> {
    return this.userService.findAllButSelf(userId);
  }

  // @Public()
  @Get("friends")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  findAllFriends(@GetCurrentUserId() userId: number): Promise<User[]> {
    return this.userService.findFriends(userId);
  }

  // @Public()
  @Get("friends/:id")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  findFriends(
    @GetCurrentUserId() userId: number,
    @Param("id") param: string,
  ): Promise<User[]> {
    const id = parseInt(param);
    return this.userService.findFriendsById(userId, id);
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

  @Post("block/add")
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  addBlock(@GetCurrentUserId() userId: number, @Body() friend: User) {
    this.userService.addBlocked(userId, friend.id);
  }

  // @Public()
  @Post("block/del")
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  delBlock(@GetCurrentUserId() userId: number, @Body() friend: User) {
    this.userService.removeBlocked(userId, friend.id);
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
