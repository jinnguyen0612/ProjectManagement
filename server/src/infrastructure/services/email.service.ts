import nodemailer from "nodemailer";
import { env } from "../../core/config/env";
import { logError, logInfo } from "../../shared/logger";
import { SendEmailOptions } from "../../core/types/mails.type";
import fs from "fs";
import path from "path";

const transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: env.MAIL_PORT === 465, // true for 465, false for other ports
    auth: {
        user: env.MAIL_USERNAME,
        pass: env.MAIL_PASSWORD,
    },
});

/**
 * Generic function to send an email
 */
export const sendEmail = async (options: SendEmailOptions) => {
    try {
        const info = await transporter.sendMail({
            from: `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_ADDRESS}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });

    } catch (error: any) {
        logError(`Error sending email: ${error.message}`);
        throw error;
    }
};

/**
 * Send a welcome email to a new user
 */
export const sendWelcomeEmail = async (to: string, phone: string, fullname: string, otp: string) => {
    try {
        const subject = "Welcome to Project Management!";
        const templatePath = path.resolve(__dirname, "../templates/emails/welcome.html");

        // Read the HTML template
        let html = fs.readFileSync(templatePath, "utf-8");

        // Use regex for global replacement if there are multiple occurrences (though currently only one)
        html = html.replace(/{{email}}/g, to);
        html = html.replace(/{{phone}}/g, phone);
        html = html.replace(/{{fullname}}/g, fullname);
        html = html.replace(/{{otp}}/g, otp);

        await sendEmail({ to, subject, html });
    } catch (error: any) {
        logError(`Error reading email template or sending email: ${error.message}`);
        // Fallback or rethrow
        throw error;
    }
};
