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

export const REPORT_DETAIL_COLUMN_WEIGHTS = [1.3, 0.9, 1.15, 1, 1.25, 1.1] as const;
