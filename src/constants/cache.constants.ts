export function AdminKey(id: string): string {
    return `admin:${id}`;
}

export const AdminCacheTTL = 1000 * 10;
