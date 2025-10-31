import { INestApplication, VersioningType } from "@nestjs/common";

export function UseApiVersioning(app: INestApplication) {
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });
}
