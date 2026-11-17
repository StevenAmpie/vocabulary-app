import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class RecordAttemptDto {
  @IsUUID()
  exerciseId: string;

  @IsUUID()
  selectedOptionId: string;

  @IsInt()
  @Min(0)
  @Max(3_600_000)
  responseTimeMs: number;
}
