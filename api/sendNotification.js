// /api/sendNotification.js

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Supabase-Client initialisieren
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Nodemailer-Transporter mit GMX-SMTP
const transporter = nodemailer.createTransport({
  host: 'mail.gmx.net',
  port: 587,
  secure: false, // TLS wird mit STARTTLS ausgehandelt
  auth: {
    user: process.env.GMX_SMTP_USER,
    pass: process.env.GMX_SMTP_PASS,
  },
});

// Serverless-Function-Handler
export default async function handler(req, res) {
  // Nur POST-Anfragen akzeptieren
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { name, email, shiftTitle } = req.body;

  // Pflichtfelder prüfen
  if (!name || !email || !shiftTitle) {
    return res.status(400).json({ error: 'Fehlende Felder: name, email, shiftTitle' });
  }

  // 1) In Supabase speichern
  const { error: dbError } = await supabase
    .from('registrations')
    .insert([{
      name,
      email,
      shift_title: shiftTitle, // Spalte in deiner DB
    }]);

  if (dbError) {
    console.error('Supabase Error:', dbError);
    return res.status(500).json({ error: 'Datenbank-Fehler beim Speichern' });
  }

  // 2) E-Mail an Uwe Baumann senden
  try {
    await transporter.sendMail({
      from: `"OpenAir Kino" <${process.env.GMX_SMTP_USER}>`,
      to: 'uwe.baumann@ortsverein-frauenkappelen.ch',
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
  } catch (mailError) {
    console.error('Mail send error:', mailError);
    return res.status(500).json({ error: 'Fehler beim Senden der Benachrichtigungs-Mail' });
  }

  // Erfolg
  return res.status(200).json({ success: true });
}
