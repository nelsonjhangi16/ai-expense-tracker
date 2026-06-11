const fetch = (...args) =>
  import("node-fetch").then(({ default: f }) => f(...args));

const sendEmail = async ({ to, subject, html, code }) => {
  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id:  "service_d8r9ryp",
      template_id: "j99vhey",
      user_id:     "Lu7S0MKP3hx2GtbdZsf0w",
      template_params: {
        email:    to,
        passcode: code,
        time:     new Date(Date.now() + 10 * 60 * 1000).toLocaleString(),
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("EmailJS error:", err);
    throw new Error("Failed to send email");
  }

  console.log("✅ Email sent via EmailJS");
};

module.exports = sendEmail;