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
import { AddDelUserDto } from "./dto/room.dto";
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
  addUser(@Body() dto: AddDelUserDto) {
    this.roomService.addUser(dto.roomId, dto.userId);
  }

  @Post("addAdmin")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  addAdmin(@Body() dto: AddDelUserDto) {
    this.roomService.addAdmin(dto.roomId, dto.userId);
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
  deleteRoom(@GetCurrentUserId() userId: number, @Body() dto: Room) {
    this.roomService.remove(userId, dto.id);
  }

  @Post("delete/user")
  // @UseGuards(AtGuard)
  @HttpCode(HttpStatus.OK)
  removeUser(@Body() dto: AddDelUserDto) {
    this.roomService.removeUser(dto.roomId, dto.userId);
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
  findRoomsIncludes(): Promise<Room[]> {
    return this.roomService.findAllIncludes();
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
