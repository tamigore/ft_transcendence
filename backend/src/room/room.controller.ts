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
import { GetCurrentUserId } from "../common/decorators";
import { Room } from "@prisma/client";
import { ModifySelfDto, ModifyOtherDto } from "./dto/room.dto";
import { RoomService } from "./room.service";

@Controller("room")
export class RoomController {
  constructor(private roomService: RoomService) {}

  // @Public()
  @Post("update")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  updateRoom(@GetCurrentUserId() userId: number, @Body() updateRoomDto: Room) {
    this.roomService.update(userId, updateRoomDto);
  }

  @Post("addUser")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  addUser(@Body() dto: ModifySelfDto) {
    this.roomService.addUser(dto.roomId, dto.userId);
  }

  @Post("addAdmin")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  addAdmin(@Body() dto: ModifyOtherDto) {
    this.roomService.addAdmin(dto.roomId, dto.userId, dto.otherId);
  }

  @Post("create")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  createRoom(@Body() dto: Room) {
    this.roomService.createRoom(dto);
  }

  @Post("delete")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  deleteRoom(@GetCurrentUserId() userId: number, @Body() dto: ModifyOtherDto) {
    this.roomService.remove(userId, dto.roomId);
  }

  @Post("delete/user")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  removeUser(@Body() dto: ModifyOtherDto) {
    this.roomService.removeUser(dto.roomId, dto.userId, dto.otherId);
  }

  // @Public()
  @Get()
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  findRooms(): Promise<Room[]> {
    return this.roomService.findAll();
  }

  @Get("all")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  async findRoomsIncludes(): Promise<Room[]> {
    const rooms = await this.roomService.findAllIncludes();
    console.debug(rooms);
    return rooms;
  }

  // @Public()
  @Get(":id")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  findRoom(@Param("id") param: string): Promise<Room> {
    const id: number = parseInt(param);
    return this.roomService.findById(id);
  }

  @Get("private/:id")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  findPrivateRooms(@Param("id") param: string): Promise<Room[]> {
    const id: number = parseInt(param);
    return this.roomService.findPrivateRooms(id);
  }

  // @Public()
  @Delete(":id")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  @Header("Access-Control-Allow-Origin", "*") // Allow origin for other client than localhost
  deleteUser(@GetCurrentUserId() userId: number, @Param("id") param: string) {
    const id: number = parseInt(param);
    this.roomService.remove(userId, id);
  }
}
