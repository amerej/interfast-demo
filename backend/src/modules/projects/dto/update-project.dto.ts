import { IsString, IsOptional, IsIn, IsISO8601 } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['planning', 'in_progress', 'completed'])
  status?: string;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  estimatedEndDate?: string;
}
