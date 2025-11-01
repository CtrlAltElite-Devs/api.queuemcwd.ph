import { Body, Controller, Post } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { AdminLoginDto } from "./dto/login-admin.dto";

@Controller("admin")
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Post()
    async CreateAdminAsync(@Body() body: CreateAdminDto) {
        return await this.adminService.CreateAdminAsync(body);
    }

    @Post("login")
    async AdminLoginAsync(@Body() body: AdminLoginDto) {
        return await this.adminService.AdminLoginAsync(body);
    }
}
