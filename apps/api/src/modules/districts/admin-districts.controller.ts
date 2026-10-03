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
import { DistrictsService } from './districts.service';
import {
  AdminDistrictDto,
  CreateDistrictDto,
  ListDistrictsAdminQueryDto,
  UpdateDistrictDto,
} from './dto/district.dto';

@ApiTags('admin: districts')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'FORBIDDEN: requires the ADMIN role' })
@Roles('ADMIN')
@Controller('admin/districts')
export class AdminDistrictsController {
  constructor(private readonly districts: DistrictsService) {}

  @Get()
  @ApiOperation({ summary: 'Districts with every translation, optionally of one city' })
  @ApiPaginatedResponse(AdminDistrictDto)
  list(@Query() query: ListDistrictsAdminQueryDto): Promise<Paginated<AdminDistrictDto>> {
    return this.districts.listAdmin(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: AdminDistrictDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AdminDistrictDto> {
    return this.districts.findByIdAdmin(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a district in a city (the "en" translation is required)' })
  @ApiCreatedResponse({ type: AdminDistrictDto })
  @ApiConflictResponse({ description: 'CONFLICT: slug already used in this city' })
  create(@Body() dto: CreateDistrictDto): Promise<AdminDistrictDto> {
    return this.districts.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update fields and/or translations; locales not sent are kept' })
  @ApiOkResponse({ type: AdminDistrictDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDistrictDto,
  ): Promise<AdminDistrictDto> {
    return this.districts.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiConflictResponse({ description: 'CONFLICT: places or accommodations still reference it' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.districts.delete(id);
  }
}
