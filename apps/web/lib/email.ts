// In a real implementation: import { Resend } from 'resend';
// const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, licenseKey: string) {
  console.log(`[Email Service Mock] Sending welcome email to ${to}`);
  console.log(`[Email Service Mock] Subject: Welcome to macclean Pro!`);
  console.log(`[Email Service Mock] Body: Your license key is ${licenseKey}`);
  
  // return resend.emails.send({
  //   from: 'macclean <hello@macclean.app>',
  //   to: [to],
  //   subject: 'Here is your macclean Pro license key',
  //   html: `<p>Welcome to macclean Pro!</p><p>Your license key: <code>${licenseKey}</code></p>`,
  // });

  return { id: 'mock_email_id' };
}
