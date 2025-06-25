// pages/api/sendRegistration.js

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email } = req.body;

  // SMTP-Daten aus Umgebungsvariablen:
  // GMX_SMTP_USER, GMX_SMTP_PASS
  const transporter = nodemailer.createTransport({
    host: 'mail.gmx.net',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMX_SMTP_USER,
      pass: process.env.GMX_SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"OpenAir Kino" <${process.env.GMX_SMTP_USER}>`,
      to: 'uwe.baumann@ortsverein-frauenkappelen.ch',
      subject: 'Neue Anmeldung Open-Air-Kino',
      text: `Name: ${name}\nE-Mail: ${email}`,
      html: `<p><strong>Name:</strong> ${name}<br/><strong>E-Mail:</strong> ${email}</p>`,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Mail-Error:', err);
    return res.status(500).json({ error: 'Mailversand fehlgeschlagen' });
  }
}
