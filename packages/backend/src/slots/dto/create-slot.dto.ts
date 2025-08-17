import { IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SlotStatus } from '@prisma/client';

export class CreateSlotDto {
  @ApiProperty({ description: 'Terminal ID' })
  @IsString()
  terminalId: string;

  @ApiProperty({ description: 'Window start time' })
  @IsDateString()
  windowStart: string;

  @ApiProperty({ description: 'Window end time' })
  @IsDateString()
  windowEnd: string;

  @ApiProperty({ description: 'Slot capacity' })
  @IsNumber()
  capacity: number;

  @ApiProperty({ description: 'Number of booked slots' })
  @IsNumber()
  booked: number;

  @ApiProperty({ description: 'Slot status', enum: SlotStatus })
  @IsEnum(SlotStatus)
  status: SlotStatus;
}
