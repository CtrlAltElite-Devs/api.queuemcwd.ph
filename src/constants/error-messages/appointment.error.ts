export enum SlotErrors {
    SLOT_ID_NOT_FOUND = "Slot ID not found",
    SLOT_NOT_ON_WORKING_DAY = "Slot is not on a working day",
    SLOT_ALREADY_ENDED = "Slot has already ended",
    SLOT_NOT_ACTIVE = "Slot is not active",
    SLOT_TODAY_NOT_ALLOWED = "You cannot create an appointment for today",
    SLOT_DATE_PASSED = "Slot date has already passed",
    SLOT_FULL = "Slot is already full",
}

export const SLOT_TOO_FAR = (allowedTimeFrame: number) => {
    return `Cannot create an appointment on slots ${allowedTimeFrame} days in the future`;
};
