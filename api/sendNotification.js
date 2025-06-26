// api/sendNotification.js

// 1) nodemailer mit CommonJS einbinden
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { email, name, shiftTitle } = req.body;

  // 2) SMTP-Daten aus ENV
  const user = process.env.open-air-kino.frauenkappelen@gmx.ch;
  const pass = process.env.CNAek24bhjcnM4i;
  if (!user || !pass) {
    console.error('🚨 Missing GMX env vars', { user, pass });
    return res.status(500).json({ error: 'SMTP credentials not set' });
  }

  // 3) Transporter anlegen
  const transporter = nodemailer.createTransport({
    host: 'mail.gmx.net',
    port: 587,
    secure: false,           // TLS später
    auth: { user, pass }
  });

  // 4) Mail-Optionen
  const mailOptions = {
    from: `"FestHelfer" <${user}>`,
    to: 'uwe.baumann@ortsverein-frauenkappelen.ch',
    subject: `Neue Helfer-Anmeldung: ${shiftTitle}`,
    text: `
Ein neuer Helfer hat sich registriert:

• E-Mail:   ${email}
• Name:     ${name || '(keine Angabe)'}
• Einsatz:  ${shiftTitle}
`
  };

  // 5) Abschicken und Fehler abfangen
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ sendMail success', info);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('❌ sendMail error', err);
    return res.status(500).json({ error: err.message });
  }
};
