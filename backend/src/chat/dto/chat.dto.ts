import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from "class-validator";

export class SendMessageDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  roomId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text!: string;
}
