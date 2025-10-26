import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class TestCronService{
    private readonly logger = new Logger(TestCronService.name);

    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    handleCron(){
        this.logger.log("Called when current second is 1");
        console.log("test");
    }
}