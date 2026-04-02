export type ReportSummaryRow = {
    requestType: string;
    count: number;
};

export type ReportDetailRow = {
    contactPerson: string;
    accountNumber: string;
    scheduledAt: string;
    referenceNumber: string;
    requestType: string;
    cellphoneNumber: string;
};

export type PdfMetadata = {
    branchName: string;
    generatedAt: string;
    dateRangeLabel: string;
};

export type ReportsPdfPayload = {
    metadata: PdfMetadata;
    summary: ReportSummaryRow[];
    totalCount: number;
    rows: ReportDetailRow[];
};
