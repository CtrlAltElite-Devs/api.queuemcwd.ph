import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { Admin } from "src/entities/admin.entity";
import { Appointment } from "src/entities/appointment.entity";
import { Branch } from "src/entities/branch.entity";
import { AdminModule } from "../admin/admin.module";
import { CommonModule } from "../common/common.module";
import { ExportController } from "./export.controller";
import { ExportService } from "./export.service";
import { PdfExportService } from "./pdf-export.service";

@Module({
    imports: [MikroOrmModule.forFeature([Appointment, Admin, Branch]), AdminModule, CommonModule],
    controllers: [ExportController],
    providers: [ExportService, PdfExportService],
})
export class ExportModule {}
