import { INestApplication, ValidationPipe } from "@nestjs/common";
import { env } from "./env.config";

export default function ApplyConfigurations(app: INestApplication<any>) {
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
}

function exposeApiDocumentationInLogs() {
  if (env.NODE_ENV !== "development") return;
  console.log(`📚 Swagger API docs available at: http://localhost:${env.PORT ?? 5009}/swagger`);
  console.log(`🔖 Scalar API docs available at: http://localhost:${env.PORT ?? 5009}/docs`);
}

export const usePostBootstrap = () => {
  exposeApiDocumentationInLogs();
};
