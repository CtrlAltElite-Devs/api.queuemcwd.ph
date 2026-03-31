import { ApiProperty } from "@nestjs/swagger";

export class PaginationMeta {
    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    total: number;

    @ApiProperty()
    totalPages: number;
}

export class PaginatedResult<T> {
    data: T[];
    meta: PaginationMeta;

    static create<T>(data: T[], total: number, page: number, limit: number): PaginatedResult<T> {
        const result = new PaginatedResult<T>();
        result.data = data;
        result.meta = {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
        return result;
    }
}
