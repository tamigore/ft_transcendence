import { IsNotEmpty, IsString } from "class-validator";

export class ModifySelfDto {
  @IsNotEmpty()
  @IsString()
  userId: number;

  @IsNotEmpty()
  @IsString()
  roomId: number;
}

export class ModifyOtherDto {
  @IsNotEmpty()
  @IsString()
  userId: number;

  @IsNotEmpty()
  @IsString()
  otherId: number;

  @IsNotEmpty()
  @IsString()
  roomId: number;
}
