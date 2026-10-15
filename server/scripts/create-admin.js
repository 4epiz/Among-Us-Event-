/**
 * Creates an admin account, or resets the password of an existing one.
 *
 *   npm run create-admin -- <username>
 *
 * You'll be asked for the password twice; it isn't shown while you type.
 * Only the bcrypt hash is stored in Supabase.
 */
import { createInterface } from "node:readline";
import bcrypt from "bcryptjs";
import { createRepo } from "../src/db.js";
import { loadDbConfig } from "../src/config.js";

const username = (process.argv[2] || "").trim();
if (!/^[a-zA-Z0-9_.-]{3,40}$/.test(username)) {
  console.error("Usage: npm run create-admin -- <username>");
  console.error("Usernames are 3-40 characters: letters, numbers, dot, dash, underscore.");
  process.exit(1);
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl.stdoutMuted = false;
    rl._writeToOutput = (str) => {
      if (!rl.stdoutMuted) rl.output.write(str);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    rl.stdoutMuted = true;
  });
}

const password = await askHidden("Password (min 12 characters): ");
if (password.length < 12) {
  console.error("Password must be at least 12 characters.");
  process.exit(1);
}
const confirm = await askHidden("Repeat password: ");
if (password !== confirm) {
  console.error("Passwords don't match.");
  process.exit(1);
}

const repo = createRepo(loadDbConfig());
try {
  await repo.upsertAdmin(username, await bcrypt.hash(password, 12));
  console.log(`Admin "${username}" saved. Log in at /admin.`);
} catch (err) {
  console.error(err.message);
  if (/relation "admins" does not exist/.test(err.message)) console.error("Run `npm run db:setup` first.");
  process.exitCode = 1;
} finally {
  await repo.close();
}
