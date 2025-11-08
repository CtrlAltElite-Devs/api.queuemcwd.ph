import { BadRequestException } from "@nestjs/common";
import { BatchUpdateMonthDaySlotsDto } from "src/modules/month-day/dtos/batch-update/batch-update-month-day-slots.dto";
import { CreateMonthDayOptionsDto } from "src/modules/month-day/dtos/batch-update/options.dto";

describe("BatchUpdateMonthDaySlotsDto.validateOrThrow", () => {
    const makeDto = (options: CreateMonthDayOptionsDto) => {
        const dto = new BatchUpdateMonthDaySlotsDto();
        dto.options = options;
        return dto;
    };
    it("should throw when incrementMinutes is invalid", () => {
        const dto = makeDto({ startHour: 8, endHour: 17, incrementMinutes: 0 });
        expectValidationError(
            dto,
            "incrementMinutes",
            "incrementMinutes must be a positive integer.",
        );
    });

    it("should throw when startHour is missing and endHour is present", () => {
        const dto = makeDto({ endHour: 8, incrementMinutes: 20 });
        expectValidationError(
            dto,
            "startHour/endHour",
            "startHour and endHour must both be provided or both omitted.",
        );
    });

    it("should throw when endHour is missing and startHour is present", () => {
        const dto = makeDto({ startHour: 8, incrementMinutes: 20 });
        expectValidationError(
            dto,
            "startHour/endHour",
            "startHour and endHour must both be provided or both omitted.",
        );
    });

    it("should throw if start hour is less than 0", () => {
        const dto = makeDto({ startHour: -1, endHour: 20, incrementMinutes: 20 });
        expectValidationError(dto, "startHour", "startHour must be an integer between 0 and 23.");
    });

    it("should throw if start hour is greater than 23", () => {
        const dto = makeDto({ startHour: 24, endHour: 20, incrementMinutes: 20 });
        expectValidationError(dto, "startHour", "startHour must be an integer between 0 and 23.");
    });

    it("should throw if end hour is less than 1", () => {
        const dto = makeDto({ startHour: 1, endHour: 0, incrementMinutes: 20 });
        expectValidationError(dto, "endHour", "endHour must be an integer between 1 and 24.");
    });

    it("should throw if end hour is greater than 24", () => {
        const dto = makeDto({ startHour: 1, endHour: 25, incrementMinutes: 20 });
        expectValidationError(dto, "endHour", "endHour must be an integer between 1 and 24.");
    });

    it("should throw if start hour is greater than end hour", () => {
        const dto = makeDto({ startHour: 8, endHour: 7, incrementMinutes: 20 });
        expectValidationError(dto, "startHour/endHour", "startHour must be less than endHour.");
    });

    it("should throw if increment minuts is negative", () => {
        const dto = makeDto({ startHour: 8, endHour: 15, incrementMinutes: -1 });
        expectValidationError(
            dto,
            "incrementMinutes",
            "incrementMinutes must be a positive integer.",
        );
    });

    it("should throw if incrementMinutes does not divide total window evenly", () => {
        const dto = makeDto({ startHour: 8, endHour: 10, incrementMinutes: 45 }); // 120 mins window
        expectValidationError(
            dto,
            "incrementMinutes",
            "incrementMinutes (45) does not divide the total window (120 minutes) evenly.",
        );
    });

    it("should throw if excludeTimes is not an array", () => {
        const dto = makeDto({
            startHour: 8,
            endHour: 17,
            incrementMinutes: 30,
            // @ts-expect-error testing invalid input
            excludeTimes: "invalid",
        });
        // expectReferencError(dto);
        expectValidationError(dto, "excludeTimes", "excludeTimes must be an array of time ranges.");
    });

    it("should throw if excludeTimes contains non-object entry", () => {
        const dto = makeDto({
            startHour: 8,
            endHour: 17,
            incrementMinutes: 30,
            // @ts-expect-error: This is expected
            excludeTimes: null,
        });
        expectReferencError(dto);
    });

    it("should throw if excludeTimes range is invalid (start >= end)", () => {
        const dto = makeDto({
            startHour: 8,
            endHour: 17,
            incrementMinutes: 30,
            excludeTimes: [{ startHour: 15, endHour: 14 }],
        });
        expectValidationError(dto, "excludeTimes[0]", "startHour must be less than endHour.");
    });

    it("should throw if excludeTimes range lies outside working window", () => {
        const dto = makeDto({
            startHour: 8,
            endHour: 17,
            incrementMinutes: 30,
            excludeTimes: [{ startHour: 7, endHour: 9 }],
        });
        expectValidationError(
            dto,
            "excludeTimes[0]",
            "exclude range [7, 9) must lie within the working window [8, 17).",
        );
    });

    it("should throw if excludeTimes overlap", () => {
        const dto = makeDto({
            startHour: 8,
            endHour: 17,
            incrementMinutes: 30,
            excludeTimes: [
                { startHour: 10, endHour: 12 },
                { startHour: 11, endHour: 13 },
            ],
        });
        expectValidationError(
            dto,
            "excludeTimes",
            "excludeTimes[0] [10, 12) overlaps with excludeTimes[1] [11, 13).",
        );
    });

    it("should pass when excludeTimes are valid and non-overlapping", () => {
        const dto = makeDto({
            startHour: 8,
            endHour: 17,
            incrementMinutes: 30,
            excludeTimes: [
                { startHour: 9, endHour: 10 },
                { startHour: 12, endHour: 13 },
            ],
        });
        expect(() => dto.validateOrThrow()).not.toThrow();
    });
});

function expectValidationError(
    dto: BatchUpdateMonthDaySlotsDto,
    field: string,
    expectedMessage: string,
) {
    try {
        dto.validateOrThrow();
        fail("Expected validation to throw");
    } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        const response = (err as unknown as BadRequestException).getResponse() as {
            message: string;
            errors: Record<string, string[]>;
        };
        expect(response.errors[field]).toContain(expectedMessage);
    }
}

function expectReferencError(dto: BatchUpdateMonthDaySlotsDto) {
    try {
        dto.validateOrThrow();
    } catch (err) {
        expect(err).toBeInstanceOf(ReferenceError);
    }
}
