import { ForbiddenException } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";

describe("ChatController", () => {
  const getUserMessages = jest.fn();

  const controller = new ChatController({
    getRoomMessages: jest.fn(),
    getUserMessages,
    getMessages: jest.fn(),
  } as unknown as ChatService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows users to fetch their own messages", async () => {
    const expected = [{ id: 1 }];
    getUserMessages.mockResolvedValue(expected);

    await expect(controller.getUserMessages(3, 3)).resolves.toBe(expected);
    expect(getUserMessages).toHaveBeenCalledWith(3);
  });

  it("rejects attempts to fetch another user's messages", async () => {
    await expect(controller.getUserMessages(3, 4)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(getUserMessages).not.toHaveBeenCalled();
  });
});
