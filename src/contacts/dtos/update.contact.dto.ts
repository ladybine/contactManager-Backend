import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class updateContactDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsDefined()
  value: never;

  @IsString()
  @IsNotEmpty()
  id: string;
}
