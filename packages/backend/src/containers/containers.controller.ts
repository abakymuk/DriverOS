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
import { ContainersService } from './containers.service';
import { CreateContainerDto, UpdateContainerDto } from './dto';

@ApiTags('containers')
@Controller('containers')
export class ContainersController {
  constructor(private readonly containersService: ContainersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new container' })
  @ApiResponse({ status: 201, description: 'Container created successfully' })
  @ApiResponse({ status: 409, description: 'Container number already exists' })
  @ApiResponse({ status: 404, description: 'Terminal or vessel not found' })
  create(@Body() createContainerDto: CreateContainerDto) {
    return this.containersService.create(createContainerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all containers' })
  @ApiResponse({ status: 200, description: 'List of containers' })
  findAll() {
    return this.containersService.findAll();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Get ready containers' })
  @ApiResponse({ status: 200, description: 'List of ready containers' })
  findReady() {
    return this.containersService.findReady();
  }

  @Get('hold')
  @ApiOperation({ summary: 'Get containers on hold' })
  @ApiResponse({ status: 200, description: 'List of containers on hold' })
  findOnHold() {
    return this.containersService.findOnHold();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get container statistics' })
  @ApiResponse({ status: 200, description: 'Container statistics' })
  getStatistics() {
    return this.containersService.getStatistics();
  }

  @Get('terminal/:terminalId')
  @ApiOperation({ summary: 'Get containers by terminal' })
  @ApiParam({ name: 'terminalId', description: 'Terminal ID' })
  @ApiResponse({ status: 200, description: 'List of containers for terminal' })
  findByTerminal(@Param('terminalId', ParseUUIDPipe) terminalId: string) {
    return this.containersService.findByTerminal(terminalId);
  }

  @Get('vessel/:vesselId')
  @ApiOperation({ summary: 'Get containers by vessel' })
  @ApiParam({ name: 'vesselId', description: 'Vessel ID' })
  @ApiResponse({ status: 200, description: 'List of containers for vessel' })
  findByVessel(@Param('vesselId', ParseUUIDPipe) vesselId: string) {
    return this.containersService.findByVessel(vesselId);
  }

  @Get('number/:cntrNo')
  @ApiOperation({ summary: 'Get container by number' })
  @ApiParam({ name: 'cntrNo', description: 'Container number' })
  @ApiResponse({ status: 200, description: 'Container found' })
  @ApiResponse({ status: 404, description: 'Container not found' })
  findByCntrNo(@Param('cntrNo') cntrNo: string) {
    return this.containersService.findByCntrNo(cntrNo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get container by ID' })
  @ApiParam({ name: 'id', description: 'Container ID' })
  @ApiResponse({ status: 200, description: 'Container found' })
  @ApiResponse({ status: 404, description: 'Container not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.containersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update container' })
  @ApiParam({ name: 'id', description: 'Container ID' })
  @ApiResponse({ status: 200, description: 'Container updated successfully' })
  @ApiResponse({ status: 404, description: 'Container not found' })
  @ApiResponse({ status: 409, description: 'Container number already exists' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContainerDto: UpdateContainerDto,
  ) {
    return this.containersService.update(id, updateContainerDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update container status' })
  @ApiParam({ name: 'id', description: 'Container ID' })
  @ApiResponse({ status: 200, description: 'Container status updated successfully' })
  @ApiResponse({ status: 404, description: 'Container not found' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return this.containersService.updateStatus(id, status);
  }

  @Post(':id/hold')
  @ApiOperation({ summary: 'Add hold to container' })
  @ApiParam({ name: 'id', description: 'Container ID' })
  @ApiResponse({ status: 201, description: 'Hold added successfully' })
  @ApiResponse({ status: 404, description: 'Container not found' })
  addHold(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() holdData: { reason: string; description?: string },
  ) {
    return this.containersService.addHold(id, holdData);
  }

  @Patch(':id/hold/:holdId/resolve')
  @ApiOperation({ summary: 'Resolve container hold' })
  @ApiParam({ name: 'id', description: 'Container ID' })
  @ApiParam({ name: 'holdId', description: 'Hold ID' })
  @ApiResponse({ status: 200, description: 'Hold resolved successfully' })
  @ApiResponse({ status: 404, description: 'Container or hold not found' })
  resolveHold(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('holdId', ParseUUIDPipe) holdId: string,
  ) {
    return this.containersService.resolveHold(id, holdId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete container (soft delete)' })
  @ApiParam({ name: 'id', description: 'Container ID' })
  @ApiResponse({ status: 200, description: 'Container deleted successfully' })
  @ApiResponse({ status: 404, description: 'Container not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.containersService.remove(id);
  }
}
