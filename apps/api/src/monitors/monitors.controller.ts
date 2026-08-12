import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthenticatedUser } from "../auth/jwt.strategy";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateMonitorDto } from "./dto/create-monitor.dto";
import { ListMonitorsQueryDto } from "./dto/list-monitors-query.dto";
import { UpdateMonitorDto } from "./dto/update-monitor.dto";
import { MonitorsService } from "./monitors.service";

@Controller("monitors")
@UseGuards(JwtAuthGuard)
export class MonitorsController {
  constructor(private readonly monitorsService: MonitorsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListMonitorsQueryDto,
  ) {
    return this.monitorsService.findAll(user.id, query);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() data: CreateMonitorDto,
  ) {
    return this.monitorsService.create(user.id, data);
  }

  @Get(":id")
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.monitorsService.findOne(user.id, id);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() data: UpdateMonitorDto,
  ) {
    return this.monitorsService.update(user.id, id, data);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ): Promise<void> {
    await this.monitorsService.remove(user.id, id);
  }

  @Get(":id/ping-results")
  @UseGuards(JwtAuthGuard)
  getPingResults(
    @CurrentUser() user: { id: string },
    @Param("id") id: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.monitorsService.getPingResults(user.id, id, from, to);
  }
}
