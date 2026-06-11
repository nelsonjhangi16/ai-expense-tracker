const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  const { data, error } = await resend.emails.send({
    from:    "Expense Tracker <onboarding@resend.dev>",
    to:      [to],
    subject,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message);
  }

  console.log("✅ Email sent:", data?.id);
};

module.exports = sendEmail;