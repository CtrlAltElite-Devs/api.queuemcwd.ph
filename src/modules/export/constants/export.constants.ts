import { AppointmentType } from "src/enums/appointment-type.enum";

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
    [AppointmentType.BILLING_CONCERN]: "Billing Concerns",
    [AppointmentType.WATER_SUPPLIER_ISSUES]: "Water Supplier Issues",
    [AppointmentType.LEAK_REPORTS]: "Leak Reports",
    [AppointmentType.SERVICE_CONNECTION_CONCERNS]: "Service Connection Concerns",
};

export const REPORT_SUMMARY_HEADERS = ["Request Type", "Count"] as const;

export const REPORT_DETAIL_HEADERS = [
    "Contact Person",
    "Account No",
    "Scheduled At",
    "Reference No",
    "Request Type",
    "Cellphone No",
] as const;

export const REPORT_SUMMARY_COLUMN_WEIGHTS = [2.2, 1] as const;
export const REPORT_DETAIL_COLUMN_WEIGHTS = [1.3, 0.9, 1.15, 1, 1.25, 1.1] as const;

export const PDF_LAYOUT = {
    pageMargin: 50,
    header: {
        minHeight: 82,
        logoSize: 42,
        logoGap: 12,
        titleFontSize: 18,
        titleOffsetY: 10,
        dividerOffsetY: 10,
        bottomSpacing: 18,
    },
    section: {
        titleSpacingBefore: 0.5,
        titleSpacingAfter: 0.4,
        titleMinHeight: 32,
        titleFontSize: 14,
    },
    body: {
        fontSize: 10,
        metadataFontSize: 9,
        metadataRowHeight: 18,
        metadataSpacingAfter: 0.4,
        metadataRowSpacing: 0.15,
        totalWidth: 180,
        totalFontSize: 10,
        totalSpacingAfter: 0.6,
    },
    table: {
        rowHeight: 18,
        rowPaddingX: 4,
        rowPaddingY: 5,
        fontSize: 8,
        headerFontSize: 9,
        minRowSpacing: 6,
    },
} as const;

export const PDF_COLORS = {
    textPrimary: "#111827",
    textSecondary: "#374151",
    border: "#D1D5DB",
    headerFill: "#E5E7EB",
} as const;

export const PDF_COPY = {
    organizationName: "Metropolitan Cebu Water District",
    summarySectionTitle: "Summary",
    detailSectionTitle: "Detailed Records",
    emptyDetailMessage: "No report data found for the selected filters.",
} as const;
