import { EntityRepository } from "@mikro-orm/mysql";
import { Appointment } from "src/entities/appointment.entity";
import { generateAppointmentCode } from "../utils/generate-appointment-code.util";
import { AppointmentResourceParameter } from "src/modules/appointment/resource-parameters/appointment-params";

type OverviewDto = {
    total: number;
    totalToday: number;
    totalThisWeek: number;
    totalThisMonth: number;
    completed: number;
    cancelled: number;
    noShow: number;
    completionRate: number; // percent
    cancellationRate: number; // percent
    noShowRate: number; // percent
};

type MutliSeriesDataDto = {
    date: string;
    completed: number;
    cancelled: number;
    noShow: number;
    pending: number;
};

type TimelineRow = { date: string; count: number };
type StatusBreakdownRow = { status: string; count: number };
type AppointmentTypeBreakdownRow = { appointmentType: number; count: number };
type HourCount = { hour: string; count: number };
type TopUserRow = { accountCode: string; count: number };
type RepeatUserRow = { accountCode: string; count: number };
type AvgLeadTimeRow = { avgLeadTimeMinutes: number }; // minutes
type AvgDurationRow = { avgDurationMinutes: number }; // minutes
type StatusTrendRow = { date: string; status: string; count: number };

export class AppointmentRepository extends EntityRepository<Appointment> {
    async GenerateUniqueAppointmentCodeAsync(): Promise<string> {
        for (let i = 0; i < 10; i++) {
            const code = generateAppointmentCode();

            // Check if it already exists in the database
            const existing = await this.findOne({ appointmentCode: code });
            if (!existing) {
                return code;
            }
        }
        throw new Error("Unable to generate unique appointment code after multiple attempts");
    }

    private buildFilterConditions(params: {
        branchId?: number | string;
        from?: string; // 'YYYY-MM-DD'
        to?: string; // 'YYYY-MM-DD'
        appointmentType?: string;
    }) {
        const conditions: string[] = [];
        const values: any[] = [];

        if (params.branchId != null) {
            conditions.push("a.branch_id = ?");
            values.push(params.branchId);
        }
        if (params.from) {
            conditions.push("DATE(a.date_validity) >= ?");
            values.push(params.from);
        }
        if (params.to) {
            conditions.push("DATE(a.date_validity) <= ?");
            values.push(params.to);
        }
        if (params.appointmentType) {
            conditions.push("a.appointment_type = ?");
            values.push(params.appointmentType);
        }

        const where = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
        return { where, values };
    }

    // 1) Overview KPIs
    async getOverview(params: {
        branchId?: number | string;
        from?: string;
        to?: string;
        appointmentType?: string;
    }): Promise<OverviewDto> {
        const { where, values } = this.buildFilterConditions(params);

        // total, completed, cancelled, no-show, today, week, month
        // adjust column names if your schema differs
        const sql = `
            SELECT
            COUNT(*) AS total,

            -- Today
            SUM(CASE WHEN DATE(a.date_validity) = CURDATE() THEN 1 ELSE 0 END) AS totalToday,

            -- This Week
            SUM(
                CASE WHEN YEARWEEK(DATE(a.date_validity), 1) = YEARWEEK(CURDATE(), 1)
                THEN 1 ELSE 0 END
            ) AS totalThisWeek,

            -- This Month
            SUM(
                CASE WHEN DATE_FORMAT(a.date_validity, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
                THEN 1 ELSE 0 END
            ) AS totalThisMonth,

            -- Completed (done)
            SUM(CASE WHEN a.queue_status = 'done' THEN 1 ELSE 0 END) AS completed,

            -- Cancelled
            SUM(CASE WHEN a.queue_status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,

            -- No Show
            SUM(CASE WHEN a.queue_status = 'noShow' THEN 1 ELSE 0 END) AS noShow

            FROM appointment a
            ${where}
        `;

        const rows = await this.em.getConnection().execute(sql, values);
        const r = rows[0] ?? {
            total: 0,
            totalToday: 0,
            totalThisWeek: 0,
            totalThisMonth: 0,
            completed: 0,
            cancelled: 0,
            noShow: 0,
        };

        const total = Number(r.total || 0);
        const completed = Number(r.completed || 0);
        const cancelled = Number(r.cancelled || 0);
        const noShow = Number(r.noShow || 0);

        const completionRate = total > 0 ? +(100 * (completed / total)).toFixed(2) : 0;
        const cancellationRate = total > 0 ? +(100 * (cancelled / total)).toFixed(2) : 0;
        const noShowRate = total > 0 ? +(100 * (noShow / total)).toFixed(2) : 0;

        return {
            total: Number(r.total || 0),
            totalToday: Number(r.totalToday || 0),
            totalThisWeek: Number(r.totalThisWeek || 0),
            totalThisMonth: Number(r.totalThisMonth || 0),
            completed,
            cancelled,
            noShow,
            completionRate,
            cancellationRate,
            noShowRate,
        };
    }

    // 2) Timeline: counts grouped by date
    async getTimeline(params: {
        days?: number; // default 7
        from?: string;
        to?: string;
        branchId?: number | string;
    }): Promise<TimelineRow[]> {
        const days = params.days ?? 7;

        if (params.from && params.to) {
            // use explicit range
            const { where, values } = this.buildFilterConditions({
                branchId: params.branchId,
                from: params.from,
                to: params.to,
            });

            const sql = `
                SELECT DATE(a.date_validity) AS date, COUNT(*) AS count
                FROM appointment a
                ${where}
                GROUP BY DATE(a.date_validity)
                ORDER BY DATE(a.date_validity) ASC
            `;

            const rows = await this.em.getConnection().execute(sql, values);
            return rows.map((r) => ({
                date: r.date as string,
                count: Number(r.count),
            }));
        }

        // default last N days
        const sql = `
            SELECT DATE(a.date_validity) AS date, COUNT(*) AS count
            FROM appointment a
            WHERE a.date_validity >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            ${params.branchId ? "AND a.branch_id = ?" : ""}
            GROUP BY DATE(a.date_validity)
            ORDER BY DATE(a.date_validity) ASC
        `;

        const values: any[] = [days];
        if (params.branchId) values.push(params.branchId);

        const rows = await this.em.getConnection().execute(sql, values);
        return rows.map((r) => ({
            date: r.date as string,
            count: Number(r.count),
        }));
    }

    // 3) Status breakdown (completed / cancelled / no-show / pending)
    async getStatusBreakdown(params?: {
        branchId?: number | string;
        from?: string;
        to?: string;
    }): Promise<StatusBreakdownRow[]> {
        const { where, values } = this.buildFilterConditions(params ?? {});
        const sql = `
            SELECT a.queue_status AS status, COUNT(*) AS count
            FROM appointment a
            ${where}
            GROUP BY a.queue_status
        `;
        const rows = await this.em.getConnection().execute(sql, values);
        return rows.map((r) => ({ status: r.status as string, count: Number(r.count) }));
    }

    // 3b) Appointment type breakdown (counts per appointment type)
    async getAppointmentTypeBreakdown(params?: {
        branchId?: number | string;
        from?: string;
        to?: string;
    }): Promise<AppointmentTypeBreakdownRow[]> {
        const { where, values } = this.buildFilterConditions(params ?? {});
        const sql = `
            SELECT a.appointment_type AS appointmentType, COUNT(*) AS count
            FROM appointment a
            ${where}
            GROUP BY a.appointment_type
        `;
        const rows = await this.em.getConnection().execute(sql, values);
        return rows.map((r) => ({
            appointmentType: Number(r.appointmentType),
            count: Number(r.count),
        }));
    }

    // 4) Peak hours (hour of day)
    // join with slot if your appointment datetime is stored in slot.start_time / end_time
    async getPeakHours(params?: {
        branchId?: number | string;
        days?: number;
    }): Promise<HourCount[]> {
        const days = params?.days ?? 30;

        // if appointment datetime is on appointment.date_validity, use HOUR(a.date_validity)
        // if you rely on slot.start_time use s.start_time instead — here's an example using a.date_validity
        const sql = `
            SELECT 
                LPAD(HOUR(a.date_validity), 2, '0') AS hour,
                COUNT(*) AS count
            FROM appointment a
            WHERE a.date_validity >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                ${params?.branchId ? "AND a.branch_id = ?" : ""}
            GROUP BY LPAD(HOUR(a.date_validity), 2, '0')
            ORDER BY count DESC
            LIMIT 24
        `;

        const values: any[] = [days];
        if (params?.branchId) values.push(params.branchId);
        const rows = await this.em.getConnection().execute(sql, values);
        return rows.map((r) => ({ hour: r.hour as string, count: Number(r.count) }));
    }

    // 5) No-show / cancellation trend (counts per day for each status)
    async getStatusTrend(params?: {
        branchId?: number | string;
        days?: number;
    }): Promise<StatusTrendRow[]> {
        const days = params?.days ?? 30;
        const values: any[] = [days];
        let branchFilter = "";
        if (params?.branchId) {
            branchFilter = "AND a.branch_id = ?";
            values.push(params.branchId);
        }

        const sql = `
            SELECT DATE(a.date_validity) AS date, a.queue_status AS status, COUNT(*) AS count
            FROM appointment a
            WHERE a.date_validity >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            ${branchFilter}
            GROUP BY DATE(a.date_validity), a.queue_status
            ORDER BY DATE(a.date_validity) ASC
        `;

        const rows = await this.em.getConnection().execute(sql, values);
        return rows.map((r) => ({
            date: r.date as string,
            status: r.status as string,
            count: Number(r.count),
        }));
    }

    // 6) Top users (by number of appointments)
    async getTopUsers(params?: {
        branchId?: number | string;
        limit?: number;
        days?: number;
    }): Promise<TopUserRow[]> {
        const limit = params?.limit ?? 10;
        const days = params?.days ?? 90;

        const values: any[] = [days, limit];
        const branchFilter = params?.branchId ? "AND a.branch_id = ?" : "";
        if (params?.branchId) values.splice(1, 0, params.branchId); // insert after days (order: days, branch?, limit)

        // simpler: use dynamic values array below
        const sql = `
            SELECT a.account_code AS accountCode, COUNT(*) AS count
            FROM appointment a
            WHERE a.date_validity >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            ${branchFilter}
            GROUP BY a.account_code
            ORDER BY count DESC
            LIMIT ?
        `;

        // rebuild values correctly
        const finalValues: any[] = params?.branchId
            ? [days, params.branchId, limit]
            : [days, limit];
        const rows = await this.em.getConnection().execute(sql, finalValues);
        return rows.map((r) => ({ accountCode: r.accountCode as string, count: Number(r.count) }));
    }

    // 7) Repeat users (accounts with >1 appointment in a given window)
    async getRepeatUsers(params?: { days?: number; minCount?: number }): Promise<RepeatUserRow[]> {
        const days = params?.days ?? 90;
        const minCount = params?.minCount ?? 2;
        const sql = `
            SELECT a.account_code as accountCode, COUNT(*) as count
            FROM appointment a
            WHERE a.date_validity >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY a.account_code
            HAVING COUNT(*) >= ?
            ORDER BY count DESC
        `;
        const rows = await this.em.getConnection().execute(sql, [days, minCount]);
        return rows.map((r) => ({ accountCode: r.accountCode as string, count: Number(r.count) }));
    }

    // 8) Average lead time (minutes between created_at and appointment start (date_validity))
    async getAvgLeadTime(params?: {
        branchId?: number | string;
        days?: number;
    }): Promise<AvgLeadTimeRow> {
        const days = params?.days ?? 90;
        const values: any[] = [days];
        let branchFilter = "";
        if (params?.branchId) {
            branchFilter = "AND a.branch_id = ?";
            values.push(params.branchId);
        }

        // TIMESTAMPDIFF(MINUTE, created_at, date_validity)
        const sql = `
            SELECT AVG(TIMESTAMPDIFF(MINUTE, a.created_at, a.date_validity)) AS avgLeadTimeMinutes
            FROM appointment a
            WHERE a.date_validity >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            ${branchFilter}
        `;
        const rows = await this.em.getConnection().execute(sql, values);
        return { avgLeadTimeMinutes: Number(rows[0]?.avgLeadTimeMinutes ?? 0) };
    }

    // 9) Average appointment duration (if you have started_at/completed_at or using slot times)
    // If appointments rely on slot.start_time & slot.end_time we compute duration from slot
    async getAvgAppointmentDuration(params?: {
        branchId?: number | string;
        days?: number;
    }): Promise<AvgDurationRow> {
        const days = params?.days ?? 90;
        const values: any[] = [days];
        let branchFilter = "";
        if (params?.branchId) {
            branchFilter = "AND a.branch_id = ?";
            values.push(params.branchId);
        }

        // if using slot.start_time and slot.end_time:
        const sql = `
      SELECT AVG(TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time)) AS avgDurationMinutes
      FROM appointment a
      JOIN slots s ON a.slot_id = s.id
      WHERE a.date_validity >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ${branchFilter}
    `;
        const rows = await this.em.getConnection().execute(sql, values);
        return { avgDurationMinutes: Number(rows[0]?.avgDurationMinutes ?? 0) };
    }

    // 10) Raw SQL example to return a multi-series dataset for charting:
    //    returns dates with counts for completed, cancelled, no-show (useful for stacked area chart)
    async getMultiSeriesStatuses(params?: {
        days?: number;
        branchId?: string;
    }): Promise<MutliSeriesDataDto[]> {
        const days = params?.days ?? 30;
        const branchFilter = params?.branchId ? "AND a.branch_id = ?" : "";
        const values: any[] = params?.branchId ? [days, params.branchId] : [days];

        const sql = `
            SELECT
                DATE(a.date_validity) AS date,
                SUM(CASE WHEN a.queue_status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed,
                SUM(CASE WHEN a.queue_status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled,
                SUM(CASE WHEN a.queue_status = 'NO_SHOW' THEN 1 ELSE 0 END) AS no_show,
                SUM(CASE WHEN a.queue_status = 'PENDING' THEN 1 ELSE 0 END) AS pending
            FROM appointment a
            WHERE a.date_validity >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            ${branchFilter}
            GROUP BY DATE(a.date_validity)
            ORDER BY DATE(a.date_validity) ASC
        `;

        const rows = await this.em.getConnection().execute(sql, values);
        return rows.map((r) => ({
            date: r.date as string,
            completed: Number(r.completed),
            cancelled: Number(r.cancelled),
            noShow: Number(r.noShow),
            pending: Number(r.pending),
        }));
    }

    async GetAppointmentsForAdmin(branchId: string, params: AppointmentResourceParameter) {
        const limit = params.limit ?? 10;
        const offset = ((params.page ?? 1) - 1) * limit;

        return this.findAndCount(
            { branch: branchId, ...params.GetFilters() },
            { populate: ["slot", "branch"], limit, offset },
        );
    }
}
