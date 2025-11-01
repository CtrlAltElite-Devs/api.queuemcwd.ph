import { INestApplication, ValidationPipe } from "@nestjs/common";
import { env, resolvePort } from "./env.config";

export default function ApplyConfigurations(app: INestApplication<any>) {
  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
}

function exposeApiDocumentationInLogs() {
  if (env.NODE_ENV !== "development") return;
  const port = resolvePort();
  console.log(`📚 Swagger API docs available at: http://localhost:${port}/swagger`);
  console.log(`🔖 Scalar API docs available at: http://localhost:${port}/docs`);
}

export const usePostBootstrap = () => {
  exposeApiDocumentationInLogs();
};
