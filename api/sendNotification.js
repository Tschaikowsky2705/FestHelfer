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
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email } = req.body;

  // 1) In Supabase speichern
  const { error: dbError } = await supabase
    .from('registrations')
    .insert([{ name, email }]);

  if (dbError) {
    console.error('Supabase Error:', dbError);
    return res.status(500).json({ error: 'DB-Fehler' });
  }

  // 2) E-Mail an Uwe Baumann schicken
  try {
    await transporter.sendMail({
      from: `"OpenAir Kino" <${process.env.GMX_SMTP_USER}>`,
      to: 'uwe.baumann@ortsverein-frauenkappelen.ch',
      subject: 'Neue Anmeldung Open-Air-Kino',
      text: `Name: ${name}\nE-Mail: ${email}`,
      html: `<p><strong>Name:</strong> ${name}<br/><strong>E-Mail:</strong> ${email}</p>`,
    });
    return res.status(200).json({ success: true });
  } catch (mailErr) {
    console.error('Mail-Error:', mailErr);
    return res.status(500).json({ error: 'Mailversand fehlgeschlagen' });
  }
}
