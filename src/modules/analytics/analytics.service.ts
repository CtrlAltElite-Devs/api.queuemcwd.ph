import { Injectable } from "@nestjs/common";
import { AppointmentRepository } from "src/repositories/appointment.repository";
import { AnalyticsAverageLeadTimeParams } from "./resource-parameters/analytics-average-lead-time-params";
import { AnalyticsStatusBreakdownParams } from "./resource-parameters/analytics-breakdown-params";
import { AnalyticsMultiSeriesStatusesParams } from "./resource-parameters/analytics-muli-series-statuses-param";
import { AnalyticsOverviewParams } from "./resource-parameters/analytics-overview-params";
import { AnalyticsStatusTrendParams } from "./resource-parameters/analytics-status-trend-params";
import { AnalyticsTimelineParams } from "./resource-parameters/analytics-timeline-params";
import { AnalyticsTopUsersParams } from "./resource-parameters/analytics-top-users.paramts";
import { AnalyticsPeakHoursParams } from "./resource-parameters/analytisc-peak-hours-params";

@Injectable()
export class AnalyticsService {
    constructor(private readonly appointmentRepository: AppointmentRepository) {}

    async getOverviewAnalytics(params: AnalyticsOverviewParams) {
        return await this.appointmentRepository.getOverview({
            branchId: params.branchId,
            from: params.from,
            to: params.to,
            appointmentType: params.appointmentType?.toLocaleString(),
        });
    }

    async getTimelineAnalytics(params: AnalyticsTimelineParams) {
        return await this.appointmentRepository.getTimeline({
            branchId: params.branchId,
            from: params.from,
            to: params.to,
            days: params.days,
        });
    }

    async getStatusBreakdownAnalytics(params: AnalyticsStatusBreakdownParams) {
        return await this.appointmentRepository.getStatusBreakdown({
            branchId: params.branchId,
            from: params.from,
            to: params.to,
        });
    }

    async getAppointmentTypeBreakdownAnalytics(params: AnalyticsStatusBreakdownParams) {
        return await this.appointmentRepository.getAppointmentTypeBreakdown({
            branchId: params.branchId,
            from: params.from,
            to: params.to,
        });
    }

    async GetPeakHoursAnalytics(params: AnalyticsPeakHoursParams) {
        return await this.appointmentRepository.getPeakHours({
            branchId: params.branchId,
            days: params.days,
        });
    }

    async GetStatusTrendAnalytics(params: AnalyticsStatusTrendParams) {
        return await this.appointmentRepository.getStatusTrend({
            branchId: params.branchId,
            days: params.days,
        });
    }

    async GetTopUsersAnalytics(params: AnalyticsTopUsersParams) {
        return await this.appointmentRepository.getTopUsers({
            branchId: params.branchId,
            limit: params.limit,
            days: params.days,
        });
    }

    async GetAverageLeadTimeAnalytics(params: AnalyticsAverageLeadTimeParams) {
        return await this.appointmentRepository.getAvgLeadTime({
            branchId: params.branchId,
            days: params.days,
        });
    }

    async GetMultiSeriesStatusesAnalytics(params: AnalyticsMultiSeriesStatusesParams) {
        return await this.appointmentRepository.getMultiSeriesStatuses({
            branchId: params.branchId,
            days: params.days,
        });
    }
}
