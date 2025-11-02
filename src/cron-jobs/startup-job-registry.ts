import { Logger } from "@nestjs/common";

export type JobRecordType = {
    status: "executed" | "skipped" | "failed";
    details?: string;
};

type JobResultType = {
    name: string;
} & JobRecordType;

export class StartupJobRegistry {
    private static readonly logger = new Logger("StartupSummary");
    private static readonly jobResults: JobResultType[] = [];

    static record(name: string, jobRecord: JobRecordType) {
        this.jobResults.push({
            name: name,
            status: jobRecord.status,
            details: jobRecord.details,
        });
    }

    static printSummary() {
        this.logger.log("========== 🚀 STARTUP JOB SUMMARY ==========");
        for (const job of this.jobResults) {
            const statusIcon =
                job.status === "executed" ? "✅" : job.status === "skipped" ? "⏭️" : "❌";

            this.logger.log(
                `${statusIcon} ${job.name} → ${job.status.toUpperCase()} ${job.details ? `(${job.details})` : ""}`,
            );
        }
        this.logger.log("============================================");
    }
}
