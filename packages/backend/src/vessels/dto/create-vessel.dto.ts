import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VesselStatus, ScheduleStatus } from '@prisma/client';

export class CreateVesselScheduleDto {
  @ApiProperty({ description: 'Terminal ID' })
  @IsString()
  terminalId!: string;

  @ApiProperty({ description: 'Estimated time of arrival' })
  @IsDateString()
  eta!: string;

  @ApiProperty({ description: 'Estimated time of departure' })
  @IsDateString()
  etd!: string;

  @ApiPropertyOptional({ description: 'Actual arrival time' })
  @IsOptional()
  @IsDateString()
  actualArrival?: string;

  @ApiPropertyOptional({ description: 'Actual departure time' })
  @IsOptional()
  @IsDateString()
  actualDeparture?: string;

  @ApiProperty({ description: 'Schedule status', enum: ScheduleStatus })
  @IsEnum(ScheduleStatus)
  status!: ScheduleStatus;
}

export class CreateVesselDto {
  @ApiProperty({ description: 'Vessel name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Estimated time of arrival' })
  @IsDateString()
  eta!: string;

  @ApiProperty({ description: 'Terminal ID' })
  @IsString()
  terminalId!: string;

  @ApiProperty({ description: 'Vessel status', enum: VesselStatus })
  @IsEnum(VesselStatus)
  status!: VesselStatus;

  @ApiProperty({ description: 'Number of containers' })
  @IsNumber()
  containerCount!: number;

  @ApiPropertyOptional({ description: 'Vessel schedules' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVesselScheduleDto)
  schedules?: CreateVesselScheduleDto[];
}
