
export async function sendTicketPurchasedEmail(id ,event_name , created_at, ticket_name , ticket_for , ticket_quantity , ticket_price , qr_code_base64) {

    const email = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Ticket Receipt</title>
    <style>
        /* Responsive overrides for mobile clients */
        @media screen and (max-width: 600px) {
            .wrapper-padding {
                padding: 30px 10px !important;
            }
            .content-padding {
                padding-left: 20px !important;
                padding-right: 20px !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f7fa; -webkit-font-smoothing: antialiased;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" class="wrapper-padding" style="padding: 60px 0;">
                
                <!-- Main Container Table -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 550px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); overflow: hidden;">
                    
                    <!-- Top Accent Bar -->
                    <tr>
                        <td height="6" style="background-color: #4f46e5; line-height: 6px; font-size: 6px;">&nbsp;</td>
                    </tr>

                    <!-- Header & Logo -->
                    <tr>
                        <td align="center" class="content-padding" style="padding: 40px 40px 30px 40px;">
                            <!-- Top Logo -->
                            <img src="https://raw.githubusercontent.com/opencrafts-io/academia/refs/heads/main/assets/splash/academia-splash.png" alt="Logo" width="140" style="display: block; border: 0; margin-bottom: 25px; max-width: 100%; height: auto;">
                            
                            <div style="background-color: #eef2ff; color: #4f46e5; display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 20px;">
                                Payment Received
                            </div>
                            <h1 style="margin: 0; color: #111827; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">Your receipt for ${event_name}</h1>
                            <p style="color: #6b7280; font-size: 16px; margin-top: 10px; line-height: 1.5;">Thanks for joining us! Your ticket is confirmed.</p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td class="content-padding" style="padding: 0 40px;">
                            <!-- Event Summary Card -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                                <tr>
                                    <td width="50%" style="vertical-align: top;">
                                        <p style="margin: 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Ticket ID</p>
                                        <p style="margin: 4px 0 0 0; font-size: 14px; color: #111827; font-weight: 600;">#${id}</p>
                                    </td>
                                    <td width="50%" style="text-align: right; vertical-align: top;">
                                        <p style="margin: 0; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Purchase Date</p>
                                        <p style="margin: 4px 0 0 0; font-size: 14px; color: #111827; font-weight: 600;">${created_at}</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Itemized Table -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                                <thead>
                                    <tr>
                                        <th align="left" style="padding-bottom: 12px; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Description</th>
                                        <th align="center" style="padding-bottom: 12px; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Qty</th>
                                        <th align="right" style="padding-bottom: 12px; font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style="padding: 16px 0; border-top: 1px solid #f1f5f9;">
                                            <div style="font-weight: 700; color: #111827; font-size: 15px;">${ticket_name}</div>
                                            <div style="font-size: 13px; color: #6b7280; margin-top: 2px;">Admits ${ticket_for} person(s)</div>
                                        </td>
                                        <td align="center" style="padding: 16px 0; border-top: 1px solid #f1f5f9; color: #111827; font-size: 14px;">${ticket_quantity}</td>
                                        <td align="right" style="padding: 16px 0; border-top: 1px solid #f1f5f9; font-weight: 700; color: #111827; font-size: 14px;">$${ticket_price}</td>
                                    </tr>
                                    <!-- Totals -->
                                    <tr>
                                        <td colspan="2" align="right" style="padding: 20px 0 5px 0; font-size: 14px; color: #6b7280;">Subtotal</td>
                                        <td align="right" style="padding: 20px 0 5px 0; font-size: 14px; color: #111827;">$${ticket_price}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="2" align="right" style="padding: 5px 0 40px 0; font-size: 18px; font-weight: 800; color: #111827;">Total Paid</td>
                                        <td align="right" style="padding: 5px 0 40px 0; font-size: 20px; font-weight: 800; color: #10b981;">$${ticket_price}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>

                    <!-- QR Code -->
                    <tr>
                        <td align="center" style="padding:20px 40px 40px;">
                            <div style="font-size:18px;font-weight:700;color:#111827;margin-bottom:15px;">
                                Your Event Ticket
                            </div>

                            <img
                                src="data:image/png;base64,${qr_code_base64}"
                                alt="Ticket QR Code"
                                width="180"
                                style="display:block;margin:auto;border:8px solid #f8fafc;border-radius:12px;"
                            />

                            <p style="margin-top:15px;color:#6b7280;font-size:13px;line-height:1.5;">
                                Scan this QR code to see the purchased ticket in Academia
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- 2026 Academia Footer -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 550px;">
                    <tr>
                        <td align="center" class="content-padding" style="padding-top: 30px;">
                            <img src="https://opencrafts.io/images/logo.svg" alt="Academia Logo" width="100" style="display: block; border: 0; margin-bottom: 15px; opacity: 0.7;">
                            
                            <p style="margin: 0; font-size: 13px; color: #94a3b8; font-weight: 500;">
                                &copy; 2026 Opencrafts. All rights reserved.
                            </p>
                            <p style="margin: 8px 0 0 0; font-size: 12px; color: #cbd5e1; line-height: 1.4;">
                                We believe in software that is fun, free and transparent.
                            </p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>`;

 return email;
}