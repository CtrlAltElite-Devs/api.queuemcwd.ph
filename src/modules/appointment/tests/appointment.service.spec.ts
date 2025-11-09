import { Collection } from "@mikro-orm/core";
import { Test, TestingModule } from "@nestjs/testing";
import moment from "moment";
import { SLOT_TOO_FAR, SlotErrors } from "src/constants/error-messages/appointment.error";
import { Appointment } from "src/entities/appointment.entity";
import { Branch } from "src/entities/branch.entity";
import { MonthDay } from "src/entities/monthDay.entity";
import { Slot } from "src/entities/slot.entity";
import { QueueStatus } from "src/enums/queue-status.enum";
import { UnitOfWork } from "src/modules/common/unit-of-work";
import { AppointmentRepository } from "src/repositories/appointment.repository";
import { SlotsRepository } from "src/repositories/slots.repository";
import { AppointmentService } from "../appointment.service";
import { CreateAppointmentDto } from "../dtos/create-appointment.dto";

const slotFactory = () => {
    const slot = new Slot();
    const monthDay = new MonthDay();
    const branch = new Branch();
    slot.monthDay = monthDay;
    slot.branch = branch;
    return slot;
};

const appointmentFactory = () => {
    const appointment = new Appointment();
    return appointment;
};

describe("AppointmentService", () => {
    let service: AppointmentService;
    let appointmentRepo: jest.Mocked<AppointmentRepository>;
    let slotsRepo: jest.Mocked<SlotsRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AppointmentService],
        })
            .useMocker((token) => {
                if (token === UnitOfWork) {
                    return { Commit: jest.fn() };
                }
                if (token === AppointmentRepository) {
                    return { findOne: jest.fn(), save: jest.fn() };
                }
                if (token === SlotsRepository) {
                    return { findOne: jest.fn() };
                }
            })
            .compile();

        service = module.get(AppointmentService);
        appointmentRepo = module.get(AppointmentRepository);
        slotsRepo = module.get(SlotsRepository);
    });

    describe("CreateAppointmentAsync", () => {
        it("should throw if slot id does not exist", async () => {
            slotsRepo.findOne.mockResolvedValueOnce(null);

            const dto = new CreateAppointmentDto();
            await expect(service.CreateAppointmentAsync(dto)).rejects.toThrow(
                SlotErrors.SLOT_ID_NOT_FOUND,
            );
        });

        it("should throw if month day is not a working day", async () => {
            const slot = slotFactory();
            slot.monthDay.isWorkingDay = false;
            slotsRepo.findOne.mockResolvedValueOnce(slot);

            const dto = new CreateAppointmentDto();
            await expect(service.CreateAppointmentAsync(dto)).rejects.toThrow(
                SlotErrors.SLOT_NOT_ON_WORKING_DAY,
            );
        });

        it("should throw if slot has already ended", async () => {
            const slot = slotFactory();
            slot.endTime = moment().subtract(1, "hour").toDate();
            slot.monthDay.isWorkingDay = true;
            slotsRepo.findOne.mockResolvedValueOnce(slot);

            const dto = new CreateAppointmentDto();
            await expect(service.CreateAppointmentAsync(dto)).rejects.toThrow(
                SlotErrors.SLOT_ALREADY_ENDED,
            );
        });

        it("should throw if slot is not active", async () => {
            const slot = slotFactory();
            slot.isActive = false;
            slot.monthDay.isWorkingDay = true;
            slotsRepo.findOne.mockResolvedValueOnce(slot);

            const dto = new CreateAppointmentDto();
            await expect(service.CreateAppointmentAsync(dto)).rejects.toThrow(
                SlotErrors.SLOT_NOT_ACTIVE,
            );
        });

        it("should throw if slot date is today", async () => {
            const slot = slotFactory();
            slot.isActive = true;
            slot.monthDay.isWorkingDay = true;
            slot.monthDay.year = moment().year();
            slot.monthDay.month = moment().month() + 1;
            slot.monthDay.day = moment().date();
            slotsRepo.findOne.mockResolvedValueOnce(slot);

            const dto = new CreateAppointmentDto();
            await expect(service.CreateAppointmentAsync(dto)).rejects.toThrow(
                SlotErrors.SLOT_TODAY_NOT_ALLOWED,
            );
        });

        it("should throw if slot date has already passed", async () => {
            const slot = slotFactory();
            slot.isActive = true;
            slot.monthDay.isWorkingDay = true;
            const yesterday = moment().subtract(1, "day");
            slot.monthDay.year = yesterday.year();
            slot.monthDay.month = yesterday.month() + 1;
            slot.monthDay.day = yesterday.date();
            slotsRepo.findOne.mockResolvedValueOnce(slot);

            const dto = new CreateAppointmentDto();
            await expect(service.CreateAppointmentAsync(dto)).rejects.toThrow(
                SlotErrors.SLOT_DATE_PASSED,
            );
        });

        it("should throw if slot date is too far", async () => {
            const slot = slotFactory();
            slot.isActive = true;
            slot.monthDay.isWorkingDay = true;

            const future = moment().add(8, "days"); // beyond 7 days
            slot.monthDay.year = future.year();
            slot.monthDay.month = future.month() + 1; // month() is 0-based
            slot.monthDay.day = future.date();

            slotsRepo.findOne.mockResolvedValueOnce(slot);

            const dto = new CreateAppointmentDto();
            await expect(service.CreateAppointmentAsync(dto)).rejects.toThrow(
                SLOT_TOO_FAR(slot.branch.allowedTimeFrame),
            );
        });

        it("should throw if slot is already full", async () => {
            const slot = slotFactory();
            slot.isActive = true;
            slot.monthDay.isWorkingDay = true;
            slot.limit = 10;
            // Create 10 active appointments
            const appointments: Appointment[] = Array.from({ length: 10 }, () => {
                const a = appointmentFactory();
                a.queueStatus = QueueStatus.ACTIVE;
                return a;
            });

            // Use mock collection
            slot.appointments = new Collection<Appointment>(slot, appointments);

            const tomorrow = moment().add(1, "day");
            slot.monthDay.year = tomorrow.year();
            slot.monthDay.month = tomorrow.month() + 1;
            slot.monthDay.day = tomorrow.date();
            slotsRepo.findOne.mockResolvedValueOnce(slot);

            const dto = new CreateAppointmentDto();
            await expect(service.CreateAppointmentAsync(dto)).rejects.toThrow(SlotErrors.SLOT_FULL);
        });
    });

    describe("VerifyAppointmentAsync", () => {
        it("should throw if appointment code not found", async () => {
            appointmentRepo.findOne.mockResolvedValueOnce(null);

            await expect(service.VerifyAppointmentAsync("INVALID_CODE")).rejects.toThrow(
                "appointment code not found",
            );
        });
    });
});
