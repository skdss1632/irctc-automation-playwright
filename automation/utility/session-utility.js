// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// // ESM replacement for __dirname
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const SESSION_FILE = path.join(__dirname, "../session-storage.json");

// async function saveSession(context) {
//   const cookies = await context.cookies();
//   const storage = await context.storageState();

//   fs.writeFileSync(
//     SESSION_FILE,
//     JSON.stringify({
//       cookies,
//       storage,
//       timestamp: Date.now(),
//     })
//   );

//   console.log("✅ Session saved");
// }

// async function loadSession(context) {
//   if (!fs.existsSync(SESSION_FILE)) {
//     console.log("ℹ️ No saved session found");
//     return false;
//   }

//   const data = JSON.parse(fs.readFileSync(SESSION_FILE, "utf-8"));

//   // Check if session is older than 1 hour
//   if (Date.now() - data.timestamp > 30000) {
//     console.log("⚠️ Session expired");
//     return false;
//   }

//   await context.addCookies(data.cookies);
//   console.log("✅ Session restored");
//   return true;
// }

// export { loadSession, saveSession };
