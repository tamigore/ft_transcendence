import { IsNotEmpty, IsString } from "class-validator";

export class AddDelUserDto {
  @IsNotEmpty()
  @IsString()
  userId: number;

  @IsNotEmpty()
  @IsString()
  roomId: number;
}

export class RemmoveUserDto {
  @IsNotEmpty()
  @IsString()
  userID: string;

  @IsNotEmpty()
  @IsString()
  roomId: string;
}
