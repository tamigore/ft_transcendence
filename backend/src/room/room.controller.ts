import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Header,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { GetCurrentUserId } from "../common/decorators";
import { Room, User } from "@prisma/client";
// import { ModifyOtherDto } from "./dto/room.dto";
import { RoomService } from "./room.service";
import { AtGuard } from "src/common/guards";

@Controller("room")
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Get()
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  findRooms() {
    return this.roomService.findAll();
  }

  @Get("all")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  async findRoomsIncludes() {
    const rooms = await this.roomService.findAllIncludes();
    console.debug(rooms);
    return rooms;
  }

  @Get("public")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  async findPublicRooms() {
    return await this.roomService.findAllPublic();
  }

  @Get("private/:id")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*")
  findPrivateRooms(@Param("id") param: string) {
    const id: number = parseInt(param);
    return this.roomService.findPrivateRooms(id);
  }

  @Get(":id")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*")
  findRoom(@Param("id") param: string) {
    const id: number = parseInt(param);
    return this.roomService.findById(id);
  }

  @Post("update")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  updateRoom(@GetCurrentUserId() userId: number, @Body() updateRoomDto: Room) {
    this.roomService.update(userId, updateRoomDto);
  }

  @Post("addUser")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  addUser(@Body() dto: any): Promise<boolean> {
    return this.roomService.addUser(dto.roomId, dto.userId, dto.pwd);
  }

  @Post("addAdmin")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  addAdmin(@Body() dto: any) {
    this.roomService.addAdmin(dto.roomId, dto.userId, dto.otherId);
  }

  @Post("addBan")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  addBanned(@Body() dto: any) {
    this.roomService.addBan(dto.roomId, dto.userId, dto.otherId);
  }

  @Post("addMute")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  addMute(@Body() dto: any) {
    this.roomService.addMute(dto.roomId, dto.userId, dto.otherId);
  }

  @Post("create")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  createRoom(@Body() dto: Room) {
    return this.roomService.createRoom(dto);
  }

  @Post("private")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  createPrivateRoom(@Body() dto: { user1: User; user2: User }) {
    return this.roomService.getPrivateRoom(dto.user1, dto.user2);
  }

  @Post("delUser")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  removeUser(@Body() dto: any) {
    this.roomService.removeUser(dto.roomId, dto.userId, dto.otherId);
  }

  @Delete(":id")
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*")
  deleteUser(@GetCurrentUserId() userId: number, @Param("id") param: string) {
    const id: number = parseInt(param);
    this.roomService.remove(userId, id);
  }
}
