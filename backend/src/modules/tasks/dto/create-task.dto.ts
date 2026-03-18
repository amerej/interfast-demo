import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  projectId!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsIn(['todo', 'doing', 'done'])
  status?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
