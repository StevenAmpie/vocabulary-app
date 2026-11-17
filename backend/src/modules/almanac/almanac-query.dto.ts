import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { WordState } from '@prisma/client';

export class AlmanacQueryDto {
  @IsOptional()
  @IsEnum(WordState)
  state?: WordState;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(48)
  limit = 24;
}
