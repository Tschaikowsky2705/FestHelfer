// api/sendNotification.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  const { email, name, shiftTitle } = req.body;
  if (!email || !shiftTitle) {
    res.status(400).json({ error: 'Fehlende Felder' });
    return;
  }

  // 1) Nodemailer-Transporter mit GMX-SMTP
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmx.net',
    port: 587,
    secure: false,          // TLS später
    auth: {
      user: process.env.GMX_USER,
      pass: process.env.GMX_PASS
    }
  });

  // 2) E-Mail an Uwe
  try {
    await transporter.sendMail({
      from: `"FestHelfer" <${process.env.GMX_USER}>`,
      to:   'uwe.baumann@ortsverein-frauenkappelen.ch',
      subject: `Neue Helfer-Registrierung: ${shiftTitle}`,
      text: `
Ein neuer Helfer hat sich angemeldet:

Name:   ${name || '(kein Name)'}
E-Mail: ${email}
Einsatz: ${shiftTitle}
      `
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('GMX-Mail-Error:', err);
    res.status(500).json({ error: 'Mailversand fehlgeschlagen' });
  }
}
