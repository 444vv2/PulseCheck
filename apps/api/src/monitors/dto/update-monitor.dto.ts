import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsUrl } from 'class-validator';

export class UpdateMonitorDto {
  @IsOptional()
  @IsUrl({ require_tld: false })
  url?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  intervalSec?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

