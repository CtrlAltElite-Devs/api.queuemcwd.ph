import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() { }

  @Get("status")
  getStatus(): string {
    return "Healthy";
  }

  @Get("status/staging")
  getStatusStaging(): string {
    return "Staging Healthy";
  }
}