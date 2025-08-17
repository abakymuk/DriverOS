import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SlotsService } from './slots.service';
import { CreateSlotDto, UpdateSlotDto } from './dto';

@ApiTags('slots')
@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new slot' })
  @ApiResponse({ status: 201, description: 'Slot created successfully' })
  @ApiResponse({ status: 409, description: 'Slot already exists for this time window' })
  @ApiResponse({ status: 404, description: 'Terminal not found' })
  create(@Body() createSlotDto: CreateSlotDto) {
    return this.slotsService.create(createSlotDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all slots' })
  @ApiResponse({ status: 200, description: 'List of slots' })
  findAll() {
    return this.slotsService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available slots' })
  @ApiQuery({ name: 'terminalId', required: false, description: 'Filter by terminal ID' })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by date' })
  @ApiResponse({ status: 200, description: 'List of available slots' })
  findAvailable(
    @Query('terminalId') terminalId?: string,
    @Query('date') date?: string,
  ) {
    const parsedDate = date ? new Date(date) : undefined;
    return this.slotsService.findAvailable(terminalId, parsedDate);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming slots' })
  @ApiQuery({ name: 'terminalId', required: false, description: 'Filter by terminal ID' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to look ahead' })
  @ApiResponse({ status: 200, description: 'List of upcoming slots' })
  findUpcoming(
    @Query('terminalId') terminalId?: string,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days, 10) : 7;
    return this.slotsService.findUpcoming(terminalId, daysNum);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get slot statistics' })
  @ApiQuery({ name: 'terminalId', required: false, description: 'Filter by terminal ID' })
  @ApiResponse({ status: 200, description: 'Slot statistics' })
  getStatistics(@Query('terminalId') terminalId?: string) {
    return this.slotsService.getStatistics(terminalId);
  }

  @Get('terminal/:terminalId')
  @ApiOperation({ summary: 'Get slots by terminal' })
  @ApiParam({ name: 'terminalId', description: 'Terminal ID' })
  @ApiResponse({ status: 200, description: 'List of slots for terminal' })
  findByTerminal(@Param('terminalId', ParseUUIDPipe) terminalId: string) {
    return this.slotsService.findByTerminal(terminalId);
  }

  @Get('terminal/:terminalId/utilization')
  @ApiOperation({ summary: 'Get slot utilization by hour' })
  @ApiParam({ name: 'terminalId', description: 'Terminal ID' })
  @ApiQuery({ name: 'date', required: true, description: 'Date to analyze' })
  @ApiResponse({ status: 200, description: 'Hourly utilization data' })
  getUtilizationByHour(
    @Param('terminalId', ParseUUIDPipe) terminalId: string,
    @Query('date') date: string,
  ) {
    const parsedDate = new Date(date);
    return this.slotsService.getUtilizationByHour(terminalId, parsedDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get slot by ID' })
  @ApiParam({ name: 'id', description: 'Slot ID' })
  @ApiResponse({ status: 200, description: 'Slot found' })
  @ApiResponse({ status: 404, description: 'Slot not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.slotsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update slot' })
  @ApiParam({ name: 'id', description: 'Slot ID' })
  @ApiResponse({ status: 200, description: 'Slot updated successfully' })
  @ApiResponse({ status: 404, description: 'Slot not found' })
  @ApiResponse({ status: 409, description: 'Slot already exists for this time window' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSlotDto: UpdateSlotDto,
  ) {
    return this.slotsService.update(id, updateSlotDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update slot status' })
  @ApiParam({ name: 'id', description: 'Slot ID' })
  @ApiResponse({ status: 200, description: 'Slot status updated successfully' })
  @ApiResponse({ status: 404, description: 'Slot not found' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.slotsService.updateStatus(id, status);
  }

  @Post(':id/book')
  @ApiOperation({ summary: 'Book a slot' })
  @ApiParam({ name: 'id', description: 'Slot ID' })
  @ApiResponse({ status: 201, description: 'Slot booked successfully' })
  @ApiResponse({ status: 404, description: 'Slot, trip, driver, or container not found' })
  @ApiResponse({ status: 409, description: 'Slot not available or at full capacity' })
  bookSlot(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() bookingData: {
      tripId: string;
      driverId: string;
      containerId: string;
    },
  ) {
    return this.slotsService.bookSlot(id, bookingData);
  }

  @Delete(':id/bookings/:bookingId')
  @ApiOperation({ summary: 'Cancel a slot booking' })
  @ApiParam({ name: 'id', description: 'Slot ID' })
  @ApiParam({ name: 'bookingId', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Slot or booking not found' })
  cancelBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ) {
    return this.slotsService.cancelBooking(id, bookingId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete slot (soft delete)' })
  @ApiParam({ name: 'id', description: 'Slot ID' })
  @ApiResponse({ status: 200, description: 'Slot deleted successfully' })
  @ApiResponse({ status: 404, description: 'Slot not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete slot with existing bookings' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.slotsService.remove(id);
  }
}
