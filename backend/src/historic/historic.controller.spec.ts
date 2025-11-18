// @ts-nocheck
import { ForbiddenException } from "@nestjs/common";
import { HistoricController } from "./historic.controller";
import { HistoricService } from "./historic.service";
import { CreateHistoricDto } from "./dto";

describe("HistoricController", () => {
  const getGamesByPlayerId = jest.fn();
  const setGameByGameId = jest.fn();

  const controller = new HistoricController({
    getAllHistoric: jest.fn(),
    getLeaderBoard: jest.fn(),
    getGamesByPlayerId,
    setGameByGameId,
  } as unknown as HistoricService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the authenticated player's history", async () => {
    const expected = [{ id: 1 }];
    getGamesByPlayerId.mockResolvedValue(expected);

    await expect(controller.getPlayerHistoric(7, 7)).resolves.toBe(expected);
    expect(getGamesByPlayerId).toHaveBeenCalledWith(7);
  });

  it("blocks requests for other players", () => {
    expect(() => controller.getPlayerHistoric(7, 8)).toThrow(
      ForbiddenException,
    );
    expect(getGamesByPlayerId).not.toHaveBeenCalled();
  });

  it("persists games when the caller participated", async () => {
    const dto: CreateHistoricDto = {
      winnerId: 5,
      looserId: 6,
      score: "11-7",
      gameId: 42,
    };

    setGameByGameId.mockResolvedValue(undefined);
    await controller.setHistoric(dto, 5);

    expect(setGameByGameId).toHaveBeenCalledWith(dto);
  });

  it("rejects forged game submissions", () => {
    const dto: CreateHistoricDto = {
      winnerId: 5,
      looserId: 6,
      score: "11-7",
      gameId: 42,
    };

    expect(() => controller.setHistoric(dto, 9)).toThrow(ForbiddenException);
    expect(setGameByGameId).not.toHaveBeenCalled();
  });
});
