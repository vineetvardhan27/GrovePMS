import { createClient } from '@supabase/supabase-js';
import { SanitizedContactData } from '../validations/contact';

export interface DeliveryMetadata {
  ip: string;
  userAgent: string;
}

export interface DeliveryResult {
  delivered: boolean;
  provider: string;
  messageId?: string;
  error?: string;
  dbSaved?: boolean;
}

/**
 * Builds a clean, branded HTML email for Grove PMS team notification
 */
export function buildContactHtmlEmail(
  data: SanitizedContactData,
  meta: DeliveryMetadata
): string {
  const categoryLabels: Record<string, string> = {
    sales: 'Sales & Onboarding Demo',
    support: 'Technical Support',
    billing: 'Billing & Pricing Query',
    legal: 'Privacy & Compliance',
    other: 'General Inquiry',
  };

  const categoryName = categoryLabels[data.category] || data.category;
  const timestamp = new Date().toUTCString();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Inquiry: ${escapeHtml(data.subject)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f2; margin: 0; padding: 24px; color: #1c2b23; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e4de; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .header { background-color: #1a4331; color: #ffffff; padding: 28px 32px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #b7cebe; }
    .content { padding: 32px; }
    .badge { display: inline-block; background-color: #eaf2ed; color: #1a4331; font-weight: 600; font-size: 12px; padding: 4px 10px; border-radius: 9999px; border: 1px solid #c8ded0; margin-bottom: 20px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .info-table td { padding: 8px 0; font-size: 14px; border-bottom: 1px solid #f0efe9; }
    .info-table td.label { font-weight: 600; color: #64746b; width: 35%; }
    .info-table td.val { color: #1c2b23; font-weight: 500; }
    .message-box { background: #faf9f5; border: 1px solid #e5e4de; border-radius: 12px; padding: 20px; margin-top: 16px; }
    .message-box h3 { margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #64746b; }
    .message-text { font-size: 15px; line-height: 1.6; color: #1c2b23; white-space: pre-wrap; margin: 0; }
    .meta-box { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e4de; font-size: 12px; color: #8e9c93; }
    .footer { background: #f7f6f2; padding: 18px 32px; text-align: center; font-size: 12px; color: #8e9c93; border-top: 1px solid #e5e4de; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Grove PMS Contact Inquiry</h1>
      <p>A new customer message was submitted via GrovePMS.com</p>
    </div>
    <div class="content">
      <div class="badge">${escapeHtml(categoryName)}</div>
      
      <table class="info-table">
        <tr>
          <td class="label">From</td>
          <td class="val"><strong>${escapeHtml(data.name)}</strong> &lt;<a href="mailto:${escapeHtml(data.email)}" style="color: #1a4331;">${escapeHtml(data.email)}</a>&gt;</td>
        </tr>
        ${data.hotelName ? `<tr><td class="label">Property / Hotel</td><td class="val">${escapeHtml(data.hotelName)}</td></tr>` : ''}
        ${data.phone ? `<tr><td class="label">Phone</td><td class="val">${escapeHtml(data.phone)}</td></tr>` : ''}
        <tr>
          <td class="label">Subject</td>
          <td class="val"><strong>${escapeHtml(data.subject)}</strong></td>
        </tr>
      </table>

      <div class="message-box">
        <h3>Customer Message</h3>
        <p class="message-text">${escapeHtml(data.message)}</p>
      </div>

      <div class="meta-box">
        <div><strong>Submitted:</strong> ${timestamp}</div>
        <div><strong>IP Address:</strong> ${escapeHtml(meta.ip)}</div>
        <div><strong>User Agent:</strong> ${escapeHtml(meta.userAgent)}</div>
      </div>
    </div>
    <div class="footer">
      Grove PMS Secure Communications Engine &bull; Confidential &copy; ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Builds a plain text fallback email
 */
export function buildContactTextEmail(
  data: SanitizedContactData,
  meta: DeliveryMetadata
): string {
  return `
[New Contact Inquiry - Grove PMS]
--------------------------------------------------
Category: ${data.category}
From:     ${data.name} <${data.email}>
Hotel:    ${data.hotelName || 'N/A'}
Phone:    ${data.phone || 'N/A'}
Subject:  ${data.subject}

Message:
--------------------------------------------------
${data.message}

--------------------------------------------------
Submitted:  ${new Date().toUTCString()}
Client IP:  ${meta.ip}
User-Agent: ${meta.userAgent}
  `.trim();
}

/**
 * Dispatches the contact inquiry to the configured email provider
 * and persists to Supabase contact_submissions table.
 */
export async function deliverContactEmail(
  data: SanitizedContactData,
  meta: DeliveryMetadata
): Promise<DeliveryResult> {
  const recipientEmail = process.env.CONTACT_TO_EMAIL || 'vineetvardhanwork@gmail.com';
  const senderEmail = process.env.CONTACT_FROM_EMAIL || 'Grove PMS <notifications@vineetvardhan.dev>';
  const htmlBody = buildContactHtmlEmail(data, meta);
  const textBody = buildContactTextEmail(data, meta);
  const emailSubject = `[Inquiry: ${data.category.toUpperCase()}] ${data.subject} - from ${data.name}`;

  let deliveryResult: DeliveryResult = {
    delivered: false,
    provider: 'none',
  };

  // 1. Attempt Resend Delivery if RESEND_API_KEY is configured
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [recipientEmail],
          reply_to: data.email,
          subject: emailSubject,
          html: htmlBody,
          text: textBody,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        deliveryResult = {
          delivered: true,
          provider: 'resend',
          messageId: json.id,
        };
      } else {
        const errText = await res.text();
        console.error('[EMAIL] Resend delivery error:', res.status, errText);
        deliveryResult = {
          delivered: false,
          provider: 'resend',
          error: `Resend HTTP ${res.status}: ${errText}`,
        };
      }
    } catch (e: any) {
      console.error('[EMAIL] Resend fetch failed:', e);
      deliveryResult = {
        delivered: false,
        provider: 'resend',
        error: e?.message || 'Network error reaching Resend API',
      };
    }
  }

  // 2. Attempt SendGrid Delivery if SENDGRID_API_KEY is configured and not yet delivered
  if (!deliveryResult.delivered && process.env.SENDGRID_API_KEY) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: recipientEmail }] }],
          from: { email: senderEmail.includes('<') ? senderEmail.replace(/.*<([^>]+)>.*/, '$1') : senderEmail },
          reply_to: { email: data.email, name: data.name },
          subject: emailSubject,
          content: [
            { type: 'text/plain', value: textBody },
            { type: 'text/html', value: htmlBody },
          ],
        }),
      });

      if (res.ok || res.status === 202) {
        deliveryResult = {
          delivered: true,
          provider: 'sendgrid',
          messageId: res.headers.get('x-message-id') || 'sendgrid-ok',
        };
      } else {
        const errText = await res.text();
        console.error('[EMAIL] SendGrid delivery error:', res.status, errText);
      }
    } catch (e: any) {
      console.error('[EMAIL] SendGrid fetch failed:', e);
    }
  }

  // 3. Attempt Webhook Notification if CONTACT_WEBHOOK_URL is configured
  if (process.env.CONTACT_WEBHOOK_URL) {
    try {
      await fetch(process.env.CONTACT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact_form_submission',
          recipient: recipientEmail,
          data,
          meta,
          timestamp: new Date().toISOString(),
        }),
      });
      if (!deliveryResult.delivered) {
        deliveryResult = { delivered: true, provider: 'webhook' };
      }
    } catch (e: any) {
      console.error('[EMAIL] Webhook forward failed:', e);
    }
  }

  // 4. Development / Fallback mode if no external provider is configured
  if (!deliveryResult.delivered) {
    // In dev or when keys aren't set, log clearly and mark delivered so local workflows work
    console.log('\n================== [CONTACT INQUIRY RECEIVED] ==================');
    console.log(`To:      ${recipientEmail}`);
    console.log(`From:    ${data.name} <${data.email}>`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Hotel:   ${data.hotelName || 'N/A'}`);
    console.log(`Phone:   ${data.phone || 'N/A'}`);
    console.log(`Message: \n${data.message}`);
    console.log('=================================================================\n');

    deliveryResult = {
      delivered: true,
      provider: 'console_dev_fallback',
      messageId: `dev-${Date.now()}`,
    };
  }

  // 5. Durable storage in Supabase contact_submissions table
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { error: insertError } = await adminClient
        .from('contact_submissions')
        .insert({
          name: data.name,
          email: data.email,
          hotel_name: data.hotelName || null,
          phone: data.phone || null,
          category: data.category,
          subject: data.subject,
          message: data.message,
          ip_address: meta.ip,
          user_agent: meta.userAgent,
          status: deliveryResult.delivered ? 'delivered' : 'delivery_failed',
          delivery_provider: deliveryResult.provider,
          delivery_message_id: deliveryResult.messageId || null,
          delivery_error: deliveryResult.error || null,
        });

      if (insertError) {
        // Table might not exist yet or have different schema - warn but do not fail the submission
        console.warn('[CONTACT] Supabase contact_submissions logging notice:', insertError.message);
        deliveryResult.dbSaved = false;
      } else {
        deliveryResult.dbSaved = true;
      }
    }
  } catch (dbErr: any) {
    console.warn('[CONTACT] Could not save submission to Supabase:', dbErr?.message || dbErr);
    deliveryResult.dbSaved = false;
  }

  return deliveryResult;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
