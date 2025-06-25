// /api/sendNotification.js
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const transporter = nodemailer.createTransport({
  host: 'mail.gmx.net',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMX_SMTP_USER,
    pass: process.env.GMX_SMTP_PASS,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ error: `Method ${req.method} Not Allowed` });
  }

  const { name, email, shiftTitle } = req.body;
  if (!name || !email || !shiftTitle) {
    return res
      .status(400)
      .json({ error: 'Fehlende Felder: name, email oder shiftTitle' });
  }

  // **Debug-Logs**
  console.log('Request Body:', req.body);
  console.log('SMTP user loaded?', !!process.env.GMX_SMTP_USER);

  // 1) Supabase eintrag
  try {
    const { error: dbError } = await supabase
      .from('registrations')
      .insert([{ name, email, shift_title: shiftTitle }]);
    if (dbError) throw dbError;
  } catch (err) {
    console.error('Supabase-Error:', err);
    return res
      .status(500)
      .json({ step: 'supabase', message: err.message });
  }

  // 2) Mail-Versand
  try {
    await transporter.sendMail({
      from: `"OpenAir Kino" <${process.env.GMX_SMTP_USER}>`,
      to:   'uwe.baumann@ortsverein-frauenkappelen.ch',
      subject: 'Neue Helfer-Registrierung',
      text:
        `Name: ${name}\n` +
        `E-Mail: ${email}\n` +
        `Einsatz: ${shiftTitle}`,
      html: `
        <p><strong>Name:</strong> ${name}<br/>
        <strong>E-Mail:</strong> ${email}<br/>
        <strong>Einsatz:</strong> ${shiftTitle}</p>
      `,
    });
  } catch (err) {
    console.error('Mail-Error:', err);
    return res
      .status(500)
      .json({ step: 'mail', message: err.message });
  }

  // wenn alles ok:
  return res.status(200).json({ success: true });
}
