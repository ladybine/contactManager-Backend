import {
  IsString,
  IsArray,
  IsEmail,
  IsOptional,
  IsDefined,
  isString,
} from 'class-validator';

export class CreateContactDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  middle_name: string;

  @IsArray()
  emails: string[];

  @IsString()
  country: string;

  @IsString()
  town: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsString()
  adress: string;

  @IsString()
  company: string;

  @IsString()
  groupe: string;

  @IsString()
  status: string;

  @IsString()
  category: string;
  @IsDefined()
  phones: string[] | string;

  @IsString()
  flashApId: string;
}
