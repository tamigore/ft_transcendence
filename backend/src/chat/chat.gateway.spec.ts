import type { Message } from "@prisma/client";
import { ChatGateway } from "./chat.gateway";

const createMockServer = () => {
  const emitter = { emit: jest.fn() };
  return {
    to: jest.fn().mockReturnValue(emitter),
    emit: jest.fn(),
    _emitter: emitter,
  };
};

describe("ChatGateway", () => {
  const chatService = {
    createMessage: jest.fn<Promise<Message>, any>(),
  };
  const userService = {
    updateChatSocket: jest.fn(),
  };
  const roomService = {
    findByIdWithAll: jest.fn(),
    findById: jest.fn(),
    isOwner: jest.fn(),
    isAdmin: jest.fn(),
    isUser: jest.fn(),
    isBan: jest.fn(),
    isMute: jest.fn(),
  };

  const baseRoom = {
    id: 5,
    name: "general",
    private: false,
  } as any;

  const socket = {
    id: "socket-1",
    data: {
      user: {
        id: 10,
        username: "alice",
        img: null,
      },
    },
  } as any;

  let gateway: ChatGateway;
  let server: ReturnType<typeof createMockServer>;

  beforeEach(() => {
    jest.clearAllMocks();
    server = createMockServer();
    gateway = new ChatGateway(
      chatService as any,
      userService as any,
      roomService as any,
    );
    gateway.server = server as any;
  });

  it("persists messages for the authenticated socket user and broadcasts sanitized payload", async () => {
    const dto = { roomId: 5, text: " hello " };
    const savedMessage = {
      id: 99,
      roomId: 5,
      userId: 10,
      text: "hello",
      created_at: new Date(),
    } as Message;

    roomService.findByIdWithAll.mockResolvedValue({
      ...baseRoom,
      users: [{ id: 10 }],
      admins: [],
      owner: { id: 1 },
      mute: [],
      ban: [],
    });
    roomService.isOwner.mockReturnValue(false);
    roomService.isAdmin.mockReturnValue(false);
    roomService.isUser.mockReturnValue(true);
    roomService.isBan.mockReturnValue(false);
    roomService.isMute.mockReturnValue(false);
    chatService.createMessage.mockResolvedValue(savedMessage);

    await gateway.onMessage(socket, dto);

    expect(chatService.createMessage).toHaveBeenCalledWith({
      text: "hello",
      roomId: 5,
      userId: 10,
    });
    expect(server.to).toHaveBeenCalledWith("general");
    expect(server._emitter.emit).toHaveBeenCalledWith(
      "servMessage",
      expect.objectContaining({
        userId: 10,
        roomId: 5,
        text: "hello",
        user: expect.objectContaining({ id: 10, username: "alice" }),
      }),
    );
  });

  it("rejects spoofed payloads when the socket user is not a room member", async () => {
    const dto = { roomId: 5, text: "test" };

    roomService.findByIdWithAll.mockResolvedValue({
      ...baseRoom,
      users: [],
      admins: [],
      owner: { id: 1 },
      mute: [],
      ban: [],
    });
    roomService.isOwner.mockReturnValue(false);
    roomService.isAdmin.mockReturnValue(false);
    roomService.isUser.mockReturnValue(false);

    const result = await gateway.onMessage(socket, dto);

    expect(result).toBeNull();
    expect(chatService.createMessage).not.toHaveBeenCalled();
    expect(server._emitter.emit).not.toHaveBeenCalled();
  });
});
