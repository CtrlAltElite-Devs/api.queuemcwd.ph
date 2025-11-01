import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";

export default function UseApiDocumentations(app: INestApplication) {
    const config = new DocumentBuilder()
        .setTitle("Labres API")
        .setDescription("This is the official MCWD API")
        .setVersion("1.0")
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);

    // Optional: Keep Swagger UI at /swagger if you want
    SwaggerModule.setup("swagger", app, documentFactory);

    // ✅ Add Scalar UI at /docs (or any path you prefer)
    app.use(
        "/docs",
        apiReference({
            content: documentFactory(),
            theme: "elysiajs",
            layout: "classic",
        }),
    );
}
