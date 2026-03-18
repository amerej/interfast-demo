import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsIn(['todo', 'doing', 'done'])
  status?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
