import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import type { AuthenticatedRequest } from "src/security/common/authenticated.request";
import {
    UseAuthenticationGuard,
    UseSuperAdminOnlyGuard,
} from "src/security/decorators/index.decorators";
import { AdminService } from "./admin.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { AdminLoginDto } from "./dto/login-admin.dto";

@Controller("admin")
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Post("register")
    @UseSuperAdminOnlyGuard()
    async CreateAdminAsync(@Body() body: CreateAdminDto) {
        return await this.adminService.CreateAdminAsync(body);
    }

    @Post("login")
    async AdminLoginAsync(@Body() body: AdminLoginDto) {
        return await this.adminService.AdminLoginAsync(body);
    }

    @Get("me")
    @UseAuthenticationGuard()
    Me(@Req() request: AuthenticatedRequest) {
        return request.admin;
    }
}
