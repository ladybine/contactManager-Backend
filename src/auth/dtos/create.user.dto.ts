import { IsEmail, IsNotEmpty, Min } from 'class-validator';

export class UserCreateDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Min(6)
  password: string;
}
