import { Test, TestingModule } from "@nestjs/testing";
import { Branch } from "src/entities/branch.entity";
import { AppointmentType } from "src/enums/appointment-type.enum";
import { QueueStatus } from "src/enums/queue-status.enum";
import { ExportService } from "src/modules/export/export.service";
import { PdfExportService } from "src/modules/export/pdf-export.service";
import { AppointmentRepository } from "src/repositories/appointment.repository";

describe("ExportService", () => {
    let service: ExportService;
    let appointmentRepository: jest.Mocked<AppointmentRepository>;
    let pdfExportService: jest.Mocked<PdfExportService>;

    const branch = {
        id: "branch-id",
        name: "Main Office",
        branchCode: "MAIN",
        address: "Main Office Address",
        allowedTimeFrame: 60,
    } as Branch;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ExportService],
        })
            .useMocker((token) => {
                if (token === AppointmentRepository) {
                    return {
                        GetAppointmentsForAdmin: jest.fn().mockResolvedValue([
                            {
                                id: "appointment-id",
                                appointmentCode: "REF-001",
                                accountCode: "3213213",
                                contactPerson: "fasdfadsfasd",
                                contact: "0912321321",
                                dateValidity: new Date("2026-04-01T21:00:00"),
                                queueStatus: QueueStatus.PENDING,
                                appointmentType: AppointmentType.SERVICE_CONNECTION_CONCERNS,
                                slot: {
                                    id: "slot-id",
                                    startTime: new Date("2026-04-01T21:00:00"),
                                    endTime: new Date("2026-04-01T22:00:00"),
                                    isActive: true,
                                    limit: 1,
                                    monthDay: {
                                        id: "day-id",
                                        month: 4,
                                        year: 2026,
                                        day: 1,
                                        dayofWeek: "tuesday",
                                        isWorkingDay: true,
                                        additionalNotes: null,
                                    },
                                    branch,
                                },
                                branch,
                            },
                        ]),
                    };
                }

                if (token === PdfExportService) {
                    return {
                        renderReportsPdf: jest.fn().mockResolvedValue(Buffer.from("reports")),
                    };
                }
            })
            .compile();

        service = module.get(ExportService);
        appointmentRepository = module.get(AppointmentRepository);
        pdfExportService = module.get(PdfExportService);
    });

    it("should build a reports PDF export payload and filename", async () => {
        const result = await service.exportReportsPdf(branch, {
            branchId: branch.id,
            from: "2026-04-01",
            to: "2026-04-02",
        });

        expect(pdfExportService.renderReportsPdf.mock.calls[0]?.[0]).toEqual(
            expect.objectContaining({
                totalCount: 1,
                summary: [
                    { requestType: "Billing Concerns", count: 0 },
                    { requestType: "Water Supplier Issues", count: 0 },
                    { requestType: "Leak Reports", count: 0 },
                    { requestType: "Service Connection Concerns", count: 1 },
                ],
                rows: [
                    expect.objectContaining({
                        contactPerson: "fasdfadsfasd",
                        referenceNumber: "REF-001",
                    }),
                ],
            }),
        );
        expect(appointmentRepository.GetAppointmentsForAdmin.mock.calls).toHaveLength(1);
        expect(result.filename).toBe("reports-main-office-2026-04-01-2026-04-02.pdf");
        expect(result.buffer).toEqual(Buffer.from("reports"));
    });
});
