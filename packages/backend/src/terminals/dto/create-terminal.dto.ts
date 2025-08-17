import { IsString, IsNumber, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TerminalStatus } from '@prisma/client';

export class CreateTerminalSettingsDto {
  @ApiProperty({ description: 'Slot duration in minutes' })
  @IsNumber()
  slotDuration: number;

  @ApiProperty({ description: 'Maximum slots per window' })
  @IsNumber()
  maxSlotsPerWindow: number;

  @ApiProperty({ description: 'Operating hours configuration' })
  operatingHours: Record<string, any>;

  @ApiPropertyOptional({ description: 'Closed days array' })
  @IsOptional()
  @IsString({ each: true })
  closedDays?: string[];

  @ApiPropertyOptional({ description: 'Special rules configuration' })
  @IsOptional()
  specialRules?: Record<string, any>;
}

export class CreateTerminalDto {
  @ApiProperty({ description: 'Terminal name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Terminal code' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Terminal capacity' })
  @IsNumber()
  capacity: number;

  @ApiProperty({ description: 'Terminal timezone' })
  @IsString()
  timezone: string;

  @ApiProperty({ description: 'Terminal status', enum: TerminalStatus })
  @IsEnum(TerminalStatus)
  status: TerminalStatus;

  @ApiPropertyOptional({ description: 'Terminal settings' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTerminalSettingsDto)
  settings?: CreateTerminalSettingsDto;
}
