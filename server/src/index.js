import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { createRepo } from "./db.js";
import cors from "cors";

const config = loadConfig();
const app = createApp({ config, repo: createRepo(config) });

app.use(cors({
  origin: config.FRONTEND_DOMAIN,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
  console.log(`Registration is ${config.registrationOpen ? "open" : "closed"}.`);
  if (config.clientDist) console.log(`Serving the client from ${config.clientDist}`);
});
