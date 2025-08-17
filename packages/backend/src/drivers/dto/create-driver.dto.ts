import { IsString, IsOptional, IsEnum, IsDateString, ValidateNested, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DriverStatus, AvailabilityStatus } from '@prisma/client';

export class CreateDriverAvailabilityDto {
  @ApiProperty({ description: 'Availability date' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Start time' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End time' })
  @IsString()
  endTime: string;

  @ApiProperty({ description: 'Availability status', enum: AvailabilityStatus })
  @IsEnum(AvailabilityStatus)
  status: AvailabilityStatus;
}

export class CreateDriverMetricsDto {
  @ApiPropertyOptional({ description: 'Total trips' })
  @IsOptional()
  @IsNumber()
  totalTrips?: number;

  @ApiPropertyOptional({ description: 'Completed trips' })
  @IsOptional()
  @IsNumber()
  completedTrips?: number;

  @ApiPropertyOptional({ description: 'Failed trips' })
  @IsOptional()
  @IsNumber()
  failedTrips?: number;

  @ApiPropertyOptional({ description: 'Average turn time in minutes' })
  @IsOptional()
  @IsNumber()
  averageTurnTime?: number;

  @ApiPropertyOptional({ description: 'Total distance in km' })
  @IsOptional()
  @IsNumber()
  totalDistance?: number;

  @ApiPropertyOptional({ description: 'Driver rating' })
  @IsOptional()
  @IsNumber()
  rating?: number;
}

export class CreateDriverDto {
  @ApiProperty({ description: 'Driver name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'Driver status', enum: DriverStatus })
  @IsEnum(DriverStatus)
  status: DriverStatus;

  @ApiProperty({ description: 'License number' })
  @IsString()
  licenseNumber: string;

  @ApiProperty({ description: 'License expiry date' })
  @IsDateString()
  licenseExpiry: string;

  @ApiProperty({ description: 'Carrier ID' })
  @IsString()
  carrierId: string;

  @ApiPropertyOptional({ description: 'Driver availability' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDriverAvailabilityDto)
  availability?: CreateDriverAvailabilityDto[];

  @ApiPropertyOptional({ description: 'Driver metrics' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDriverMetricsDto)
  metrics?: CreateDriverMetricsDto;
}
