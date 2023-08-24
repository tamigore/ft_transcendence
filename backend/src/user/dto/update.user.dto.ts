import { IsNotEmpty, IsString } from "class-validator";

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  cmd: string;

  @IsNotEmpty()
  @IsString()
  value: string;
}
