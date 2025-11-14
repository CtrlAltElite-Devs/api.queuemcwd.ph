import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Put } from "@nestjs/common";
import { MonthDay } from "src/entities/monthDay.entity";
import { UseAdminOnlyGuard, UseMonthDayGuard } from "src/security/decorators/index.decorators";
import { CurrentAdmin } from "src/security/decorators/queried-entity-decorators/current-admin.decorator";
import { MonthDayEntity } from "src/security/decorators/queried-entity-decorators/month-day-entity.decorator";
import { AdminDto } from "../admin/dto/admin.dto";
import { BatchUpdateMonthDaySlotsDto } from "./dtos/batch-update/batch-update-month-day-slots.dto";
import { MonthDayDto } from "./dtos/month-day.dto";
import { UpdateMonthDayDto } from "./dtos/update-month-day.dto";
import { MonthDayService } from "./month-day.service";

@Controller("month-day")
export class MonthDayController {
    constructor(private readonly service: MonthDayService) {}

    @Get("/:monthDayId")
    @UseMonthDayGuard()
    get(@MonthDayEntity() monthDay: MonthDay) {
        return MonthDayDto.Map(monthDay);
    }

    @Patch("/:monthDayId")
    @UseMonthDayGuard()
    async update(@MonthDayEntity() monthDay: MonthDay, @Body() body: UpdateMonthDayDto) {
        return await this.service.UpdateMonthDay(monthDay, body);
    }

    @Put("/:monthDayId/slots")
    @UseMonthDayGuard()
    async editSlots(
        @MonthDayEntity() monthDay: MonthDay,
        @Body() body: BatchUpdateMonthDaySlotsDto,
    ) {
        return await this.service.EditSlotsForMonthDay(monthDay, body);
    }

    @Get("/:monthDayId/slots")
    @UseMonthDayGuard()
    async getSlots(@MonthDayEntity() monthDay: MonthDay) {
        return await this.service.GetSlotsForMonthday(monthDay);
    }

    @Get("/:monthDayId/appointments")
    @UseAdminOnlyGuard()
    async getAppointmentsFromMonthDay(
        @Param("monthDayId", new ParseUUIDPipe()) monthDayId: string,
        @CurrentAdmin() admin: AdminDto,
    ) {
        return await this.service.GetAppointmentsFromMonthday(admin, monthDayId);
    }
}
