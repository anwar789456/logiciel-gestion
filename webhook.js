const http = require("http");
const { exec } = require("child_process");
const crypto = require("crypto");


const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";
const DEPLOY_SCRIPT = "/var/www/logiciel-front/deploy.sh";

function verifySignature(payload, signature) {
  if (!WEBHOOK_SECRET) return true;
  const expected = "sha256=" + crypto.createHmac("sha256", WEBHOOK_SECRET).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature || ""));
  } catch {
    return false;
  }
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/wh-shfront-deploy") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const signature = req.headers["x-hub-signature-256"];
      if (!verifySignature(body, signature)) {
        console.warn("[Webhook] Invalid signature — request rejected.");
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      console.log("[GitHub] Frontend webhook received — deploying...");
      exec(`bash ${DEPLOY_SCRIPT}`, { timeout: 120000 }, (err, stdout, stderr) => {
        if (err) {
          console.error(`❌ Deployment error: ${err.message}`);
          return;
        }
        console.log(`✅ Deployment output:\n${stdout}`);
      });

      res.writeHead(200);
      res.end("Deployment started!");
    });
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

const PORT = 3011;
server.listen(PORT, () => {
  console.log(`🚀 Frontend webhook server listening on port ${PORT}`);
});
