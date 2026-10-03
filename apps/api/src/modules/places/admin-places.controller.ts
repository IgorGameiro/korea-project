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
import { ApiPaginatedResponse } from '../../common/dto/api-paginated-response.decorator';
import { ListPlacesAdminQueryDto } from './dto/list-places.query';
import { CreatePlaceDto, UpdatePlaceDto } from './dto/place-input.dto';
import { AdminPlaceDto } from './dto/place.response';
import { PlacesService } from './places.service';

@ApiTags('admin: places')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'FORBIDDEN: requires the ADMIN role' })
@Roles('ADMIN')
@Controller('admin/places')
export class AdminPlacesController {
  constructor(private readonly places: PlacesService) {}

  @Get()
  @ApiOperation({ summary: 'Places with every translation, optionally filtered' })
  @ApiPaginatedResponse(AdminPlaceDto)
  list(@Query() query: ListPlacesAdminQueryDto): Promise<Paginated<AdminPlaceDto>> {
    return this.places.listAdmin(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: AdminPlaceDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AdminPlaceDto> {
    return this.places.findByIdAdmin(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a place (the "en" translation is required)' })
  @ApiCreatedResponse({ type: AdminPlaceDto })
  @ApiConflictResponse({ description: 'CONFLICT: slug already in use' })
  create(@Body() dto: CreatePlaceDto): Promise<AdminPlaceDto> {
    return this.places.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update fields and/or translations; locales not sent are kept' })
  @ApiOkResponse({ type: AdminPlaceDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlaceDto,
  ): Promise<AdminPlaceDto> {
    return this.places.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a place without reviews (its favorites are removed too)' })
  @ApiNoContentResponse()
  @ApiConflictResponse({ description: 'CONFLICT: the place has reviews' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.places.delete(id);
  }
}
