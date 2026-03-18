import { IsString } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  projectId!: string;

  @IsString()
  message!: string;
}
