import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { jwtEnv } from "src/configurations/env/jwt.env";
import { JwtPayloadDto } from "./dto/jwt-payload.dto";

export type SignedAuthenticationPayload = {
    accessToken: string;
};

@Injectable()
export class CustomJwtService {
    constructor(private readonly jwtService: JwtService) {}

    async CreateSignedTokens(payload: JwtPayloadDto): Promise<SignedAuthenticationPayload> {
        const signedToken = await this.jwtService.signAsync(payload);

        return {
            accessToken: signedToken,
        };
    }

    async VerifyAndDecodeAccessToken(accessToken: string): Promise<JwtPayloadDto> {
        return await this.jwtService.verifyAsync<JwtPayloadDto>(accessToken, {
            secret: jwtEnv.JWT_SECRET,
        });
    }
}
