import { IsInt, IsPositive, IsString, MaxLength } from "class-validator";

export class CreateHistoricDto {
  @IsInt()
  @IsPositive()
  winnerId: number;

  @IsInt()
  @IsPositive()
  looserId: number;

  @IsString()
  @MaxLength(32)
  score: string;

  @IsInt()
  @IsPositive()
  gameId: number;
}
