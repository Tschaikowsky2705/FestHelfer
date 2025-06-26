// api/sendNotification.js
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { email, name, shiftTitle } = req.body;

  // 1) SMTP-Zugangsdaten aus ENV ziehen
  const user = process.env.open-air-kino.frauenkappelen@gmx.ch;
  const pass = process.env.CNAek24bhjcnM4i;
  if (!user || !pass) {
    console.error('🚨 Missing GMX env vars', { user, pass });
    return res.status(500).json({ error: 'SMTP credentials not set' });
  }

  // 2) nodemailer-Transporter konfigurieren
  const transporter = nodemailer.createTransport({
    host: 'mail.gmx.net',
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  // 3) Mail-Optionen
  const mailOptions = {
    from: `"FestHelfer" <${user}>`,
    to: 'uwe.baumann@ortsverein-frauenkappelen.ch',
    subject: `Neue Helfer-Anmeldung: ${shiftTitle}`,
    text: `
Ein neuer Helfer hat sich registriert:

• E-Mail:   ${email}
• Name:     ${name || '(keine Angabe)'}
• Einsatz:  ${shiftTitle}
`,
  };

  // 4) Abschicken und Rückmeldung
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ sendMail success', info.response);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('❌ sendMail error', err);
    return res.status(500).json({ error: err.message });
  }
};
