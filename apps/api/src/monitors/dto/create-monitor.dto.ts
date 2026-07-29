import { Type } from 'class-transformer';
import { IsInt, IsUrl, Min } from 'class-validator';

export class CreateMonitorDto {
  @IsUrl({ require_tld: false })
  url!: string;

  @Type(() => Number)
  @IsInt()
  @Min(60)
  intervalSec!: number;
}
