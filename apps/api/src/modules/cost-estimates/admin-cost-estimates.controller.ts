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
import { CostEstimatesService } from './cost-estimates.service';
import {
  CostEstimateDto,
  CreateCostEstimateDto,
  ListCostEstimatesAdminQueryDto,
  UpdateCostEstimateDto,
} from './dto/cost-estimate.dto';

@ApiTags('admin: cost-estimates')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'FORBIDDEN: requires the ADMIN role' })
@Roles('ADMIN')
@Controller('admin/cost-estimates')
export class AdminCostEstimatesController {
  constructor(private readonly costs: CostEstimatesService) {}

  @Get()
  @ApiPaginatedResponse(CostEstimateDto)
  list(@Query() query: ListCostEstimatesAdminQueryDto): Promise<Paginated<CostEstimateDto>> {
    return this.costs.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: CostEstimateDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CostEstimateDto> {
    return this.costs.findById(id);
  }

  @Post()
  @ApiCreatedResponse({ type: CostEstimateDto })
  @ApiConflictResponse({ description: 'CONFLICT: this city already has an estimate for the tier' })
  create(@Body() dto: CreateCostEstimateDto): Promise<CostEstimateDto> {
    return this.costs.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: CostEstimateDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCostEstimateDto,
  ): Promise<CostEstimateDto> {
    return this.costs.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.costs.delete(id);
  }
}
