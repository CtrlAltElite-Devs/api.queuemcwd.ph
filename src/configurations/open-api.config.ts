import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function useSwagger(app: INestApplication<any>) {
  const config = new DocumentBuilder()
    .setTitle("Labres API")
    .setDescription("This is the official mcwd api")
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, documentFactory);
}
