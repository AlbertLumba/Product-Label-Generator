// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/lib/email.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Email transporter failed to initialize:", error);
  } else {
    console.log("✅ Email transporter ready");
  }
});

const TRACK_URL = "https://jaslend.vercel.app/track";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);

interface PaymentConfirmationParams {
  to: string;
  debtorName: string;
  itemName: string;
  amountPaid: number;
  method: string;
  remainingBalance: number;
  accessCode: string;
}

const methodLabel: Record<string, string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  E_WALLET: "E-Wallet",
  OTHER: "Other",
};

export async function sendPaymentConfirmationEmail(params: PaymentConfirmationParams) {
  const { to, debtorName, itemName, amountPaid, method, remainingBalance, accessCode } = params;

  const isFullySettled = remainingBalance <= 0;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <div style="background: #ecfdf5; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
        <p style="color: #059669; font-size: 14px; font-weight: 600; margin: 0 0 4px;">PAYMENT RECEIVED</p>
        <p style="color: #111827; font-size: 28px; font-weight: 700; margin: 0;">${formatCurrency(amountPaid)}</p>
      </div>

      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        Hi ${debtorName},
      </p>
      <p style="color: #374151; font-size: 15px; line-height: 1.6;">
        We've recorded your payment of <strong>${formatCurrency(amountPaid)}</strong> via
        <strong>${methodLabel[method] || method}</strong> for <strong>${itemName}</strong>.
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Remaining Balance</td>
          <td style="padding: 10px 0; text-align: right; font-weight: 600; color: ${isFullySettled ? "#059669" : "#dc2626"}; border-bottom: 1px solid #e5e7eb;">
            ${formatCurrency(Math.max(remainingBalance, 0))}
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280;">Access Code</td>
          <td style="padding: 10px 0; text-align: right; font-family: monospace; font-weight: 600; color: #059669;">
            ${accessCode}
          </td>
        </tr>
      </table>

      ${
        isFullySettled
          ? `<p style="color: #059669; font-size: 15px; font-weight: 600;">🎉 This debt is now fully settled. Thank you!</p>`
          : ""
      }

      <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
        Use code <strong style="font-family: monospace; color: #059669;">${accessCode}</strong> to see your remaining balance anytime on this link:
        <br />
        <a href="${TRACK_URL}" style="color: #4f46e5; font-weight: 600; text-decoration: none;">
          ${TRACK_URL}
        </a>
      </p>

      <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
        This is an automated confirmation email.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Payment Tracker" <${process.env.GMAIL_USER}>`,
      to,
      subject: `Payment Received — ${formatCurrency(amountPaid)}`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send payment confirmation email:", error);
    return { success: false, error };
  }
}