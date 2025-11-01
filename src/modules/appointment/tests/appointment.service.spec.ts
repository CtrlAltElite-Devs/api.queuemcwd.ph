import { Collection } from "@mikro-orm/core";
import { Test, TestingModule } from "@nestjs/testing";
import moment from "moment";
import { Appointment } from "src/entities/appointment.entity";
import { MonthDay } from "src/entities/monthDay.entity";
import { Slot } from "src/entities/slot.entity";
import { QueueStatus } from "src/enums/queue-status.enum";
import { AppointmentRepository } from "src/repositories/appointment.repository";
import { SlotsRepository } from "src/repositories/slots.repository";
import { AppointmentService } from "../appointment.service";
import { CreateAppointmentDto } from "../dtos/create-appointment.dto";

const slotFactory = () => {
    const slot = new Slot();
    const monthDay = new MonthDay();
    slot.monthDay = monthDay;
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
            await expect(service.CreateAppointmentAsync(dto)).rejects.toThrow("slot id not found");
        });

        it("should throw if month day is not a working day", async () => {
            const slot = slotFactory();
            slot.monthDay.isWorkingDay = false;
            slotsRepo.findOne.mockResolvedValueOnce(slot);

            const dto = new CreateAppointmentDto();
            await expect(service.CreateAppointmentAsync(dto)).rejects.toThrow(
                "slot is not on a working day",
            );
        });

        it("should throw if slot has already ended", async () => {
            const slot = slotFactory();
            slot.endTime = moment().subtract(1, "hour").toDate();
            slot.monthDay.isWorkingDay = true;
            slotsRepo.findOne.mockResolvedValueOnce(slot);

            const dto = new CreateAppointmentDto();
            await expect(service.CreateAppointmentAsync(dto)).rejects.toThrow(
                "slot has already ended",
            );
        });

        it("should throw if slot is not active", async () => {
            const slot = slotFactory();
            slot.isActive = false;
            slot.monthDay.isWorkingDay = true;
            slotsRepo.findOne.mockResolvedValueOnce(slot);

            const dto = new CreateAppointmentDto();
            await expect(service.CreateAppointmentAsync(dto)).rejects.toThrow("slot is not active");
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
                "you cannot create an appointment for today",
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
                "slot date has already passed",
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
            await expect(service.CreateAppointmentAsync(dto)).rejects.toThrow(
                "slot is already full",
            );
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
