import { Request } from "express";
import { AdminDto } from "src/modules/admin/dto/admin.dto";

export interface AuthenticatedRequest extends Request {
    admin?: AdminDto;
}
