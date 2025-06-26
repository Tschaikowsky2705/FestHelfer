// api/sendNotification.js

import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, name, shiftTitle } = req.body;

  // 1) Transporter mit GMX-SMTP konfigurieren
  let transporter;
  try {
    transporter = nodemailer.createTransport({
      host: "smtp.gmx.net",
      port: 587,
      secure: false, // TLS via STARTTLS
      auth: {
        user: process.env.open-air-kino.frauenkappelen@gmx.ch,    // Deine GMX-Adresse
        pass: process.env.CNAek24bhjcnM4i // Dein GMX-App-Passwort
      }
    });
  } catch (err) {
    console.error("🚨 Mail transporter init error:", err);
    return res.status(500).json({ error: "Mail transporter init failed" });
  }

  // 2) E-Mail an Uwe zusammenbauen
  const mailOptions = {
    from: `"FestHelfer App" <${process.env.GMX_USER}>`,
    to: "uwe.baumann@ortsverein-frauenkappelen.ch",
    subject: `Neue Helfer-Anmeldung: ${shiftTitle}`,
    text: `
Ein neuer Helfer hat sich angemeldet:

• Einsatz: ${shiftTitle}
• E-Mail:   ${email}
• Name:     ${name || "(nicht angegeben)"}

Grüsse,
Deine FestHelfer-App
    `.trim()
  };

  // 3) E-Mail verschicken
  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Notification sent to Uwe");
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("🚨 Mail send error:", err);
    return res.status(500).json({ error: "Failed to send mail" });
  }
}
