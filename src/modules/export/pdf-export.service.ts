import { existsSync } from "node:fs";
import path from "node:path";
import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import {
    REPORT_DETAIL_COLUMN_WEIGHTS,
    REPORT_DETAIL_HEADERS,
    REPORT_SUMMARY_HEADERS,
} from "./constants/export.constants";
import { ReportDetailRow, ReportSummaryRow, ReportsPdfPayload } from "./export.types";

type TableDefinition = {
    headers: string[];
    rows: Array<Array<string | number>>;
    columnWidths?: number[];
};

@Injectable()
export class PdfExportService {
    async renderReportsPdf(payload: ReportsPdfPayload): Promise<Buffer> {
        const document = this.createDocument("landscape");

        this.renderDocumentHeader(document);
        this.renderMetadata(document, payload.metadata);
        this.renderSectionTitle(document, "Summary");
        this.renderTable(document, {
            headers: [...REPORT_SUMMARY_HEADERS],
            rows: this.mapSummaryRows(payload.summary),
            columnWidths: this.scaleColumnWeights(document, [2.2, 1]),
        });
        this.renderSummaryTotal(document, payload.totalCount);
        document.moveDown();

        this.renderSectionTitle(document, "Detailed Records");
        if (payload.rows.length === 0) {
            this.renderBodyText(document, "No report data found for the selected filters.");
        } else {
            this.renderTable(document, {
                headers: [...REPORT_DETAIL_HEADERS],
                rows: this.mapDetailRows(payload.rows),
                columnWidths: this.scaleColumnWeights(document, REPORT_DETAIL_COLUMN_WEIGHTS),
            });
        }
        this.renderSectionTotal(document, payload.totalCount);

        document.end();
        return await this.collectDocumentBuffer(document);
    }

    private createDocument(layout: "portrait" | "landscape" = "portrait") {
        return new PDFDocument({
            margin: 50,
            size: "A4",
            layout,
        });
    }

    private async collectDocumentBuffer(document: PDFKit.PDFDocument): Promise<Buffer> {
        return await new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            document.on("data", (chunk: Buffer) => chunks.push(chunk));
            document.on("end", () => resolve(Buffer.concat(chunks)));
            document.on("error", reject);
        });
    }

    private renderDocumentHeader(document: PDFKit.PDFDocument) {
        this.ensurePageSpace(document, 82);
        this.resetCursorX(document);
        const startX = document.page.margins.left;
        const startY = document.y;
        const logoSize = 42;
        const gap = 12;
        const textX = startX + logoSize + gap;
        const logoPath = this.resolveLogoPath();

        if (logoPath) {
            document.image(logoPath, startX, startY, {
                fit: [logoSize, logoSize],
            });
        }

        document
            .fillColor("#111827")
            .font("Helvetica-Bold")
            .fontSize(18)
            .text("Metropolitan Cebu Water District", textX, startY + 10, {
                width: document.page.width - document.page.margins.right - textX,
            });

        const contentBottom = Math.max(document.y, startY + logoSize);
        document
            .moveTo(startX, contentBottom + 10)
            .lineTo(document.page.width - document.page.margins.right, contentBottom + 10)
            .strokeColor("#D1D5DB")
            .lineWidth(1)
            .stroke();

        document.fillColor("#111827").strokeColor("#000000");
        document.y = contentBottom + 18;
    }

    private resolveLogoPath() {
        const candidatePaths = [
            path.resolve(__dirname, "../../assets/images/mcwd_logo.png"),
            path.resolve(process.cwd(), "dist/src/assets/images/mcwd_logo.png"),
            path.resolve(process.cwd(), "src/assets/images/mcwd_logo.png"),
        ];

        return candidatePaths.find((candidatePath) => existsSync(candidatePath));
    }

    private renderBodyText(document: PDFKit.PDFDocument, text: string) {
        this.resetCursorX(document);
        document.fillColor("#374151").font("Helvetica").fontSize(10).text(text);
    }

    private mapSummaryRows(rows: ReportSummaryRow[]) {
        return rows.map((row) => [row.requestType, row.count]);
    }

    private mapDetailRows(rows: ReportDetailRow[]) {
        return rows.map((row) => [
            row.contactPerson,
            row.accountNumber,
            row.scheduledAt,
            row.referenceNumber,
            row.requestType,
            row.cellphoneNumber,
        ]);
    }

    private renderSummaryTotal(document: PDFKit.PDFDocument, totalCount: number) {
        this.renderSectionTotal(document, totalCount);
    }

    private renderSectionTotal(document: PDFKit.PDFDocument, totalCount: number) {
        this.resetCursorX(document);
        const rightEdge = document.page.width - document.page.margins.right;
        const width = 180;

        document
            .fillColor("#111827")
            .font("Helvetica-Bold")
            .fontSize(10)
            .text(`Total: ${totalCount}`, rightEdge - width, document.y, {
                width,
                align: "right",
            });
        document.moveDown(0.6);
    }

    private renderMetadata(
        document: PDFKit.PDFDocument,
        metadata: {
            branchName: string;
            generatedAt: string;
            dateRangeLabel: string;
        },
    ) {
        this.renderMetadataRow(document, "Branch", metadata.branchName);
        this.renderMetadataRow(document, "Date Range", metadata.dateRangeLabel);
        this.renderMetadataRow(document, "Generated At", metadata.generatedAt);
        document.moveDown(0.4);
    }

    private renderMetadataRow(document: PDFKit.PDFDocument, label: string, value: string | number) {
        this.ensurePageSpace(document, 18);
        this.resetCursorX(document);
        document
            .fillColor("#111827")
            .font("Helvetica-Bold")
            .fontSize(9)
            .text(`${label}: `, document.page.margins.left, document.y, {
                continued: true,
            })
            .font("Helvetica")
            .text(String(value), {
                lineBreak: false,
            });
        document.fillColor("#111827");
        document.moveDown(0.15);
    }

    private renderSectionTitle(document: PDFKit.PDFDocument, title: string) {
        this.ensurePageSpace(document, 32);
        this.resetCursorX(document);
        document.moveDown(0.5);
        document.fillColor("#111827").font("Helvetica-Bold").fontSize(14).text(title);
        document.moveDown(0.4);
    }

    private renderTable(document: PDFKit.PDFDocument, table: TableDefinition) {
        this.resetCursorX(document);
        const availableWidth =
            document.page.width - document.page.margins.left - document.page.margins.right;
        const widths =
            table.columnWidths ?? this.buildEvenColumnWidths(table.headers.length, availableWidth);
        const rowHeight = 18;

        this.drawTableRow(document, table.headers, widths, rowHeight, true);
        for (const row of table.rows) {
            this.drawTableRow(document, row, widths, rowHeight, false);
        }
        document.moveDown();
    }

    private drawTableRow(
        document: PDFKit.PDFDocument,
        row: Array<string | number>,
        widths: number[],
        rowHeight: number,
        isHeader: boolean,
    ) {
        this.ensurePageSpace(document, rowHeight + 6);
        const startX = document.page.margins.left;
        const startY = document.y;
        let currentX = startX;

        row.forEach((value, index) => {
            const width = widths[index];
            if (isHeader) {
                document.rect(currentX, startY, width, rowHeight).fill("#E5E7EB");
                document.fillColor("#111827").font("Helvetica-Bold").fontSize(9);
            } else {
                document.rect(currentX, startY, width, rowHeight).stroke("#D1D5DB");
                document.fillColor("#111827").font("Helvetica").fontSize(8);
            }

            document.text(String(value), currentX + 4, startY + 5, {
                width: width - 8,
                ellipsis: true,
            });
            currentX += width;
        });

        document.y = startY + rowHeight;
        document.fillColor("#111827");
    }

    private scaleColumnWeights(document: PDFKit.PDFDocument, weights: readonly number[]) {
        const availableWidth =
            document.page.width - document.page.margins.left - document.page.margins.right;
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        return weights.map((weight) => (availableWidth * weight) / totalWeight);
    }

    private buildEvenColumnWidths(columns: number, availableWidth: number) {
        return Array.from({ length: columns }, () => availableWidth / columns);
    }

    private resetCursorX(document: PDFKit.PDFDocument) {
        document.x = document.page.margins.left;
    }

    private ensurePageSpace(document: PDFKit.PDFDocument, requiredHeight: number) {
        const bottomBoundary = document.page.height - document.page.margins.bottom;
        if (document.y + requiredHeight <= bottomBoundary) {
            return;
        }

        document.addPage();
    }
}
