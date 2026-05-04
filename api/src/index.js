import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, "../../.env.local");

dotenv.config({ path: rootEnvPath });
dotenv.config();

const port = Number(process.env.PORT || 4000);
const app = createApp();

app.listen(port, () => {
  console.log(`Green Table API listening on http://localhost:${port}`);
});
