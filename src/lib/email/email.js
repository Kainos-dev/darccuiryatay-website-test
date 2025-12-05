// lib/email.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail({ email, name, token }) {
    console.log("🔥 Resend API:", email)
    console.log("🔥 Resend API:", process.env.RESEND_API_KEY);

    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

    try {
        await resend.emails.send({
            from: "kainosarg@gmail.com",
            to: email,
            subject: "Verifica tu email",
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to right, #3b82f6, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">¡Bienvenido a Tu App!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px;">Hola <strong>${name}</strong>,</p>
              
              <p>Gracias por registrarte. Para completar tu registro, por favor verifica tu dirección de email haciendo clic en el botón de abajo:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Verificar Email
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">O copia y pega este enlace en tu navegador:</p>
              <p style="font-size: 12px; color: #3b82f6; word-break: break-all;">${verificationUrl}</p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #666;">
                Este enlace expirará en 24 horas. Si no solicitaste este registro, puedes ignorar este email.
              </p>
              
              <p style="font-size: 12px; color: #666; margin-top: 20px;">
                Saludos,<br>
                El equipo de Darccuir Yatay
              </p>
            </div>
          </body>
        </html>
      `,
        });

        return { success: true };
    } catch (error) {
        console.error("Error enviando email de verificación:", error);
        return { success: false, error: error.message };
    }
}

export async function sendPasswordResetEmail({ email, name, token }) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

    try {
        await resend.emails.send({
            from: "kainosarg@gmail.com",
            to: email,
            subject: "Restablecer contraseña",
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to right, #3b82f6, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Restablecer Contraseña</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px;">Hola <strong>${name}</strong>,</p>
              
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para crear una nueva contraseña:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Restablecer Contraseña
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">O copia y pega este enlace en tu navegador:</p>
              <p style="font-size: 12px; color: #3b82f6; word-break: break-all;">${resetUrl}</p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #ef4444; background: #fee2e2; padding: 10px; border-radius: 5px;">
                <strong>⚠️ Importante:</strong> Si no solicitaste restablecer tu contraseña, ignora este email. Tu contraseña actual permanecerá sin cambios.
              </p>
              
              <p style="font-size: 12px; color: #666; margin-top: 20px;">
                Este enlace expirará en 1 hora por seguridad.
              </p>
              
              <p style="font-size: 12px; color: #666; margin-top: 20px;">
                Saludos,<br>
                El equipo de Tu App
              </p>
            </div>
          </body>
        </html>
      `,
        });

        return { success: true };
    } catch (error) {
        console.error("Error enviando email de recuperación:", error);
        return { success: false, error: error.message };
    }
}

export async function sendWelcomeEmail({ email, name }) {
    try {
        await resend.emails.send({
            from: "kainosarg@gmail.com",
            to: email,
            subject: "¡Bienvenido a Tu App! 🎉",
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(to right, #3b82f6, #8b5cf6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">🎉 ¡Email Verificado!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px;">Hola <strong>${name}</strong>,</p>
              
              <p>¡Tu email ha sido verificado exitosamente!</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #3b82f6;">Primeros pasos:</h3>
                <ul style="padding-left: 20px;">
                  <li>Completa tu perfil</li>
                  <li>Configura tus preferencias</li>
                  <li>Explora nuestras funcionalidades</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}" 
                   style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Ir a la página principal
                </a>
              </div>
              
              <p style="font-size: 12px; color: #666; margin-top: 20px;">
                Si tienes alguna pregunta, no dudes en contactarnos.
              </p>
              
              <p style="font-size: 12px; color: #666; margin-top: 20px;">
                Saludos,<br>
                El equipo de Darccuir Yatay
              </p>
            </div>
          </body>
        </html>
      `,
        });

        return { success: true };
    } catch (error) {
        console.error("Error enviando email de bienvenida:", error);
        return { success: false, error: error.message };
    }
}