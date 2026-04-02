import { Injectable } from "@nestjs/common";
import { Branch } from "src/entities/branch.entity";
import { AppointmentType } from "src/enums/appointment-type.enum";
import { AppointmentRepository } from "src/repositories/appointment.repository";
import { AppointmentDto } from "../appointment/dtos/appointment.dto";
import { APPOINTMENT_TYPE_LABELS } from "./constants/export.constants";
import { ReportsExportQueryDto } from "./dto/reports-export-query.dto";
import { ReportsPdfPayload } from "./export.types";
import { PdfExportService } from "./pdf-export.service";
import { formatExportDateRange, formatExportDateTime } from "./utils/format-export-date.util";

@Injectable()
export class ExportService {
    constructor(
        private readonly appointmentRepository: AppointmentRepository,
        private readonly pdfExportService: PdfExportService,
    ) {}

    async exportReportsPdf(branch: Branch, params: ReportsExportQueryDto) {
        const appointments = await this.appointmentRepository.GetAppointmentsForExport(
            branch.id,
            {
                from: params.from,
                to: params.to,
            },
        );
        const appointmentRows = appointments.map((appointment) => AppointmentDto.Map(appointment));

        const payload: ReportsPdfPayload = {
            metadata: this.buildMetadata(branch, params),
            summary: this.buildSummaryRows(appointmentRows),
            totalCount: appointmentRows.length,
            rows: appointmentRows.map((appointment) => this.mapAppointmentToReportRow(appointment)),
        };

        const filename = this.buildFileName("reports", branch.name, params.from, params.to);
        const buffer = await this.pdfExportService.renderReportsPdf(payload);

        return { buffer, filename };
    }

    private buildMetadata(branch: Branch, params: ReportsExportQueryDto) {
        return {
            branchName: branch.name,
            generatedAt: formatExportDateTime(new Date()),
            dateRangeLabel: formatExportDateRange(params.from, params.to),
        };
    }

    private buildFileName(prefix: string, branchName: string, from?: string, to?: string) {
        const parts = [prefix, this.slugifyFileNameSegment(branchName), from ?? "all", to ?? "all"];
        return `${parts.join("-")}.pdf`;
    }

    private slugifyFileNameSegment(value: string) {
        return value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    private mapAppointmentToReportRow(appointment: AppointmentDto) {
        return {
            contactPerson: appointment.contactPerson,
            accountNumber: appointment.accountCode,
            scheduledAt: formatExportDateTime(appointment.slot.startTime),
            referenceNumber: appointment.appointmentCode,
            requestType: this.getAppointmentTypeLabel(appointment.appointmentType),
            cellphoneNumber: appointment.contact,
        };
    }

    private buildSummaryRows(appointments: AppointmentDto[]) {
        const counts = appointments.reduce(
            (appointmentCounts, appointment) =>
                appointmentCounts.set(
                    Number(appointment.appointmentType) as AppointmentType,
                    (appointmentCounts.get(Number(appointment.appointmentType) as AppointmentType) ??
                        0) + 1,
                ),
            new Map<AppointmentType, number>(),
        );

        return Object.values(AppointmentType)
            .filter((value): value is AppointmentType => typeof value === "number")
            .map((appointmentType) => ({
                requestType: this.getAppointmentTypeLabel(appointmentType),
                count: counts.get(appointmentType) ?? 0,
            }));
    }

    private getAppointmentTypeLabel(appointmentType: AppointmentType | number) {
        return (
            APPOINTMENT_TYPE_LABELS[appointmentType as AppointmentType] ??
            `Unknown (${appointmentType})`
        );
    }
}
