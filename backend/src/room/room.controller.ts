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
} from "@nestjs/common";
import { GetCurrentUserId, Public } from "../common/decorators";
import { Room, User } from "@prisma/client";
import { ModifyOtherDto } from "./dto/room.dto";
import { RoomService } from "./room.service";

@Controller("room")
export class RoomController {
  constructor(private roomService: RoomService) {}

  @Public()
  @Get()
  // @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  findRooms(): Promise<Room[]> {
    return this.roomService.findAll();
  }

  @Public()
  @Get("all")
  // @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  async findRoomsIncludes(): Promise<Room[]> {
    const rooms = await this.roomService.findAllIncludes();
    console.debug(rooms);
    return rooms;
  }

  @Public()
  @Get("public")
  // @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  async findPublicRooms(): Promise<Room[]> {
    // const rooms = await this.roomService.findAllPublic();
    // console.debug(rooms);
    // return rooms;
    return await this.roomService.findAllPublic();
  }

  @Public()
  @Get("private/:id")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*")
  findPrivateRooms(@Param("id") param: string): Promise<Room[]> {
    const id: number = parseInt(param);
    return this.roomService.findPrivateRooms(id);
  }

  @Public()
  @Get(":id")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*")
  findRoom(@Param("id") param: string): Promise<Room> {
    const id: number = parseInt(param);
    return this.roomService.findById(id);
  }

  @Public()
  @Post("update")
  // @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  updateRoom(@GetCurrentUserId() userId: number, @Body() updateRoomDto: Room) {
    this.roomService.update(userId, updateRoomDto);
  }

  @Public()
  @Post("addUser")
  // @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  addUser(@Body() dto: any): Promise<boolean> {
    return this.roomService.addUser(dto.roomId, dto.userId, dto.pwd);
  }

  @Public()
  @Post("addAdmin")
  // @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  addAdmin(@Body() dto: ModifyOtherDto) {
    this.roomService.addAdmin(dto.roomId, dto.userId, dto.otherId);
  }

  @Public()
  @Post("addBan")
  // @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  addBanned(@Body() dto: ModifyOtherDto) {
    this.roomService.addBan(dto.roomId, dto.userId, dto.otherId);
  }

  @Public()
  @Post("addMute")
  // @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  addMute(@Body() dto: ModifyOtherDto) {
    this.roomService.addMute(dto.roomId, dto.userId, dto.otherId);
  }

  @Public()
  @Post("create")
  // @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  createRoom(@Body() dto: Room) {
    return this.roomService.createRoom(dto);
  }

  @Public()
  @Post("private")
  // @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  createPrivateRoom(@Body() dto: { user1: User; user2: User }): Promise<Room> {
    return this.roomService.getPrivateRoom(dto.user1, dto.user2);
  }

  @Public()
  @Post("delUser")
  // @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  removeUser(@Body() dto: any) {
    this.roomService.removeUser(dto.roomId, dto.userId, dto.otherId);
  }

  // @Public()
  @Delete(":id")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*")
  deleteUser(@GetCurrentUserId() userId: number, @Param("id") param: string) {
    const id: number = parseInt(param);
    this.roomService.remove(userId, id);
  }
}
