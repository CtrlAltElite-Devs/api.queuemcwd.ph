export function generateAppointmentCode(): string {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const randomPart = Array.from({ length: 4 }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length)),
    ).join("");

    const dayPart = new Date().getDate().toString().padStart(2, "0"); // e.g., 28 → "28"
    return `${dayPart}${randomPart}`; // e.g., "28QW7R"
}
