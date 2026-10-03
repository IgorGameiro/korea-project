import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Paginated } from '@korea-project/shared';
import { Roles } from '../../common/decorators';
import { PaginationQueryDto } from '../../common/dto';
import { ApiPaginatedResponse } from '../../common/dto/api-paginated-response.decorator';
import { CitiesService } from './cities.service';
import { CreateCityDto, UpdateCityDto } from './dto/city-input.dto';
import { AdminCityDto } from './dto/city.response';

@ApiTags('admin: cities')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'FORBIDDEN: requires the ADMIN role' })
@Roles('ADMIN')
@Controller('admin/cities')
export class AdminCitiesController {
  constructor(private readonly cities: CitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Cities with every translation' })
  @ApiPaginatedResponse(AdminCityDto)
  list(@Query() query: PaginationQueryDto): Promise<Paginated<AdminCityDto>> {
    return this.cities.listAdmin(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: AdminCityDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AdminCityDto> {
    return this.cities.findByIdAdmin(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a city (the "en" translation is required)' })
  @ApiCreatedResponse({ type: AdminCityDto })
  @ApiConflictResponse({ description: 'CONFLICT: slug already in use' })
  create(@Body() dto: CreateCityDto): Promise<AdminCityDto> {
    return this.cities.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update fields and/or translations; locales not sent are kept' })
  @ApiOkResponse({ type: AdminCityDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCityDto,
  ): Promise<AdminCityDto> {
    return this.cities.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a city without districts, places, accommodations or cost estimates',
  })
  @ApiNoContentResponse()
  @ApiConflictResponse({ description: 'CONFLICT: the city still has related records' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.cities.delete(id);
  }
}
