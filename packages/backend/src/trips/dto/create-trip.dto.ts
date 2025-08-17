import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean, ValidateNested, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TripStatus, TripEventType } from '@prisma/client';

export class CreateTripMetricsDto {
  @ApiPropertyOptional({ description: 'Total distance in km' })
  @IsOptional()
  @IsNumber()
  totalDistance?: number;

  @ApiPropertyOptional({ description: 'Estimated duration in minutes' })
  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;

  @ApiPropertyOptional({ description: 'Actual duration in minutes' })
  @IsOptional()
  @IsNumber()
  actualDuration?: number;

  @ApiPropertyOptional({ description: 'Fuel consumption in liters' })
  @IsOptional()
  @IsNumber()
  fuelConsumption?: number;

  @ApiPropertyOptional({ description: 'Carbon footprint in kg CO2' })
  @IsOptional()
  @IsNumber()
  carbonFootprint?: number;
}

export class CreateTripEventDto {
  @ApiProperty({ description: 'Event type', enum: TripEventType })
  @IsEnum(TripEventType)
  type: TripEventType;

  @ApiPropertyOptional({ description: 'Event timestamp' })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiPropertyOptional({ description: 'Location data' })
  @IsOptional()
  location?: any;

  @ApiPropertyOptional({ description: 'Event metadata' })
  @IsOptional()
  metadata?: any;
}

export class CreateTripDto {
  @ApiProperty({ description: 'Driver ID' })
  @IsString()
  driverId: string;

  @ApiProperty({ description: 'Container ID' })
  @IsString()
  containerId: string;

  @ApiPropertyOptional({ description: 'Pickup slot ID' })
  @IsOptional()
  @IsString()
  pickupSlotId?: string;

  @ApiPropertyOptional({ description: 'Return empty flag' })
  @IsOptional()
  @IsBoolean()
  returnEmpty?: boolean;

  @ApiProperty({ description: 'Trip status', enum: TripStatus })
  @IsEnum(TripStatus)
  status: TripStatus;

  @ApiPropertyOptional({ description: 'Estimated time of arrival' })
  @IsOptional()
  @IsDateString()
  eta?: string;

  @ApiPropertyOptional({ description: 'Trip metrics' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTripMetricsDto)
  metrics?: CreateTripMetricsDto;

  @ApiPropertyOptional({ description: 'Trip events' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTripEventDto)
  events?: CreateTripEventDto[];
}
