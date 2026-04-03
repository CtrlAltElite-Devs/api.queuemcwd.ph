import { PdfExportService } from "src/modules/export/pdf-export.service";

describe("PdfExportService", () => {
    let service: PdfExportService;

    beforeEach(() => {
        service = new PdfExportService();
    });

    it("should render a reports PDF buffer", async () => {
        const result = await service.renderReportsPdf({
            metadata: {
                branchName: "Main Office",
                generatedAt: "2026-04-02T00:00:00.000Z",
                dateRangeLabel: "2026-04-01 to 2026-04-02",
            },
            summary: [{ requestType: "Billing Concerns", count: 4 }],
            totalCount: 4,
            rows: [
                {
                    contactPerson: "Juan Dela Cruz",
                    accountNumber: "123456",
                    scheduledAt: "2026-04-02T08:00:00.000Z",
                    referenceNumber: "ABC123",
                    requestType: "Billing Concerns",
                    cellphoneNumber: "09171234567",
                },
            ],
        });

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(0);
    });
});
