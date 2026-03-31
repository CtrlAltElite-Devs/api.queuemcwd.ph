import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as crypto from "crypto";
import { jwtEnv } from "src/configurations/env/jwt.env";
import { v4 as uuidv4 } from "uuid";
import { JwtPayloadDto } from "./dto/jwt-payload.dto";
import { RedisService } from "./redis-service";

export type SignedAuthenticationPayload = {
    accessToken: string;
    refreshToken: string;
};

const ACCESS_TOKEN_EXPIRY = "300s";
const REFRESH_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

@Injectable()
export class CustomJwtService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
    ) {}

    async CreateSignedTokens(payload: JwtPayloadDto): Promise<SignedAuthenticationPayload> {
        const tokenFamily = uuidv4();

        const accessToken = await this.jwtService.signAsync(
            { adminId: payload.adminId },
            {
                secret: jwtEnv.JWT_SECRET,
                expiresIn: ACCESS_TOKEN_EXPIRY,
            },
        );

        const refreshToken = await this.jwtService.signAsync(
            { adminId: payload.adminId, family: tokenFamily },
            {
                secret: jwtEnv.JWT_REFRESH_SECRET,
                expiresIn: REFRESH_TOKEN_EXPIRY_SECONDS,
            },
        );

        const hashedToken = this.hashToken(refreshToken);
        const redisKey = `refresh:${payload.adminId}:${tokenFamily}`;
        await this.redisService.Set(redisKey, hashedToken, REFRESH_TOKEN_EXPIRY_SECONDS);

        return { accessToken, refreshToken };
    }

    async VerifyAndDecodeAccessToken(accessToken: string): Promise<JwtPayloadDto> {
        return await this.jwtService.verifyAsync<JwtPayloadDto>(accessToken, {
            secret: jwtEnv.JWT_SECRET,
        });
    }

    async RotateRefreshToken(oldRefreshToken: string): Promise<SignedAuthenticationPayload> {
        const decoded = await this.jwtService
            .verifyAsync<{
                adminId: string;
                family: string;
            }>(oldRefreshToken, { secret: jwtEnv.JWT_REFRESH_SECRET })
            .catch(() => {
                throw new UnauthorizedException("Invalid or expired refresh token");
            });

        const redisKey = `refresh:${decoded.adminId}:${decoded.family}`;
        const storedHash = await this.redisService.Get(redisKey);

        if (!storedHash || storedHash !== this.hashToken(oldRefreshToken)) {
            await this.redisService.Del(redisKey);
            throw new UnauthorizedException("Invalid refresh token");
        }

        await this.redisService.Del(redisKey);

        return this.CreateSignedTokens(JwtPayloadDto.Create(decoded.adminId));
    }

    async InvalidateRefreshTokensForAdmin(adminId: string): Promise<void> {
        await this.redisService.invalidateByPattern(`refresh:${adminId}:*`);
    }

    private hashToken(token: string): string {
        return crypto.createHash("sha256").update(token).digest("hex");
    }
}
