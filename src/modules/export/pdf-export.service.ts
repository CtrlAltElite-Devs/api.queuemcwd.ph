import { existsSync } from "node:fs";
import path from "node:path";
import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import {
    PDF_COLORS,
    PDF_COPY,
    PDF_LAYOUT,
    REPORT_DETAIL_COLUMN_WEIGHTS,
    REPORT_DETAIL_HEADERS,
    REPORT_SUMMARY_COLUMN_WEIGHTS,
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
        this.renderSectionTitle(document, PDF_COPY.summarySectionTitle);
        this.renderTable(document, {
            headers: [...REPORT_SUMMARY_HEADERS],
            rows: this.mapSummaryRows(payload.summary),
            columnWidths: this.scaleColumnWeights(document, REPORT_SUMMARY_COLUMN_WEIGHTS),
        });
        this.renderSummaryTotal(document, payload.totalCount);
        document.moveDown();

        this.renderSectionTitle(document, PDF_COPY.detailSectionTitle);
        if (payload.rows.length === 0) {
            this.renderBodyText(document, PDF_COPY.emptyDetailMessage);
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
            margin: PDF_LAYOUT.pageMargin,
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
        this.ensurePageSpace(document, PDF_LAYOUT.header.minHeight);
        this.resetCursorX(document);
        const startX = document.page.margins.left;
        const startY = document.y;
        const logoSize = PDF_LAYOUT.header.logoSize;
        const gap = PDF_LAYOUT.header.logoGap;
        const textX = startX + logoSize + gap;
        const logoPath = this.resolveLogoPath();

        if (logoPath) {
            document.image(logoPath, startX, startY, {
                fit: [logoSize, logoSize],
            });
        }

        document
            .fillColor(PDF_COLORS.textPrimary)
            .font("Helvetica-Bold")
            .fontSize(PDF_LAYOUT.header.titleFontSize)
            .text(PDF_COPY.organizationName, textX, startY + PDF_LAYOUT.header.titleOffsetY, {
                width: document.page.width - document.page.margins.right - textX,
            });

        const contentBottom = Math.max(document.y, startY + logoSize);
        document
            .moveTo(startX, contentBottom + PDF_LAYOUT.header.dividerOffsetY)
            .lineTo(
                document.page.width - document.page.margins.right,
                contentBottom + PDF_LAYOUT.header.dividerOffsetY,
            )
            .strokeColor(PDF_COLORS.border)
            .lineWidth(1)
            .stroke();

        document.fillColor(PDF_COLORS.textPrimary).strokeColor("#000000");
        document.y = contentBottom + PDF_LAYOUT.header.bottomSpacing;
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
        document
            .fillColor(PDF_COLORS.textSecondary)
            .font("Helvetica")
            .fontSize(PDF_LAYOUT.body.fontSize)
            .text(text);
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
        const width = PDF_LAYOUT.body.totalWidth;

        document
            .fillColor(PDF_COLORS.textPrimary)
            .font("Helvetica-Bold")
            .fontSize(PDF_LAYOUT.body.totalFontSize)
            .text(`Total: ${totalCount}`, rightEdge - width, document.y, {
                width,
                align: "right",
            });
        document.moveDown(PDF_LAYOUT.body.totalSpacingAfter);
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
        document.moveDown(PDF_LAYOUT.body.metadataSpacingAfter);
    }

    private renderMetadataRow(document: PDFKit.PDFDocument, label: string, value: string | number) {
        this.ensurePageSpace(document, PDF_LAYOUT.body.metadataRowHeight);
        this.resetCursorX(document);
        document
            .fillColor(PDF_COLORS.textPrimary)
            .font("Helvetica-Bold")
            .fontSize(PDF_LAYOUT.body.metadataFontSize)
            .text(`${label}: `, document.page.margins.left, document.y, {
                continued: true,
            })
            .font("Helvetica")
            .text(String(value), {
                lineBreak: false,
            });
        document.fillColor(PDF_COLORS.textPrimary);
        document.moveDown(PDF_LAYOUT.body.metadataRowSpacing);
    }

    private renderSectionTitle(document: PDFKit.PDFDocument, title: string) {
        this.ensurePageSpace(document, PDF_LAYOUT.section.titleMinHeight);
        this.resetCursorX(document);
        document.moveDown(PDF_LAYOUT.section.titleSpacingBefore);
        document
            .fillColor(PDF_COLORS.textPrimary)
            .font("Helvetica-Bold")
            .fontSize(PDF_LAYOUT.section.titleFontSize)
            .text(title);
        document.moveDown(PDF_LAYOUT.section.titleSpacingAfter);
    }

    private renderTable(document: PDFKit.PDFDocument, table: TableDefinition) {
        this.resetCursorX(document);
        const availableWidth =
            document.page.width - document.page.margins.left - document.page.margins.right;
        const widths =
            table.columnWidths ?? this.buildEvenColumnWidths(table.headers.length, availableWidth);
        const rowHeight = PDF_LAYOUT.table.rowHeight;

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
        this.ensurePageSpace(document, rowHeight + PDF_LAYOUT.table.minRowSpacing);
        const startX = document.page.margins.left;
        const startY = document.y;
        let currentX = startX;

        row.forEach((value, index) => {
            const width = widths[index];
            if (isHeader) {
                document.rect(currentX, startY, width, rowHeight).fill(PDF_COLORS.headerFill);
                document
                    .fillColor(PDF_COLORS.textPrimary)
                    .font("Helvetica-Bold")
                    .fontSize(PDF_LAYOUT.table.headerFontSize);
            } else {
                document.rect(currentX, startY, width, rowHeight).stroke(PDF_COLORS.border);
                document
                    .fillColor(PDF_COLORS.textPrimary)
                    .font("Helvetica")
                    .fontSize(PDF_LAYOUT.table.fontSize);
            }

            document.text(
                String(value),
                currentX + PDF_LAYOUT.table.rowPaddingX,
                startY + PDF_LAYOUT.table.rowPaddingY,
                {
                    width: width - PDF_LAYOUT.table.rowPaddingX * 2,
                    ellipsis: true,
                },
            );
            currentX += width;
        });

        document.y = startY + rowHeight;
        document.fillColor(PDF_COLORS.textPrimary);
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
