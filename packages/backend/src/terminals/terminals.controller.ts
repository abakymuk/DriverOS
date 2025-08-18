import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { TerminalsService } from './terminals.service';
import { CreateTerminalDto } from './dto/create-terminal.dto';
import { UpdateTerminalDto } from './dto/update-terminal.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { Terminal } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('terminals')
@Controller('terminals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TerminalsController {
  constructor(private readonly terminalsService: TerminalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new terminal' })
  @ApiResponse({ status: 201, description: 'Terminal created successfully' })
  @ApiResponse({ status: 409, description: 'Terminal code already exists' })
  create(@Body() createTerminalDto: CreateTerminalDto) {
    return this.terminalsService.create(createTerminalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all terminals with pagination' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of terminals',
    type: PaginationResponseDto<Terminal>
  })
  findAll(@Query() pagination: PaginationDto) {
    return this.terminalsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get terminal by ID' })
  @ApiParam({ name: 'id', description: 'Terminal ID' })
  @ApiResponse({ status: 200, description: 'Terminal found' })
  @ApiResponse({ status: 404, description: 'Terminal not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.terminalsService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get terminal by code' })
  @ApiParam({ name: 'code', description: 'Terminal code' })
  @ApiResponse({ status: 200, description: 'Terminal found' })
  @ApiResponse({ status: 404, description: 'Terminal not found' })
  findByCode(@Param('code') code: string) {
    return this.terminalsService.findByCode(code);
  }

  @Get(':id/capacity')
  @ApiOperation({ summary: 'Get terminal capacity information' })
  @ApiParam({ name: 'id', description: 'Terminal ID' })
  @ApiResponse({ status: 200, description: 'Capacity information' })
  @ApiResponse({ status: 404, description: 'Terminal not found' })
  getCapacity(@Param('id', ParseUUIDPipe) id: string) {
    return this.terminalsService.getCapacity(id);
  }

  @Get(':id/vessels')
  @ApiOperation({ summary: 'Get active vessels for terminal' })
  @ApiParam({ name: 'id', description: 'Terminal ID' })
  @ApiResponse({ status: 200, description: 'Active vessels' })
  @ApiResponse({ status: 404, description: 'Terminal not found' })
  getActiveVessels(@Param('id', ParseUUIDPipe) id: string) {
    return this.terminalsService.getActiveVessels(id);
  }

  @Get(':id/slots')
  @ApiOperation({ summary: 'Get available slots for terminal' })
  @ApiParam({ name: 'id', description: 'Terminal ID' })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by date' })
  @ApiResponse({ status: 200, description: 'Available slots' })
  @ApiResponse({ status: 404, description: 'Terminal not found' })
  getAvailableSlots(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('date') date?: string,
  ) {
    const parsedDate = date ? new Date(date) : undefined;
    return this.terminalsService.getAvailableSlots(id, parsedDate);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update terminal' })
  @ApiParam({ name: 'id', description: 'Terminal ID' })
  @ApiResponse({ status: 200, description: 'Terminal updated successfully' })
  @ApiResponse({ status: 404, description: 'Terminal not found' })
  @ApiResponse({ status: 409, description: 'Terminal code already exists' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTerminalDto: UpdateTerminalDto,
  ) {
    return this.terminalsService.update(id, updateTerminalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete terminal (soft delete)' })
  @ApiParam({ name: 'id', description: 'Terminal ID' })
  @ApiResponse({ status: 200, description: 'Terminal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Terminal not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.terminalsService.remove(id);
  }
}
