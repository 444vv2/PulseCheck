import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

function getAllowedOrigins(): string[] {
  const configuredOrigins = (process.env.WEB_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const allowedOrigins = new Set<string>(configuredOrigins);

  for (const origin of configuredOrigins) {
    try {
      const url = new URL(origin);
      const port = url.port ? `:${url.port}` : "";

      if (url.hostname !== "localhost") {
        allowedOrigins.add(`${url.protocol}//localhost${port}`);
      }

      if (url.hostname !== "127.0.0.1") {
        allowedOrigins.add(`${url.protocol}//127.0.0.1${port}`);
      }
    } catch {
      continue;
    }
  }

  return [...allowedOrigins];
}

function isDevCorsPermissive(): boolean {
  return (process.env.NODE_ENV ?? "development") !== "production";
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = getAllowedOrigins();

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || isDevCorsPermissive() || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
}

void bootstrap();
