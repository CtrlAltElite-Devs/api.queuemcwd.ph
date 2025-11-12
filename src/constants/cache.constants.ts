export const AdminKey = (id: string) => `admin:${id}`;
export const BranchKey = (id: string) => `branch:${id}`;
export const MonthDayKey = (id: string) => `monthDay:${id}`;
export const SlotKey = (id: string) => `slot:${id}`;

export const AdminCacheTTL = 9000 * 10;
export const BranchCacheTTL = 10 * 60 * 1000;
export const MonthDayTTL = 30 * 1000;
export const SlotTTL = 30 * 1000;
