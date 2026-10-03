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
  ApiTags,
} from '@nestjs/swagger';
import type { Paginated } from '@korea-project/shared';
import { Roles } from '../../common/decorators';
import { ApiPaginatedResponse } from '../../common/dto/api-paginated-response.decorator';
import { AccommodationsService } from './accommodations.service';
import {
  AdminAccommodationDto,
  CreateAccommodationDto,
  ListAccommodationsAdminQueryDto,
  UpdateAccommodationDto,
} from './dto/accommodation.dto';

@ApiTags('admin: accommodations')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'FORBIDDEN: requires the ADMIN role' })
@Roles('ADMIN')
@Controller('admin/accommodations')
export class AdminAccommodationsController {
  constructor(private readonly accommodations: AccommodationsService) {}

  @Get()
  @ApiPaginatedResponse(AdminAccommodationDto)
  list(@Query() query: ListAccommodationsAdminQueryDto): Promise<Paginated<AdminAccommodationDto>> {
    return this.accommodations.listAdmin(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: AdminAccommodationDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AdminAccommodationDto> {
    return this.accommodations.findByIdAdmin(id);
  }

  @Post()
  @ApiCreatedResponse({ type: AdminAccommodationDto })
  @ApiConflictResponse({ description: 'CONFLICT: slug already in use' })
  create(@Body() dto: CreateAccommodationDto): Promise<AdminAccommodationDto> {
    return this.accommodations.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: AdminAccommodationDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccommodationDto,
  ): Promise<AdminAccommodationDto> {
    return this.accommodations.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.accommodations.delete(id);
  }
}
