import { INestApplication } from "@nestjs/common";

export default function ApplyCorsConfigurations(app: INestApplication<any>) {
    app.enableCors({
        origin: true,
        credentials: true,
        exposedHeaders: ["Content-Disposition"],
    });
}
