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
import { DriversService } from './drivers.service';
import { CreateDriverDto, UpdateDriverDto } from './dto';

@ApiTags('drivers')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new driver' })
  @ApiResponse({ status: 201, description: 'Driver created successfully' })
  @ApiResponse({ status: 409, description: 'License number already exists' })
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drivers' })
  @ApiResponse({ status: 200, description: 'List of drivers' })
  findAll() {
    return this.driversService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available drivers' })
  @ApiResponse({ status: 200, description: 'List of available drivers' })
  findAvailable() {
    return this.driversService.findAvailable();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active drivers' })
  @ApiResponse({ status: 200, description: 'List of active drivers' })
  findActive() {
    return this.driversService.findActive();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get driver statistics' })
  @ApiResponse({ status: 200, description: 'Driver statistics' })
  getStatistics() {
    return this.driversService.getStatistics();
  }

  @Get('top-performers')
  @ApiOperation({ summary: 'Get top performing drivers' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of drivers to return' })
  @ApiResponse({ status: 200, description: 'List of top performing drivers' })
  getTopPerformers(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.driversService.getTopPerformers(limitNum);
  }

  @Get('carrier/:carrierId')
  @ApiOperation({ summary: 'Get drivers by carrier' })
  @ApiParam({ name: 'carrierId', description: 'Carrier ID' })
  @ApiResponse({ status: 200, description: 'List of drivers for carrier' })
  findByCarrier(@Param('carrierId') carrierId: string) {
    return this.driversService.findByCarrier(carrierId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get driver by ID' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiResponse({ status: 200, description: 'Driver found' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update driver' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiResponse({ status: 200, description: 'Driver updated successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  @ApiResponse({ status: 409, description: 'License number already exists' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDriverDto: UpdateDriverDto,
  ) {
    return this.driversService.update(id, updateDriverDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update driver status' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiResponse({ status: 200, description: 'Driver status updated successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.driversService.updateStatus(id, status);
  }

  @Post(':id/availability')
  @ApiOperation({ summary: 'Add availability for driver' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiResponse({ status: 201, description: 'Availability added successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  addAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() availabilityData: {
      date: string;
      startTime: string;
      endTime: string;
      status: string;
    },
  ) {
    return this.driversService.addAvailability(id, availabilityData);
  }

  @Patch(':id/availability/:availabilityId')
  @ApiOperation({ summary: 'Update driver availability' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiParam({ name: 'availabilityId', description: 'Availability ID' })
  @ApiResponse({ status: 200, description: 'Availability updated successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  updateAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('availabilityId', ParseUUIDPipe) availabilityId: string,
    @Body() availabilityData: {
      date?: string;
      startTime?: string;
      endTime?: string;
      status?: string;
    },
  ) {
    return this.driversService.updateAvailability(id, availabilityId, availabilityData);
  }

  @Patch(':id/metrics')
  @ApiOperation({ summary: 'Update driver metrics' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiResponse({ status: 200, description: 'Metrics updated successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  updateMetrics(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() metricsData: {
      totalTrips?: number;
      completedTrips?: number;
      failedTrips?: number;
      averageTurnTime?: number;
      totalDistance?: number;
      rating?: number;
    },
  ) {
    return this.driversService.updateMetrics(id, metricsData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete driver (soft delete)' })
  @ApiParam({ name: 'id', description: 'Driver ID' })
  @ApiResponse({ status: 200, description: 'Driver deleted successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.remove(id);
  }
}
