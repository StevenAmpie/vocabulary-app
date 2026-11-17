import { IsInt, IsOptional, IsString, IsUUID, Max, Min, MinLength } from 'class-validator';

export class CreateLearningSessionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  categorySlug?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  targetWordCount?: number;

  @IsOptional()
  @IsUUID()
  wordId?: string;
}
