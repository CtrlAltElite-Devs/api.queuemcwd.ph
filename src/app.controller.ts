import { Controller, Get } from "@nestjs/common";
import {
    UseAuthenticationGuard,
    UseSuperAdminOnlyGuard,
} from "./security/decorators/index.decorators";

@Controller()
export class AppController {
    constructor() {}

    @Get("status")
    getStatus(): string {
        return "Healthy";
    }

    @Get("protected-for-branch-admin")
    @UseAuthenticationGuard()
    getProtected(): string {
        return "protected";
    }

    @Get("protected-for-super-admin")
    @UseSuperAdminOnlyGuard()
    getProtectedForSuper(): string {
        return "protected for super";
    }

    @Get("test-pre-commit")
    testPrecommit() {
        return "formatted precommit";
    }
}
