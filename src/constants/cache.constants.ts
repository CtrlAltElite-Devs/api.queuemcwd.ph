export const AdminKey = (id: string) => `admin:${id}`;
export const BranchKey = (id: string) => `branch:${id}`;
export const MonthDayKey = (id: string) => `monthDay:${id}`;
export const SlotKey = (id: string) => `slot:${id}`;

export const AdminCacheTTL = 90;
export const BranchCacheTTL = 30;
export const MonthDayTTL = 30;
export const SlotTTL = 30;

export const BranchDataCacheKey = "branch:data";
export const BranchDataCacheTTL = 120 * 1000;

export const determineCacheInvalidationKeys = (keys: string | string[]): string[] => {
    if (!Array.isArray(keys)) keys = [keys];

    const invalidationKeys: string[] = [];

    keys.forEach((key) => {
        // Admin-specific
        if (key.startsWith("admin:")) {
            invalidationKeys.push(key);
        }

        // Branch-specific
        if (key.startsWith("branch:")) {
            invalidationKeys.push(key);
            invalidationKeys.push(`${BranchDataCacheKey}:*`);
        }

        // MonthDay-specific
        if (key.startsWith("monthDay:")) {
            invalidationKeys.push(key);
            invalidationKeys.push(`${BranchDataCacheKey}:*`);
        }

        // Slot-specific
        if (key.startsWith("slot:")) {
            invalidationKeys.push(key);
            invalidationKeys.push(`${BranchDataCacheKey}:*`);
        }

        // Any key that already uses the unified prefix
        if (key.startsWith(BranchDataCacheKey)) {
            invalidationKeys.push(`${BranchDataCacheKey}:*`);
        }
    });

    // Deduplicate
    return Array.from(new Set(invalidationKeys));
};
