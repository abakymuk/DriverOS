import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContainerType, ContainerStatus, HoldReason } from '@prisma/client';

export class CreateContainerHoldDto {
  @ApiProperty({ description: 'Hold reason', enum: HoldReason })
  @IsEnum(HoldReason)
  reason: HoldReason;

  @ApiPropertyOptional({ description: 'Hold description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateContainerDto {
  @ApiProperty({ description: 'Container number' })
  @IsString()
  cntrNo: string;

  @ApiProperty({ description: 'Container type', enum: ContainerType })
  @IsEnum(ContainerType)
  type: ContainerType;

  @ApiProperty({ description: 'Shipping line' })
  @IsString()
  line: string;

  @ApiPropertyOptional({ description: 'Ready time' })
  @IsOptional()
  @IsDateString()
  readyAt?: string;

  @ApiPropertyOptional({ description: 'Hold status' })
  @IsOptional()
  @IsBoolean()
  hold?: boolean;

  @ApiProperty({ description: 'Container status', enum: ContainerStatus })
  @IsEnum(ContainerStatus)
  status: ContainerStatus;

  @ApiProperty({ description: 'Terminal ID' })
  @IsString()
  terminalId: string;

  @ApiPropertyOptional({ description: 'Vessel ID' })
  @IsOptional()
  @IsString()
  vesselId?: string;

  @ApiPropertyOptional({ description: 'Container holds' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateContainerHoldDto)
  holds?: CreateContainerHoldDto[];
}
