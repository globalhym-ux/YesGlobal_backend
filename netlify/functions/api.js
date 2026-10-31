const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

// 1. Supabase Initialization
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pzrmkiawjawjwuyjwmeo.supabase.co'; // 👈 Apna Supabase URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

exports.handler = async (event) => {
    // 2. CORS Headers (Localhost + Live Website dono ke liye completely open)
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };

    // Preflight (Browser ka pehla test check)
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== "POST") {
        return { 
            statusCode: 405, 
            headers,
            body: JSON.stringify({ error: "Method Not Allowed" }) 
        };
    }

    try {
        const data = JSON.parse(event.body || '{}');
        const { name, email, phone, subject, message, visitor_id } = data;

        const cleanName = name && name.trim() !== '' ? name.trim() : 'Anonymous';
        const cleanEmail = email && email.trim() !== '' ? email.trim() : null;
        const cleanPhone = phone && phone.trim() !== '' ? phone.trim() : null;

        // ==========================================
        // 🚀 3. SUPABASE DATABASE MEIN LEAD SAVE KARNA
        // ==========================================
        if (supabase) {
            try {
                await supabase
                    .from('yg_contact_leads')
                    .insert([
                        {
                            visitor_id: visitor_id || 'unknown',
                            name: cleanName,
                            email: cleanEmail,
                            phone: cleanPhone,
                            subject: subject || 'General Website Inquiry',
                            message: message || '',
                            all_fields: data
                        }
                    ]);
                console.log('✅ Lead saved to Supabase (yg_contact_leads)');
            } catch (dbErr) {
                console.error('Database save non-fatal error:', dbErr);
            }
        }

        // ==========================================
        // 🚀 4. NODEMAILER EMAIL SENDING
        // ==========================================
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const recipientEmail = process.env.RECEIVER_EMAIL || process.env.EMAIL_USER;

        const mailOptions = {
            from: `"YesGlobal Website" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            replyTo: cleanEmail || process.env.EMAIL_USER,
            subject: `New Inquiry from ${cleanName}: ${subject || 'Contact Form'}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 600px; color: #1f2937;">
                    <div style="background: #009876; color: white; padding: 15px; text-align: center; border-radius: 6px; margin-bottom: 20px;">
                        <h2 style="margin: 0; text-transform: uppercase;">New Website Inquiry</h2>
                    </div>
                    
                    <p style="margin: 8px 0;"><strong>Name:</strong> ${cleanName}</p>
                    <p style="margin: 8px 0;"><strong>Email:</strong> ${cleanEmail ? `<a href="mailto:${cleanEmail}">${cleanEmail}</a>` : 'Not provided'}</p>
                    <p style="margin: 8px 0;"><strong>Phone:</strong> ${cleanPhone || 'Not provided'}</p>
                    <p style="margin: 8px 0;"><strong>Visitor ID:</strong> ${visitor_id || 'N/A'}</p>
                    
                    <p style="margin: 16px 0 8px 0;"><strong>Message:</strong></p>
                    <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; white-space: pre-line; line-height: 1.6;">
                        ${message || 'No additional message details.'}
                    </div>

                    <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0 10px;" />
                    <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">
                        This inquiry was submitted from the YesGlobal website.
                    </p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ status: "success", message: "Inquiry sent and saved successfully!" }),
        };

    } catch (error) {
        console.error("Function Error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ status: "error", error: error.message }),
        };
    }
};