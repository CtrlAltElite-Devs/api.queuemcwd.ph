import { Controller, Get, Query } from "@nestjs/common";
import { UseBranchGuard } from "src/security/decorators/index.decorators";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsAverageLeadTimeParams } from "./resource-parameters/analytics-average-lead-time-params";
import { AnalyticsStatusBreakdownParams } from "./resource-parameters/analytics-breakdown-params";
import { AnalyticsMultiSeriesStatusesParams } from "./resource-parameters/analytics-muli-series-statuses-param";
import { AnalyticsOverviewParams } from "./resource-parameters/analytics-overview-params";
import { AnalyticsStatusTrendParams } from "./resource-parameters/analytics-status-trend-params";
import { AnalyticsTimelineParams } from "./resource-parameters/analytics-timeline-params";
import { AnalyticsTopUsersParams } from "./resource-parameters/analytics-top-users.paramts";
import { AnalyticsPeakHoursParams } from "./resource-parameters/analytisc-peak-hours-params";

@UseBranchGuard()
@Controller("analytics")
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get("overview")
    async getOverview(@Query() params: AnalyticsOverviewParams) {
        return await this.analyticsService.getOverviewAnalytics(params);
    }

    @Get("timeline")
    async getTimeline(@Query() params: AnalyticsTimelineParams) {
        return await this.analyticsService.getTimelineAnalytics(params);
    }

    @Get("status-breakdown")
    async getStatusBreakdownAnalytics(@Query() params: AnalyticsStatusBreakdownParams) {
        return await this.analyticsService.getStatusBreakdownAnalytics(params);
    }

    @Get("appointment-type-breakdown")
    async getAppointmentTypeBreakdownAnalytics(@Query() params: AnalyticsStatusBreakdownParams) {
        return await this.analyticsService.getAppointmentTypeBreakdownAnalytics(params);
    }

    @Get("peak-hours")
    async getPeakHoursAnalytics(@Query() params: AnalyticsPeakHoursParams) {
        return await this.analyticsService.GetPeakHoursAnalytics(params);
    }

    @Get("status-trend")
    async GetStatusTrendAnalytics(@Query() params: AnalyticsStatusTrendParams) {
        return await this.analyticsService.GetStatusTrendAnalytics(params);
    }

    @Get("top-users")
    async GetTopUsersAnalytics(@Query() params: AnalyticsTopUsersParams) {
        return await this.analyticsService.GetTopUsersAnalytics(params);
    }

    @Get("average-lead-time")
    async GetAverageLeadTimeAnalytics(@Query() params: AnalyticsAverageLeadTimeParams) {
        return await this.analyticsService.GetAverageLeadTimeAnalytics(params);
    }

    @Get("multi-series-statuses")
    async GetMultiSeriesStatusesAnalytics(@Query() params: AnalyticsMultiSeriesStatusesParams) {
        return await this.analyticsService.GetMultiSeriesStatusesAnalytics(params);
    }
}
