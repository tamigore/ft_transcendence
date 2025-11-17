// @ts-nocheck

import { ForbiddenException } from "@nestjs/common";
import type { Message } from "@prisma/client";
import { ChatService } from "./chat.service";
import { PrismaService } from "../prisma/prisma.service";

describe("ChatService", () => {
  const messageClient = {
    create: jest.fn(),
    findMany: jest.fn(),
  };
  const prismaMock = {
    message: messageClient,
  } as unknown as PrismaService;

  let service: ChatService;

  beforeEach(() => {
    jest.clearAllMocks();
    messageClient.create.mockResolvedValue({ id: 1 });
    service = new ChatService(prismaMock);
  });

  it("creates messages with connected relations", async () => {
    const payload = {
      id: 0,
      text: "hello",
      roomId: 2,
      room: null as any,
      userId: 3,
      user: null as any,
      created_at: new Date(),
    } as Message;

    await service.createMessage(payload);

    expect(messageClient.create).toHaveBeenCalledWith({
      data: {
        text: payload.text,
        room: { connect: { id: payload.roomId } },
        user: { connect: { id: payload.userId } },
      },
    });
  });

  it("returns all messages", async () => {
    const expected = [{ id: 1 }] as Message[];
    messageClient.findMany.mockResolvedValue(expected);

    await expect(service.getMessages()).resolves.toEqual(expected);
    expect(messageClient.findMany).toHaveBeenCalledWith({});
  });

  it("throws when getMessages finds nothing", async () => {
    messageClient.findMany.mockResolvedValue(null);

    await expect(service.getMessages()).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("filters room messages by room and blockers", async () => {
    const result = [{ id: 5 }];
    messageClient.findMany.mockResolvedValue(result);

    await expect(service.getRoomMessages(42, 7)).resolves.toEqual(result);

    expect(messageClient.findMany).toHaveBeenCalledWith({
      where: {
        roomId: 7,
        user: {
          blocked: {
            every: {
              id: { not: 42 },
            },
          },
        },
      },
      include: { user: true },
    });
  });
});
