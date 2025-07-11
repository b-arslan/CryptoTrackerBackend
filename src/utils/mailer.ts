const apiKey = process.env.MJ_API_KEY || "";
const apiSecret = process.env.MJ_SECRET_KEY || "";
const senderEmail = process.env.MJ_SENDER_EMAIL || "bugraarslan4@gmail.com";
const senderName = process.env.MJ_SENDER_NAME || "CryptoTracker";

export async function sendVerificationEmail(email: string, code: string): Promise<any> {
    if (!apiKey || !apiSecret || !senderEmail) return null;
    try {
        const response = await fetch("https://api.mailjet.com/v3.1/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Basic " +
                    Buffer.from(apiKey + ":" + apiSecret).toString("base64"),
            },
            body: JSON.stringify({
                Messages: [
                    {
                        From: { Email: senderEmail, Name: senderName },
                        To: [{ Email: email }],
                        Subject: "Email Verification",
                        TextPart: `Your verification code: ${code}`,
                    },
                ],
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }
        return await response.json();
    } catch (err) {
        console.error("Mail sending error", err);
        return null;
    }
}

export async function sendResetPasswordEmail(email: string, code: string): Promise<any> {
    if (!apiKey || !apiSecret || !senderEmail) return null;
    try {
        const response = await fetch("https://api.mailjet.com/v3.1/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Basic " +
                    Buffer.from(apiKey + ":" + apiSecret).toString("base64"),
            },
            body: JSON.stringify({
                Messages: [
                    {
                        From: { Email: senderEmail, Name: senderName },
                        To: [{ Email: email }],
                        Subject: "Şifre Sıfırlama Kodu",
                        TextPart: `Şifre sıfırlama kodunuz: ${code}`,
                    },
                ],
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }
        return await response.json();
    } catch (err) {
        console.error("Mail sending error", err);
        return null;
    }
}
