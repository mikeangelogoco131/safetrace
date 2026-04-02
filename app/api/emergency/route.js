import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { Resend } from 'resend';

// Initialize the clients (they expect variables from .env.local)
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { contacts, userName, lat, lng } = await request.json();

    const alertMessage = `EMERGENCY ALERT: ${userName} has activated an emergency. Live Location: https://maps.google.com/?q=${lat},${lng}`;

    // Array to store all our async sending promises (SMS and Emails)
    const notificationPromises = [];

    for (const contact of contacts) {
      // 1. Dispatch SMS using Twilio
      if (contact.contact_phone && process.env.TWILIO_PHONE_NUMBER) {
        const smsPromise = twilioClient.messages.create({
          body: alertMessage,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: contact.contact_phone
        }).catch(err => console.error(`Twilio Error for ${contact.contact_phone}:`, err));
        
        notificationPromises.push(smsPromise);
      }

      // 2. Dispatch Email using Resend
      if (contact.contact_email && process.env.RESEND_API_KEY) {
        const emailPromise = resend.emails.send({
          from: 'SafeTrace Emergency <onboarding@resend.dev>', // If using free Resend tier, must use onboarding@resend.dev or verified domain
          to: contact.contact_email,
          subject: `🆘 URGENT: EMERGENCY ALERT from ${userName}`,
          html: `
            <h2 style="color: red;">🚨 Emergency Activated</h2>
            <p><strong>${userName}</strong> has triggered an emergency alert from the SafeTrace app.</p>
            <p><strong>Live Location Tracking Link:</strong></p>
            <a href="https://maps.google.com/?q=${lat},${lng}" style="font-size: 18px; font-weight: bold; color: blue;">Click to View Location on Google Maps</a>
          `,
        }).catch(err => console.error(`Resend Error for ${contact.contact_email}:`, err));

        notificationPromises.push(emailPromise);
      }
    }

    // Wait for all messages to fire off to Twilio/Resend simultaneously
    await Promise.all(notificationPromises);

    return NextResponse.json({ success: true, message: 'All active emergency notifications dispatched.' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
