import { IsNotEmpty, IsString } from "class-validator";

export class ModifySelfDto {
  @IsNotEmpty()
  @IsString()
  userId: number;

  @IsNotEmpty()
  @IsString()
  roomId: number;
}

export class ModifyPwdDto {
  @IsNotEmpty()
  @IsString()
  userId: number;

  @IsNotEmpty()
  @IsString()
  roomId: number;

  @IsString()
  pwd: string;
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
