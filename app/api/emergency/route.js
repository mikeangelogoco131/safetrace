import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { buildMapsUrl, normalizeE164Phone, safeErrorMessage } from '@/utils/helpers';

// Initialize clients lazily so the route can build even if an env var is missing.
function getTwilioClient() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }

  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  return new Resend(process.env.RESEND_API_KEY);
}

function getSupabaseServerClient(accessToken) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

export async function POST(request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Server is missing Supabase configuration.' }, { status: 500 });
    }

    const authHeader = request.headers.get('authorization') || '';
    const accessToken = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7) : '';

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { lat, lng, accuracy, capturedAt } = await request.json();
    const latitude = Number(lat);
    const longitude = Number(lng);
    const locationAccuracy = accuracy == null ? null : Number(accuracy);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ error: 'Invalid location payload.' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient(accessToken);
    const { data: userResult, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userResult?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const user = userResult.user;
    const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).maybeSingle();
    const userName = profile?.name || user.email || 'A SafeTrace user';
    const mapsUrl = buildMapsUrl(latitude, longitude);
    const alertMessage = `EMERGENCY ALERT: ${userName} has activated an emergency. Live Location: ${mapsUrl}`;

    const { data: recentAlert } = await supabase
      .from('alerts')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentAlert?.created_at) {
      const lastAlertTime = new Date(recentAlert.created_at).getTime();
      if (Number.isFinite(lastAlertTime) && Date.now() - lastAlertTime < 60000) {
        return NextResponse.json({ error: 'Emergency alerts are temporarily rate limited. Please wait a minute and try again.' }, { status: 429 });
      }
    }

    const { data: alertRow, error: alertError } = await supabase
      .from('alerts')
      .insert([
        {
          user_id: user.id,
          latitude,
          longitude,
          accuracy_m: locationAccuracy,
          captured_at: capturedAt || new Date().toISOString(),
        },
      ])
      .select('id')
      .single();

    if (alertError) {
      throw alertError;
    }

    const { data: contacts, error: contactsError } = await supabase
      .from('emergency_contacts')
      .select('id, contact_name, contact_phone, contact_email')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (contactsError) {
      throw contactsError;
    }

    const twilioClient = getTwilioClient();
    const resend = getResendClient();
    const senderAddress = process.env.RESEND_FROM_EMAIL || 'SafeTrace Emergency <onboarding@resend.dev>';
    const attemptRows = [];
    const results = [];

    for (const contact of contacts || []) {
      const contactSummary = { contactId: contact.id, contactName: contact.contact_name, statuses: [] };

      const normalizedPhone = normalizeE164Phone(contact.contact_phone);
      if (normalizedPhone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
          const smsResult = await twilioClient.messages.create({
            body: alertMessage,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: normalizedPhone,
          });

          attemptRows.push({
            alert_id: alertRow.id,
            user_id: user.id,
            contact_id: contact.id,
            channel: 'sms',
            destination: normalizedPhone,
            provider: 'twilio',
            status: 'sent',
            provider_message_id: smsResult.sid || null,
            error_message: null,
          });

          contactSummary.statuses.push({ channel: 'sms', status: 'sent', destination: normalizedPhone });
        } catch (error) {
          const errorMessage = safeErrorMessage(error);
          console.error('[emergency-route] Twilio send failed', { contactId: contact.id, error: errorMessage });
          attemptRows.push({
            alert_id: alertRow.id,
            user_id: user.id,
            contact_id: contact.id,
            channel: 'sms',
            destination: normalizedPhone,
            provider: 'twilio',
            status: 'failed',
            provider_message_id: null,
            error_message: errorMessage,
          });

          contactSummary.statuses.push({ channel: 'sms', status: 'failed', destination: normalizedPhone, message: errorMessage });
        }
      } else if (contact.contact_phone) {
        const message = normalizedPhone
          ? 'Twilio is not configured on the server.'
          : 'Phone number must include a country code, for example +639123456789.';

        attemptRows.push({
          alert_id: alertRow.id,
          user_id: user.id,
          contact_id: contact.id,
          channel: 'sms',
          destination: String(contact.contact_phone),
          provider: 'twilio',
          status: normalizedPhone ? 'skipped_missing_config' : 'skipped_invalid_phone',
          provider_message_id: null,
          error_message: message,
        });

        contactSummary.statuses.push({
          channel: 'sms',
          status: normalizedPhone ? 'skipped_missing_config' : 'skipped_invalid_phone',
          destination: String(contact.contact_phone),
          message,
        });
      }

      if (contact.contact_email && process.env.RESEND_API_KEY) {
        try {
          const emailResult = await resend.emails.send({
            from: senderAddress,
            to: contact.contact_email,
            subject: `URGENT: Emergency Alert from ${userName}`,
            html: `
              <h2 style="color: red;">Emergency Activated</h2>
              <p><strong>${userName}</strong> has triggered an emergency alert from the SafeTrace app.</p>
              <p><strong>Live Location Tracking Link:</strong></p>
              <a href="${mapsUrl}" style="font-size: 18px; font-weight: bold; color: blue;">Click to View Location on Google Maps</a>
            `,
          });

          attemptRows.push({
            alert_id: alertRow.id,
            user_id: user.id,
            contact_id: contact.id,
            channel: 'email',
            destination: contact.contact_email,
            provider: 'resend',
            status: 'sent',
            provider_message_id: emailResult?.data?.id || null,
            error_message: null,
          });

          contactSummary.statuses.push({ channel: 'email', status: 'sent', destination: contact.contact_email });
        } catch (error) {
          const errorMessage = safeErrorMessage(error);
          console.error('[emergency-route] Resend send failed', { contactId: contact.id, error: errorMessage });
          attemptRows.push({
            alert_id: alertRow.id,
            user_id: user.id,
            contact_id: contact.id,
            channel: 'email',
            destination: contact.contact_email,
            provider: 'resend',
            status: 'failed',
            provider_message_id: null,
            error_message: errorMessage,
          });

          contactSummary.statuses.push({ channel: 'email', status: 'failed', destination: contact.contact_email, message: errorMessage });
        }
      } else if (contact.contact_email) {
        const message = 'Resend is not configured on the server.';

        attemptRows.push({
          alert_id: alertRow.id,
          user_id: user.id,
          contact_id: contact.id,
          channel: 'email',
          destination: contact.contact_email,
          provider: 'resend',
          status: 'skipped_missing_config',
          provider_message_id: null,
          error_message: message,
        });

        contactSummary.statuses.push({ channel: 'email', status: 'skipped_missing_config', destination: contact.contact_email, message });
      }

      if (contactSummary.statuses.length === 0) {
        contactSummary.statuses.push({
          channel: 'contact',
          status: 'skipped_missing_destination',
          message: 'This contact does not have a phone number or email address to notify.',
        });
      }

      results.push(contactSummary);
    }

    if (attemptRows.length > 0) {
      const { error: attemptError } = await supabase.from('emergency_notification_attempts').insert(attemptRows);
      if (attemptError) {
        console.error('[emergency-route] Failed to persist notification attempts', safeErrorMessage(attemptError));
      }
    }

    const deliverySummary = results.reduce(
      (summary, contact) => {
        for (const status of contact.statuses) {
          summary.total += 1;
          if (status.status === 'sent') {
            summary.sent += 1;
          } else if (status.status === 'failed') {
            summary.failed += 1;
          } else {
            summary.skipped += 1;
          }
        }

        return summary;
      },
      { total: 0, sent: 0, failed: 0, skipped: 0 }
    );
    const failures = deliverySummary.failed > 0 || deliverySummary.skipped > 0;
    const message = results.length === 0
      ? 'Emergency alert recorded, but no emergency contacts are saved yet.'
      : failures
        ? `Emergency alert recorded. Sent ${deliverySummary.sent} notification(s); ${deliverySummary.failed} failed and ${deliverySummary.skipped} skipped.`
        : 'Emergency alert recorded and all active notifications were sent.';

    return NextResponse.json({
      success: true,
      alertId: alertRow.id,
      message,
      summary: deliverySummary,
      contacts: results,
    });
  } catch (error) {
    console.error('[emergency-route] API Error:', safeErrorMessage(error));
    return NextResponse.json({ error: 'Unable to dispatch emergency alert.' }, { status: 500 });
  }
}
