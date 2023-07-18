import { IsNotEmpty, IsString } from "class-validator";

export class ModifyUserDto {
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
