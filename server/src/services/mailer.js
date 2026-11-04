import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    });
  }
  return transporter;
}

/**
 * Send an email. Development runs can log messages when SMTP is missing.
 * Production logs never include the message body (which may contain reset tokens).
 * Returns { delivered } so callers can react.
 */
export async function sendMail({ to, subject, text }) {
  if (!env.smtp.host) {
    if (env.isProd) console.warn('Email was not sent: SMTP is not configured.');
    else if (!env.isTest)
      console.info(`\n✉  Email (not sent — SMTP not configured)\nTo: ${to}\nSubject: ${subject}\n\n${text}\n`);
    return { delivered: false };
  }

  try {
    await getTransporter().sendMail({ from: env.mailFrom, to, subject, text });
    return { delivered: true };
  } catch (error) {
    console.error('Email could not be sent:', error.message);
    return { delivered: false };
  }
}
