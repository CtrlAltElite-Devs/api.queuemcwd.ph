import { ForbiddenError } from "@casl/ability";
import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { isUUID } from "class-validator";
import { AppointmentRepository } from "src/repositories/appointment.repository";
import { AbilityFactory, Action } from "../ability/ability.factory";
import { EnrichedRequest } from "../common/enriched.request";

@Injectable()
export class AppointmentGuard implements CanActivate {
    constructor(
        private readonly appointmentRepository: AppointmentRepository,
        private readonly abilityFactory: AbilityFactory,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<EnrichedRequest>();
        const appointmentId = request.params?.appointmentId;
        const admin = request.admin;

        if (!admin) throw new UnauthorizedException();

        if (!appointmentId) {
            throw new BadRequestException("appointmentId param is missing");
        }

        if (!isUUID(appointmentId)) {
            throw new BadRequestException("appointmentId must be a valid UUID");
        }

        // todo caching|
        const appointment = await this.appointmentRepository.findOne(
            {
                id: appointmentId,
            },
            { populate: ["branch"] },
        );

        if (appointment === null) throw new NotFoundException("appointment not found");

        const abilityForAdmin = this.abilityFactory.defineAbilityForAdmin(admin);
        ForbiddenError.from(abilityForAdmin).throwUnlessCan(Action.Manage, appointment.branch);
        request.appointment = appointment;
        return true;
    }
}
