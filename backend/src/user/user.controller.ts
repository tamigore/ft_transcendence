import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Header,
  Get,
  UseGuards,
  // Delete,
  Body,
  Param,
} from "@nestjs/common";
import { GetCurrentUserId } from "../common/decorators";
import { UserService } from "./user.service";
import { User } from "@prisma/client";
import { AtGuard } from "../common/guards";

@Controller("user")
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  findUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get("username/:name")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*")
  findUserWithName(@Param("name") param: string): Promise<User> {
    return this.userService.findByUsername(param);
  }

  @Get("!self")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*")
  findAllButSelf(@GetCurrentUserId() userId: number): Promise<User[]> {
    return this.userService.findAllButSelf(userId);
  }

  @Get("friends")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*")
  findAllFriends(@GetCurrentUserId() userId: number): Promise<User[]> {
    return this.userService.findFriends(userId);
  }

  @Get("blocked")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*")
  findAllBlocked(@GetCurrentUserId() userId: number): Promise<User[]> {
    return this.userService.findBlocked(userId);
  }

  @Get("all/:id")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*")
  findFriends(@GetCurrentUserId() userId: number) {
    return this.userService.findWithAllById(userId);
  }

  @Get(":id")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*")
  findUser(@Param("id") param: string): Promise<User> {
    const id = parseInt(param);
    return this.userService.findById(id);
  }

  @Post("update")
  @Header("Access-Control-Allow-Origin", "*")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  updateUser(@GetCurrentUserId() userId: number, @Body() updateUserDto: User) {
    return this.userService.update(userId, updateUserDto);
  }

  @Post("friends/add")
  @Header("Access-Control-Allow-Origin", "*")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  addFriend(@GetCurrentUserId() userId: number, @Body() friend: User) {
    return this.userService.addFriends(userId, friend.id);
  }

  @Post("friends/del")
  @Header("Access-Control-Allow-Origin", "*")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  delFriend(@GetCurrentUserId() userId: number, @Body() friend: User) {
    return this.userService.removeFriends(userId, friend.id);
  }

  @Post("chatsocket")
  @Header("Access-Control-Allow-Origin", "*")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  updateChatSocket(
    @GetCurrentUserId() userId: number,
    @Body() chatSocket: any,
  ) {
    return this.userService.updateChatSocket(userId, chatSocket.socket);
  }

  @Post("gamesocket")
  @Header("Access-Control-Allow-Origin", "*")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  updateGameSocket(
    @GetCurrentUserId() userId: number,
    @Body() gameSocket: any,
  ) {
    console.log(gameSocket.socket);
    this.userService.updateGameSocket(userId, gameSocket.socket);
  }

  @Post("block/add")
  @Header("Access-Control-Allow-Origin", "*")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  addBlock(@GetCurrentUserId() userId: number, @Body() friend: User) {
    return this.userService.addBlocked(userId, friend.id);
  }

  @Post("block/del")
  @Header("Access-Control-Allow-Origin", "*")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  delBlock(@GetCurrentUserId() userId: number, @Body() friend: User) {
    return this.userService.removeBlocked(userId, friend.id);
  }
}
