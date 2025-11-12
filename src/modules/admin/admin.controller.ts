import { Body, Controller, Get, Post } from "@nestjs/common";
import {
    UseAdminOnlyGuard,
    UseSuperAdminOnlyGuard,
} from "src/security/decorators/index.decorators";
import { CurrentAdmin } from "src/security/decorators/queried-entity-decorators/current-admin.decorator";
import { AdminService } from "./admin.service";
import { AdminDto } from "./dto/admin.dto";
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
    @UseAdminOnlyGuard()
    Me(@CurrentAdmin() admin: AdminDto) {
        return admin;
    }
}
