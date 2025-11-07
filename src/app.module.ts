import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AllCronJobs } from "./cron-jobs/index.jobs";
import { ApplicationModules, InfrastructureModules } from "./modules/index.modules";

@Module({
    imports: [...InfrastructureModules, ...ApplicationModules],
    controllers: [AppController],
    providers: [...AllCronJobs],
})
export class AppModule {}
