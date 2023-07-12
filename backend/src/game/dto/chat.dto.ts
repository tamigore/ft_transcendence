import { IsNotEmpty, IsString } from "class-validator";

export class ChatDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsString()
  object: string;

  @IsNotEmpty()
  @IsString()
  text: string;
}
