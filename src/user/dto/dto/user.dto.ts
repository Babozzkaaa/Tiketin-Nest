import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @Matches(/^[0-9+\-\s]+$/, { message: 'Invalid phone number format' })
  phone_number: string;

  @IsEnum(Role)
  role?: Role;
}
