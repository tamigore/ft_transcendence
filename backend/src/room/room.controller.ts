import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { GetCurrentUserId } from "../common/decorators";
import { Room } from "@prisma/client";
import {
  CreateRoomDto,
  PrivateRoomDto,
  RoomPasswordDto,
  RoomTargetDto,
} from "./dto";
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
    // console.debug(rooms);
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
  findPrivateRooms(
    @GetCurrentUserId() userId: number,
    @Param("id") param: string,
  ) {
    const requestedId: number = parseInt(param);
    if (requestedId !== userId) {
      throw new ForbiddenException("Cannot access other users' private rooms");
    }
    return this.roomService.findPrivateRooms(userId);
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
  addUser(
    @GetCurrentUserId() userId: number,
    @Body() dto: RoomPasswordDto,
  ): Promise<boolean> {
    return this.roomService.addUser(dto.roomId, userId, dto.pwd ?? "");
  }

  @Post("addAdmin")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  addAdmin(
    @GetCurrentUserId() userId: number,
    @Body() dto: RoomTargetDto,
  ) {
    this.roomService.addAdmin(dto.roomId, userId, dto.otherId);
  }

  @Post("delAdmin")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  delAdmin(
    @GetCurrentUserId() userId: number,
    @Body() dto: RoomTargetDto,
  ) {
    this.roomService.delAdmin(dto.roomId, userId, dto.otherId);
  }

  @Post("addBan")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  addBanned(
    @GetCurrentUserId() userId: number,
    @Body() dto: RoomTargetDto,
  ) {
    this.roomService.addBan(dto.roomId, userId, dto.otherId);
  }

  @Post("delBan")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  delBan(
    @GetCurrentUserId() userId: number,
    @Body() dto: RoomTargetDto,
  ) {
    this.roomService.delBan(dto.roomId, userId, dto.otherId);
  }

  @Post("addMute")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  addMute(
    @GetCurrentUserId() userId: number,
    @Body() dto: RoomTargetDto,
  ) {
    this.roomService.addMute(dto.roomId, userId, dto.otherId);
  }

  @Post("delMute")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  delMute(
    @GetCurrentUserId() userId: number,
    @Body() dto: RoomTargetDto,
  ) {
    this.roomService.delMute(dto.roomId, userId, dto.otherId);
  }

  @Post("create")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  createRoom(
    @GetCurrentUserId() userId: number,
    @Body() dto: CreateRoomDto,
  ) {
    return this.roomService.createRoom(userId, dto);
  }

  @Post("private")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  createPrivateRoom(
    @GetCurrentUserId() userId: number,
    @Body() dto: PrivateRoomDto & { user2?: { id: number } },
  ) {
    const targetId = dto.otherId ?? dto.user2?.id;
    if (!targetId) {
      throw new BadRequestException("Missing recipient for private room");
    }
    return this.roomService.getPrivateRoom(userId, targetId);
  }

  @Post("delUser")
  @UseGuards(AtGuard)
  @Header("Access-Control-Allow-Origin", "*")
  @HttpCode(HttpStatus.OK)
  removeUser(
    @GetCurrentUserId() userId: number,
    @Body() dto: RoomTargetDto,
  ) {
    this.roomService.removeUser(dto.roomId, userId, dto.otherId);
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
