import { BadRequestException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { CreateMonthDayOptions, TimeRange } from "src/utils/generate-month-days.util";
import { CreateMonthDayOptionsDto } from "./options.dto";

export class BatchUpdateMonthDaySlotsDto {
    @ApiProperty({ type: CreateMonthDayOptionsDto })
    @ValidateNested()
    @Type(() => CreateMonthDayOptionsDto)
    options: CreateMonthDayOptionsDto;

    MapToOptionsValue(): CreateMonthDayOptions {
        return {
            startHour: this.options.startHour,
            endHour: this.options.endHour,
            incrementMinutes: this.options.incrementMinutes,
            excludeTimes: this.options.excludeTimes?.map((e): TimeRange => {
                return {
                    startHour: e.startHour,
                    endHour: e.endHour,
                };
            }),
        };
    }

    /**
     * Validate options thoroughly and throw BadRequestException when invalid.
     *
     * Rules enforced:
     *  - options object must be present
     *  - startHour and endHour must either both be present or both absent
     *  - startHour: integer in [0, 23]; endHour: integer in [1, 24]; startHour < endHour
     *  - incrementMinutes (if present): integer > 0 and divides the total window evenly
     *  - excludeTimes (if present): array of ranges with valid hours, no overlaps,
     *    each exclude range must have start < end and must lie inside [startHour, endHour]
     */
    validateOrThrow(): void {
        const errors: Record<string, string[]> = {};

        if (!this.options) {
            throw new BadRequestException({
                message: "Invalid options",
                errors: { options: ["options is required"] },
            });
        }

        const { startHour, endHour, incrementMinutes, excludeTimes } = this.options;

        // Helper to push errors
        const push = (key: string, msg: string) => {
            if (!errors[key]) errors[key] = [];
            errors[key].push(msg);
        };

        // start/end presence rule: both present or both absent
        const startPresent = startHour !== undefined && startHour !== null;
        const endPresent = endHour !== undefined && endHour !== null;
        if (startPresent !== endPresent) {
            push(
                "startHour/endHour",
                "startHour and endHour must both be provided or both omitted.",
            );
        }

        // Validate start/end hours if present
        if (startPresent && endPresent) {
            if (!Number.isInteger(startHour) || startHour < 0 || startHour > 23) {
                push("startHour", "startHour must be an integer between 0 and 23.");
            }
            if (!Number.isInteger(endHour) || endHour < 1 || endHour > 24) {
                push("endHour", "endHour must be an integer between 1 and 24.");
            }
            if (
                Number.isInteger(startHour) &&
                Number.isInteger(endHour) &&
                !(startHour < endHour)
            ) {
                push("startHour/endHour", "startHour must be less than endHour.");
            }
        }

        // Validate incrementMinutes
        if (incrementMinutes !== undefined && incrementMinutes !== null) {
            if (!Number.isInteger(incrementMinutes) || incrementMinutes <= 0) {
                push("incrementMinutes", "incrementMinutes must be a positive integer.");
            } else if (startPresent && endPresent) {
                const totalMinutes = (endHour - startHour) * 60;
                if (totalMinutes % incrementMinutes !== 0) {
                    push(
                        "incrementMinutes",
                        `incrementMinutes (${incrementMinutes}) does not divide the total window (${totalMinutes} minutes) evenly.`,
                    );
                }
            }
        }

        // Validate excludeTimes
        if (excludeTimes !== undefined && excludeTimes !== null) {
            if (!Array.isArray(excludeTimes)) {
                push("excludeTimes", "excludeTimes must be an array of time ranges.");
            } else {
                // Validate each range
                const normalized: { start: number; end: number; idx: number }[] = [];
                excludeTimes.forEach((r, idx: number) => {
                    const key = `excludeTimes[${idx}]`;
                    if (r == null || typeof r !== "object") {
                        push(key, "must be an object with startHour and endHour.");
                        return;
                    }
                    const s = r.startHour;
                    const e = r.endHour;
                    if (!Number.isInteger(s) || s < 0 || s > 23) {
                        push(key, "startHour must be an integer between 0 and 23.");
                    }
                    if (!Number.isInteger(e) || e < 1 || e > 24) {
                        push(key, "endHour must be an integer between 1 and 24.");
                    }
                    if (Number.isInteger(s) && Number.isInteger(e) && !(s < e)) {
                        push(key, "startHour must be less than endHour.");
                    }
                    if (Number.isInteger(s) && Number.isInteger(e)) {
                        normalized.push({ start: s, end: e, idx });
                    }
                });

                // If start/end window present, ensure exclude ranges lie inside it
                if (startPresent && endPresent && normalized.length > 0) {
                    normalized.forEach((nr) => {
                        if (nr.start < startHour || nr.end > endHour) {
                            push(
                                `excludeTimes[${nr.idx}]`,
                                `exclude range [${nr.start}, ${nr.end}) must lie within the working window [${startHour}, ${endHour}).`,
                            );
                        }
                    });
                }

                // Check for overlapping exclude ranges
                if (normalized.length > 1) {
                    normalized.sort((a, b) => a.start - b.start);
                    for (let i = 1; i < normalized.length; i++) {
                        const prev = normalized[i - 1];
                        const cur = normalized[i];
                        if (cur.start < prev.end) {
                            push(
                                `excludeTimes`,
                                `excludeTimes[${prev.idx}] [${prev.start}, ${prev.end}) overlaps with excludeTimes[${cur.idx}] [${cur.start}, ${cur.end}).`,
                            );
                        }
                    }
                }
            }
        }

        // If there are any errors, throw a BadRequestException with details
        if (Object.keys(errors).length > 0) {
            throw new BadRequestException({
                message: "Invalid CreateMonthDayOptions payload",
                errors,
            });
        }
    }
}
