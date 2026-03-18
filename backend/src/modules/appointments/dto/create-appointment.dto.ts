import { IsString, IsOptional, IsBoolean, IsISO8601 } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsISO8601()
  startDate!: string;

  @IsISO8601()
  endDate!: string;

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsString()
  clientId!: string;
}
