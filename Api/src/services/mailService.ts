import nodemailer from 'nodemailer';

function isDevelopment() {
  return process.env.NODE_ENV !== 'production';
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };

    return entities[character];
  });
}

export function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.MAIL_FROM
  );
}

export function getPasswordResetDeepLink(token: string) {
  const scheme = process.env.APP_DEEP_LINK_SCHEME || 'luvia';
  return `${scheme}://new-password?token=${encodeURIComponent(token)}`;
}

export async function sendPasswordResetEmail(
  to: string,
  token: string,
  expiresAt: Date,
  publicBaseUrl: string
) {
  const smtpPort = Number(process.env.SMTP_PORT);

  if (!isSmtpConfigured() || !Number.isInteger(smtpPort) || smtpPort <= 0) {
    throw new Error('SMTP não configurado.');
  }

  const appName = process.env.APP_NAME || 'Luvia';
  const resetLink = `${publicBaseUrl.replace(/\/+$/, '')}/auth/reset-password-link?token=${encodeURIComponent(token)}`;
  const expiration = expiresAt.toLocaleString('pt-BR');
  const safeAppName = escapeHtml(appName);
  const developmentToken = isDevelopment()
    ? `<p><strong>Token de desenvolvimento:</strong> ${escapeHtml(token)}</p>`
    : '';
  const developmentText = isDevelopment() ? `\nToken de desenvolvimento: ${token}\n` : '';

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.info(`[MAIL] Enviando recuperação para: ${to}`);

  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: `Recuperação de senha - ${appName}`,
      text: [
        `Olá,`,
        '',
        `Recebemos uma solicitação para redefinir sua senha no ${appName}.`,
        '',
        `Abra este link para criar uma nova senha: ${resetLink}`,
        '',
        `Este link expira em: ${expiration}.`,
        developmentText,
        'Se você não solicitou essa alteração, ignore este e-mail.',
        '',
        `Equipe ${appName}`,
      ].join('\n'),
      html: `
        <p>Olá,</p>
        <p>Recebemos uma solicitação para redefinir sua senha no ${safeAppName}.</p>
        <p>
          <a href="${resetLink}" style="display:inline-block;padding:12px 20px;background:#0A6DFF;color:#FFFFFF;text-decoration:none;border-radius:8px;">
            Redefinir minha senha
          </a>
        </p>
        <p>Este link expira em: ${escapeHtml(expiration)}.</p>
        ${developmentToken}
        <p>Se você não solicitou essa alteração, ignore este e-mail.</p>
        <p>Equipe ${safeAppName}</p>
      `,
    });

    console.info(`[MAIL] E-mail de recuperação enviado: ${info.messageId}`);
  } catch (error) {
    console.error('[MAIL] Falha ao enviar e-mail de recuperação:', error);
    throw error;
  }
}
