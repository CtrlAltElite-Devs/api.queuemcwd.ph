const exportDateFormatter = new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "Asia/Manila",
});

const exportDateTimeFormatter = new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
});

function parseDateInput(value: string | Date) {
    if (value instanceof Date) {
        return value;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return new Date(`${value}T00:00:00`);
    }

    return new Date(value);
}

export function formatExportDate(value: string | Date) {
    return exportDateFormatter.format(parseDateInput(value));
}

export function formatExportDateTime(value: string | Date) {
    return exportDateTimeFormatter.format(parseDateInput(value));
}

export function formatExportDateRange(from?: string, to?: string) {
    if (from && to) {
        return `${formatExportDate(from)} to ${formatExportDate(to)}`;
    }

    if (from) {
        return `From ${formatExportDate(from)}`;
    }

    if (to) {
        return `Until ${formatExportDate(to)}`;
    }

    return "All time";
}
