import { IsString, IsOptional, IsIn, IsISO8601 } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name!: string;

  @IsString()
  clientId!: string;

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
