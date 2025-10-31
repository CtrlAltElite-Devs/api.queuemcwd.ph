import { defineConfig, MySqlDriver } from "@mikro-orm/mysql";
import { entities } from "./src/entities/index.entity";
import { Migrator } from "@mikro-orm/migrations";
import { SeedManager } from "@mikro-orm/seeder";
import { env } from "./src/configurations/env.config";

export default defineConfig({
  driver: MySqlDriver,
  clientUrl: env.DATABASE_URL,
  entities: entities,
  extensions: [Migrator, SeedManager],
  driverOptions: {
    connection: {
      ssl: false,
    },
  },
  timezone: "Z",
  debug: true,
  migrations: {
    path: "dist/src/migrations",
    pathTs: "src/migrations",
  },
  seeder: {
    path: "dist/src/seeders",
    pathTs: "src/seeders",
  },
});
