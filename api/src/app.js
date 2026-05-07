import cors from "cors";
import express from "express";
import morgan from "morgan";
import { router as apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"]
    })
  );
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (_request, response) => {
    response.json({
      ok: true,
      service: "root-and-recepie-api"
    });
  });

  app.use("/api", apiRouter);

  return app;
}
