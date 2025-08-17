import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto, UpdateTripDto } from './dto';

@ApiTags('trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trip' })
  @ApiResponse({ status: 201, description: 'Trip created successfully' })
  @ApiResponse({ status: 404, description: 'Driver, container, or slot not found' })
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(createTripDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trips' })
  @ApiResponse({ status: 200, description: 'List of trips' })
  findAll() {
    return this.tripsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active trips' })
  @ApiResponse({ status: 200, description: 'List of active trips' })
  findActive() {
    return this.tripsService.findActive();
  }

  @Get('completed')
  @ApiOperation({ summary: 'Get completed trips' })
  @ApiResponse({ status: 200, description: 'List of completed trips' })
  findCompleted() {
    return this.tripsService.findCompleted();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get trip statistics' })
  @ApiResponse({ status: 200, description: 'Trip statistics' })
  getStatistics() {
    return this.tripsService.getStatistics();
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Get trips by driver' })
  @ApiParam({ name: 'driverId', description: 'Driver ID' })
  @ApiResponse({ status: 200, description: 'List of trips for driver' })
  findByDriver(@Param('driverId', ParseUUIDPipe) driverId: string) {
    return this.tripsService.findByDriver(driverId);
  }

  @Get('driver/:driverId/performance')
  @ApiOperation({ summary: 'Get driver performance' })
  @ApiParam({ name: 'driverId', description: 'Driver ID' })
  @ApiResponse({ status: 200, description: 'Driver performance metrics' })
  getDriverPerformance(@Param('driverId', ParseUUIDPipe) driverId: string) {
    return this.tripsService.getDriverPerformance(driverId);
  }

  @Get('container/:containerId')
  @ApiOperation({ summary: 'Get trips by container' })
  @ApiParam({ name: 'containerId', description: 'Container ID' })
  @ApiResponse({ status: 200, description: 'List of trips for container' })
  findByContainer(@Param('containerId', ParseUUIDPipe) containerId: string) {
    return this.tripsService.findByContainer(containerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trip by ID' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: 200, description: 'Trip found' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.findOne(id);
  }

  @Get(':id/turn-time')
  @ApiOperation({ summary: 'Calculate trip turn time' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: 200, description: 'Turn time in minutes' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  calculateTurnTime(@Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.calculateTurnTime(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update trip' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: 200, description: 'Trip updated successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    return this.tripsService.update(id, updateTripDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update trip status' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: 200, description: 'Trip status updated successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.tripsService.updateStatus(id, status);
  }

  @Post(':id/event')
  @ApiOperation({ summary: 'Add event to trip' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: 201, description: 'Event added successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  addEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() eventData: {
      type: string;
      timestamp?: string;
      location?: any;
      metadata?: any;
    },
  ) {
    return this.tripsService.addEvent(id, eventData);
  }

  @Patch(':id/metrics')
  @ApiOperation({ summary: 'Update trip metrics' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: 200, description: 'Metrics updated successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  updateMetrics(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() metricsData: {
      totalDistance?: number;
      estimatedDuration?: number;
      actualDuration?: number;
      fuelConsumption?: number;
      carbonFootprint?: number;
    },
  ) {
    return this.tripsService.updateMetrics(id, metricsData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete trip (soft delete)' })
  @ApiParam({ name: 'id', description: 'Trip ID' })
  @ApiResponse({ status: 200, description: 'Trip deleted successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.remove(id);
  }
}
