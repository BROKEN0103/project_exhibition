// Mockup email utility
const sendEmail = async ({ to, subject, body }) => {
    console.log(`[EMAIL] To: ${to}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Body: ${body}`);
    // In a real app, use nodemailer or similar here
    return true;
};

const sendOTP = async (email, otp) => {
    return sendEmail({
        to: email,
        subject: "Your SIC MUNDUS Security Code",
        body: `Your one-time password is: ${otp}. It will expire in 10 minutes.`
    });
};

module.exports = { sendEmail, sendOTP };
