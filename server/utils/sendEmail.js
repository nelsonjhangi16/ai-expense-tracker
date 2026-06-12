const https = require("https");

const sendEmail = async ({ to, code, resetUrl }) => {
  const data = JSON.stringify({
    service_id:  "service_d8r9ryp",
    template_id: "j99vhey",
    user_id:     "Lu7S0MKP3hx2GtbdZsf0w",
    accessToken: "Lu7S0MKP3hx2GtbdZsf0w",
    template_params: {
      email:    to,
      passcode: code || resetUrl,
      time:     new Date(Date.now() + 15 * 60 * 1000).toLocaleString(),
    },
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.emailjs.com",
      path:     "/api/v1.0/email/send",
      method:   "POST",
      headers: {
        "Content-Type":   "application/json",
        "Content-Length": Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        if (res.statusCode === 200) {
          console.log("✅ Email sent via EmailJS");
          resolve();
        } else {
          console.error("EmailJS error:", res.statusCode, body);
          reject(new Error(`EmailJS failed: ${body}`));
        }
      });
    });

    req.on("error", (err) => {
      console.error("Request error:", err);
      reject(err);
    });

    req.write(data);
    req.end();
  });
};

module.exports = sendEmail;