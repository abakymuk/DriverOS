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
import { VesselsService } from './vessels.service';
import { CreateVesselDto, UpdateVesselDto } from './dto';

@ApiTags('vessels')
@Controller('vessels')
export class VesselsController {
  constructor(private readonly vesselsService: VesselsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vessel' })
  @ApiResponse({ status: 201, description: 'Vessel created successfully' })
  @ApiResponse({ status: 404, description: 'Terminal not found' })
  create(@Body() createVesselDto: CreateVesselDto) {
    return this.vesselsService.create(createVesselDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vessels' })
  @ApiResponse({ status: 200, description: 'List of vessels' })
  findAll() {
    return this.vesselsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active vessels' })
  @ApiResponse({ status: 200, description: 'List of active vessels' })
  findActive() {
    return this.vesselsService.findActive();
  }

  @Get('terminal/:terminalId')
  @ApiOperation({ summary: 'Get vessels by terminal' })
  @ApiParam({ name: 'terminalId', description: 'Terminal ID' })
  @ApiResponse({ status: 200, description: 'List of vessels for terminal' })
  findByTerminal(@Param('terminalId', ParseUUIDPipe) terminalId: string) {
    return this.vesselsService.findByTerminal(terminalId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vessel by ID' })
  @ApiParam({ name: 'id', description: 'Vessel ID' })
  @ApiResponse({ status: 200, description: 'Vessel found' })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vesselsService.findOne(id);
  }

  @Get(':id/containers')
  @ApiOperation({ summary: 'Get vessel container count' })
  @ApiParam({ name: 'id', description: 'Vessel ID' })
  @ApiResponse({ status: 200, description: 'Container count information' })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  getContainerCount(@Param('id', ParseUUIDPipe) id: string) {
    return this.vesselsService.getContainerCount(id);
  }

  @Get(':id/schedule')
  @ApiOperation({ summary: 'Get vessel schedule' })
  @ApiParam({ name: 'id', description: 'Vessel ID' })
  @ApiResponse({ status: 200, description: 'Vessel schedule' })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  getSchedule(@Param('id', ParseUUIDPipe) id: string) {
    return this.vesselsService.getSchedule(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update vessel' })
  @ApiParam({ name: 'id', description: 'Vessel ID' })
  @ApiResponse({ status: 200, description: 'Vessel updated successfully' })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVesselDto: UpdateVesselDto,
  ) {
    return this.vesselsService.update(id, updateVesselDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update vessel status' })
  @ApiParam({ name: 'id', description: 'Vessel ID' })
  @ApiResponse({ status: 200, description: 'Vessel status updated successfully' })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.vesselsService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete vessel (soft delete)' })
  @ApiParam({ name: 'id', description: 'Vessel ID' })
  @ApiResponse({ status: 200, description: 'Vessel deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vessel not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.vesselsService.remove(id);
  }
}
