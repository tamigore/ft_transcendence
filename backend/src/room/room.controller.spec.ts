import {
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { RoomController } from "./room.controller";
import { RoomService } from "./room.service";

describe("RoomController", () => {
  let controller: RoomController;
  let roomService: jest.Mocked<RoomService>;

  beforeEach(() => {
    roomService = {
      addAdmin: jest.fn(),
      addUser: jest.fn(),
      findPrivateRooms: jest.fn(),
      createRoom: jest.fn(),
      getPrivateRoom: jest.fn(),
      removeUser: jest.fn(),
      addBan: jest.fn(),
      addMute: jest.fn(),
      delBan: jest.fn(),
      delMute: jest.fn(),
      delAdmin: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findAllIncludes: jest.fn(),
      findAllPublic: jest.fn(),
      findById: jest.fn(),
      findByIdWithAll: jest.fn(),
      findByIdWithUser: jest.fn(),
      findByName: jest.fn(),
      remove: jest.fn(),
      removeAdmin: jest.fn(),
      removeBan: jest.fn(),
      removeMute: jest.fn(),
      addFriends: jest.fn() as never,
      removeFriends: jest.fn() as never,
      addBlocked: jest.fn() as never,
      removeBlocked: jest.fn() as never,
      addUserToRoom: jest.fn() as never,
      delUserFromRoom: jest.fn() as never,
    } as unknown as jest.Mocked<RoomService>;

    controller = new RoomController(roomService);
  });

  it("uses authenticated user when adding admins", () => {
    controller.addAdmin(7, { roomId: 42, otherId: 15 });
    expect(roomService.addAdmin).toHaveBeenCalledWith(42, 7, 15);
  });

  it("passes JWT user to addUser and defaults password", () => {
    controller.addUser(99, { roomId: 3 });
    expect(roomService.addUser).toHaveBeenCalledWith(3, 99, "");
  });

  it("rejects fetching private rooms for another user", () => {
    expect(() => controller.findPrivateRooms(1, "2")).toThrow(ForbiddenException);
    expect(roomService.findPrivateRooms).not.toHaveBeenCalled();
  });

  it("allows fetching own private rooms", () => {
    controller.findPrivateRooms(4, "4");
    expect(roomService.findPrivateRooms).toHaveBeenCalledWith(4);
  });

  it("throws when private room target missing", () => {
    expect(() =>
      controller.createPrivateRoom(5, { roomId: 1 } as any),
    ).toThrow(BadRequestException);
    expect(roomService.getPrivateRoom).not.toHaveBeenCalled();
  });

  it("prefers otherId but falls back to legacy payload", () => {
    controller.createPrivateRoom(10, { otherId: 11 });
    expect(roomService.getPrivateRoom).toHaveBeenCalledWith(10, 11);

    controller.createPrivateRoom(10, { user2: { id: 12 } } as any);
    expect(roomService.getPrivateRoom).toHaveBeenCalledWith(10, 12);
  });
});
