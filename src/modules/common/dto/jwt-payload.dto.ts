export class JwtPayloadDto {
    adminId: string;

    static Create(adminId: string): JwtPayloadDto {
        return {
            adminId,
        };
    }
}
