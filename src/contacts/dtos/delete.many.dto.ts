import { IsArray, IsDefined } from 'class-validator';

export class DeleteManyDto {
  @IsArray()
  @IsDefined()
  ids: string[];
}
