
// const nodemailer = require('nodemailer');
// const { createClient } = require('@supabase/supabase-js');

// // 1. Supabase Initialization
// const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pzrmkiawjawjwuyjwmeo.supabase.co';
// const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

// let supabase = null;
// if (SUPABASE_URL && SUPABASE_KEY) {
//     supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
// }

// exports.handler = async (event) => {
//     // 2. CORS Headers (Localhost + Live Website dono ke liye completely open)
//     const headers = {
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
//         'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
//     };

//     // Preflight (Browser ka pehla test check)
//     if (event.httpMethod === "OPTIONS") {
//         return {
//             statusCode: 200,
//             headers,
//             body: ''
//         };
//     }

//     if (event.httpMethod !== "POST") {
//         return { 
//             statusCode: 405, 
//             headers,
//             body: JSON.stringify({ error: "Method Not Allowed" }) 
//         };
//     }

//     try {
//         const data = JSON.parse(event.body || '{}');
//         const { name, email, phone, subject, message, visitor_id } = data;

//         const cleanName = name && name.trim() !== '' ? name.trim() : 'Anonymous';
//         const cleanEmail = email && email.trim() !== '' ? email.trim() : null;
//         const cleanPhone = phone && phone.trim() !== '' ? phone.trim() : null;

//         // ==========================================
//         // 🚀 3. SUPABASE DATABASE MEIN LEAD SAVE KARNA
//         // ==========================================
//         if (supabase) {
//             try {
//                 await supabase
//                     .from('yg_contact_leads')
//                     .insert([
//                         {
//                             visitor_id: visitor_id || 'unknown',
//                             name: cleanName,
//                             email: cleanEmail,
//                             phone: cleanPhone,
//                             subject: subject || 'General Website Inquiry',
//                             message: message || '',
//                             all_fields: data
//                         }
//                     ]);
//                 console.log('✅ Lead saved to Supabase (yg_contact_leads)');
//             } catch (dbErr) {
//                 console.error('Database save non-fatal error:', dbErr);
//             }
//         }

//         // ==========================================
//         // 🚀 4. NODEMAILER (COMPANY EMAIL CUSTOM SMTP)
//         // ==========================================
//         // ==========================================
//         // 🚀 NAMECHEAP PRIVATE EMAIL SMTP ENGINE
//         // ==========================================
//         const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 465;

//         const transporter = nodemailer.createTransport({
//             host: process.env.SMTP_HOST || 'mail.privateemail.com',
//             port: smtpPort,
//             secure: smtpPort === 465, // 465 ke liye true hota hai
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             },
//             tls: {
//                 rejectUnauthorized: false
//             }
//         });

//         const recipientEmail = process.env.RECEIVER_EMAIL || process.env.EMAIL_USER;

//         const mailOptions = {
//             from: `"YesGlobal" <${process.env.EMAIL_USER}>`,
//             to: recipientEmail,
//             replyTo: cleanEmail || process.env.EMAIL_USER,
//             subject: `New Inquiry from ${cleanName}: ${subject || 'Contact Form'}`,
//             html: `
//                 <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px;">
//                     <div style="background: #009876; color: white; padding: 15px; text-align: center; border-radius: 6px; margin-bottom: 20px;">
//                         <h2 style="margin: 0; text-transform: uppercase;">New Website Inquiry</h2>
//                     </div>
//                     <p><strong>Name:</strong> ${cleanName}</p>
//                     <p><strong>Email:</strong> ${cleanEmail ? `<a href="mailto:${cleanEmail}">${cleanEmail}</a>` : 'Not provided'}</p>
//                     <p><strong>Phone:</strong> ${cleanPhone || 'Not provided'}</p>
//                     <p><strong>Visitor ID:</strong> ${visitor_id || 'N/A'}</p>
//                     <p><strong>Message:</strong></p>
//                     <div style="background: #f9fafb; padding: 15px; border-radius: 6px;">
//                         ${message || 'No additional details.'}
//                     </div>
//                 </div>
//             `,
//         };

       
//         await transporter.sendMail(mailOptions);

//         return {
//             statusCode: 200,
//             headers,
//             body: JSON.stringify({ status: "success", message: "Inquiry sent and saved successfully!" }),
//         };

//     } catch (error) {
//         console.error("Function Error:", error);
//         return {
//             statusCode: 500,
//             headers,
//             body: JSON.stringify({ status: "error", error: error.message }),
//         };
//     }
// };
//live test
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

// 1. Supabase Initialization
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pzrmkiawjawjwuyjwmeo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

exports.handler = async (event) => {
    // 2. CORS Headers (Never block frontend)
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
    }

    try {
        const data = JSON.parse(event.body || '{}');
        const { name, email, phone, subject, message, visitor_id } = data;

        const cleanName = name && name.trim() !== '' ? name.trim() : 'Anonymous';
        const cleanEmail = email && email.trim() !== '' ? email.trim() : null;
        const cleanPhone = phone && phone.trim() !== '' ? phone.trim() : null;

        // ==========================================
        // 🚀 1. SUPABASE  (ALWAYS FIRST)
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
                            subject: subject || 'Website Contact Form',
                            message: message || '',
                            all_fields: data
                        }
                    ]);
                console.log('✅ Lead saved successfully to Supabase');
            } catch (dbErr) {
                console.error('Database save non-fatal error:', dbErr.message);
            }
        }

        // ==========================================
        // 🚀 2. EMAIL DISPATCH (FAIL-SAFE TRY/CATCH)
        // ==========================================
        let emailSuccess = false;
        try {
            const smtpHost = (process.env.SMTP_HOST || 'mail.yesglobal.group').trim();
            const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 465;

            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: (process.env.EMAIL_USER || '').trim(),
                    pass: (process.env.EMAIL_PASS || '').trim(),
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const recipientEmail = (process.env.RECEIVER_EMAIL || process.env.EMAIL_USER || 'info@yesglobal.group').trim();

            const mailOptions = {
                from: `"YesGlobal Website" <${(process.env.EMAIL_USER || 'info@yesglobal.group').trim()}>`,
                to: recipientEmail,
                replyTo: cleanEmail || recipientEmail,
                subject: `New Inquiry from ${cleanName}: ${subject || 'Contact Form'}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e5e7eb; border-radius: 8px;">
                        <h2 style="color: #009876; margin-top: 0;">New Website Inquiry</h2>
                        <p><strong>Name:</strong> ${cleanName}</p>
                        <p><strong>Email:</strong> ${cleanEmail ? `<a href="mailto:${cleanEmail}">${cleanEmail}</a>` : 'Not provided'}</p>
                        <p><strong>Phone:</strong> ${cleanPhone || 'Not provided'}</p>
                        <p><strong>Visitor ID:</strong> ${visitor_id || 'N/A'}</p>
                        <p><strong>Message:</strong></p>
                        <div style="background: #f9fafb; padding: 15px; border-radius: 6px;">
                            ${message || 'No additional details.'}
                        </div>
                    </div>
                `,
            };

            await transporter.sendMail(mailOptions);
            emailSuccess = true;
            console.log('✅ Email successfully sent to:', recipientEmail);
        } catch (mailError) {
            console.error('Email sending failed (Saved to Supabase anyway):', mailError.message);
            // ⚠️ Yahan hum throw nahi karenge taake customer ko 500 error na dikhe!
        }

        // ==========================================
        // 🚀 3. CUSTOMER KO SUCCESS RESPONSE DENA
        // ==========================================
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                status: "success", 
                message: "Thank you! Your inquiry has been received.",
                emailSent: emailSuccess 
            }),
        };

    } catch (error) {
        console.error("Critical Function Error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ status: "error", error: error.message }),
        };
    }
};