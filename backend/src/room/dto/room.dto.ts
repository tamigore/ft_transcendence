import { Type } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class RoomIdDto {
  @IsInt()
  @Type(() => Number)
  roomId: number;
}

export class RoomPasswordDto extends RoomIdDto {
  @IsOptional()
  @IsString()
  pwd?: string;
}

export class RoomTargetDto extends RoomIdDto {
  @IsInt()
  @Type(() => Number)
  otherId: number;
}

export class CreateRoomDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  hash?: string | null;

  @IsOptional()
  @IsBoolean()
  private?: boolean;
}

export class PrivateRoomDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  otherId?: number;
}
