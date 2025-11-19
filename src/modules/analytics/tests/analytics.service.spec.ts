import { Test, TestingModule } from "@nestjs/testing";
import { AnalyticsService } from "src/modules/analytics/analytics.service";
import { AnalyticsAverageLeadTimeParams } from "src/modules/analytics/resource-parameters/analytics-average-lead-time-params";
import { AnalyticsStatusBreakdownParams } from "src/modules/analytics/resource-parameters/analytics-breakdown-params";
import { AnalyticsMultiSeriesStatusesParams } from "src/modules/analytics/resource-parameters/analytics-muli-series-statuses-param";
import { AnalyticsOverviewParams } from "src/modules/analytics/resource-parameters/analytics-overview-params";
import { AnalyticsStatusTrendParams } from "src/modules/analytics/resource-parameters/analytics-status-trend-params";
import { AnalyticsTimelineParams } from "src/modules/analytics/resource-parameters/analytics-timeline-params";
import { AnalyticsTopUsersParams } from "src/modules/analytics/resource-parameters/analytics-top-users.paramts";
import { AnalyticsPeakHoursParams } from "src/modules/analytics/resource-parameters/analytisc-peak-hours-params";
import { AppointmentRepository } from "src/repositories/appointment.repository";

describe("AnalyticsService", () => {
    let service: AnalyticsService;
    let appointmentRepo: jest.Mocked<AppointmentRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AnalyticsService],
        })
            .useMocker((token) => {
                if (token === AppointmentRepository) {
                    return {
                        getOverview: jest.fn(),
                        getTimeline: jest.fn(),
                        getStatusBreakdown: jest.fn(),
                        getPeakHours: jest.fn(),
                        getStatusTrend: jest.fn(),
                        getTopUsers: jest.fn(),
                        getAvgLeadTime: jest.fn(),
                        getMultiSeriesStatuses: jest.fn(),
                    };
                }
            })
            .compile();

        service = module.get(AnalyticsService);
        appointmentRepo = module.get(AppointmentRepository);
    });

    it("should call getOverview", async () => {
        const params = new AnalyticsOverviewParams();
        params.branchId = "branchId";
        const spy = jest.spyOn(appointmentRepo, "getOverview");
        await service.getOverviewAnalytics(params);
        expect(spy).toHaveBeenCalled();
    });

    it("should call getTimeline", async () => {
        const params = new AnalyticsTimelineParams();
        params.branchId = "branchId";
        const spy = jest.spyOn(appointmentRepo, "getTimeline");
        await service.getTimelineAnalytics(params);
        expect(spy).toHaveBeenCalled();
    });

    it("should call getStatusBreakdown", async () => {
        const params = new AnalyticsStatusBreakdownParams();
        params.branchId = "branchId";
        const spy = jest.spyOn(appointmentRepo, "getStatusBreakdown");
        await service.getStatusBreakdownAnalytics(params);
        expect(spy).toHaveBeenCalled();
    });

    it("should call getPeakHours", async () => {
        const params = new AnalyticsPeakHoursParams();
        params.branchId = "branchId";
        const spy = jest.spyOn(appointmentRepo, "getPeakHours");
        await service.GetPeakHoursAnalytics(params);
        expect(spy).toHaveBeenCalled();
    });

    it("should call getStatusTrend", async () => {
        const params = new AnalyticsStatusTrendParams();
        params.branchId = "branchId";
        const spy = jest.spyOn(appointmentRepo, "getStatusTrend");
        await service.GetStatusTrendAnalytics(params);
        expect(spy).toHaveBeenCalled();
    });

    it("should call getTopUsers", async () => {
        const params = new AnalyticsTopUsersParams();
        params.branchId = "branchId";
        const spy = jest.spyOn(appointmentRepo, "getTopUsers");
        await service.GetTopUsersAnalytics(params);
        expect(spy).toHaveBeenCalled();
    });

    it("should call getAvgLeadTime", async () => {
        const params = new AnalyticsAverageLeadTimeParams();
        params.branchId = "branchId";
        const spy = jest.spyOn(appointmentRepo, "getAvgLeadTime");
        await service.GetAverageLeadTimeAnalytics(params);
        expect(spy).toHaveBeenCalled();
    });

    it("should call getMultiSeriesStatuses", async () => {
        const params = new AnalyticsMultiSeriesStatusesParams();
        params.branchId = "branchId";
        const spy = jest.spyOn(appointmentRepo, "getMultiSeriesStatuses");
        await service.GetMultiSeriesStatusesAnalytics(params);
        expect(spy).toHaveBeenCalled();
    });
});
