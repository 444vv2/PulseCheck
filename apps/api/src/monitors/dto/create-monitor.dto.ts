import { Type } from 'class-transformer';
import { IsInt, IsUrl, Min } from 'class-validator';

export class CreateMonitorDto {
  @IsUrl({ require_tld: false, require_protocol: true })
  url!: string;

  @Type(() => Number)
  @IsInt()
  @Min(60)
  intervalSec!: number;
}
