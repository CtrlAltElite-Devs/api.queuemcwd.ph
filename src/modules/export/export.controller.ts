import { Controller, Get, Query, Res, StreamableFile } from "@nestjs/common";
import type { Response } from "express";
import { Branch } from "src/entities/branch.entity";
import { UseBranchGuard } from "src/security/decorators/index.decorators";
import { BranchEntity } from "src/security/decorators/queried-entity-decorators/branch-entity.decorator";
import { ReportsExportQueryDto } from "./dto/reports-export-query.dto";
import { ExportService } from "./export.service";

@UseBranchGuard()
@Controller("reports")
export class ExportController {
    constructor(private readonly exportService: ExportService) {}

    @Get("export")
    async exportReportsPdf(
        @BranchEntity() branch: Branch,
        @Query() query: ReportsExportQueryDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const { buffer, filename } = await this.exportService.exportReportsPdf(branch, query);
        response.setHeader("Content-Type", "application/pdf");
        response.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        return new StreamableFile(buffer);
    }
}
