import { IsString, IsEmail } from 'class-validator';

export class CreateClientDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;
}
