// lib/email.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ CONFIGURACIÓN PARA DESARROLLO
// Usa onboarding@resend.dev hasta que tengas dominio propio
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export async function sendVerificationEmail({ email, name, token }) {
  console.log("🔥 Enviando email a:", email);
  console.log("🔥 Desde:", FROM_EMAIL);

  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,  // ✅ Cambiado aquí
      to: email,
      subject: "Verifica tu email - Darccuir Yatay",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
           <div
              style="
                background-color: #8c622a;
                background: linear-gradient(to right, #8c622a, #a3794b);
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              "
            >
              <h1 style="color: white; margin: 0;">¡Bienvenido a Darccuir Yatay!</h1>
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

    console.log("✅ Email enviado correctamente:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error enviando email:", error);
    return { success: false, error: error.message };
  }
}

export async function sendPasswordResetEmail({ email, name, token }) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,  // ✅ Cambiado aquí
      to: email,
      subject: "Restablecer contraseña - Darccuir Yatay",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div
              style="
                background-color: #8c622a;
                background: linear-gradient(to right, #8c622a, #a3794b);
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              "
            >
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
                El equipo de Darccuir Yatay
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("✅ Email de reset enviado:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error enviando email de reset:", error);
    return { success: false, error: error.message };
  }
}

export async function sendWelcomeEmail({ email, name }) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,  // ✅ Cambiado aquí
      to: email,
      subject: "¡Bienvenido a Darccuir Yatay! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div
              style="
                background-color: #8c622a;
                background: linear-gradient(to right, #8c622a, #a3794b);
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              "
            >
              <h1 style="color: white; margin: 0;">🎉 ¡Email Verificado!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px;">Hola <strong>${name}</strong>,</p>
              
              <p>¡Tu email ha sido verificado exitosamente!</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #3b82f6;">Primeros pasos:</h3>
                <ul style="padding-left: 20px;">
                  <li>Completa tu perfil</li>
                  <li>Explora nuestros productos</li>
                  <li>Realiza tu primera compra</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}" 
                   style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Ir a la tienda
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

    console.log("✅ Email de bienvenida enviado:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error enviando email de bienvenida:", error);
    return { success: false, error: error.message };
  }
}

// ✅ EMAIL DE CONFIRMACIÓN DE ORDEN (el más importante para tu caso)
export async function sendOrderConfirmationEmail({
  email,
  name,
  orderId,
  orderNumber,
  items,
  total,
  shippingAddress,
  estimatedDelivery
}) {
  try {
    // Calcular subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 0; // Ajustar según tu lógica

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Confirmación de Orden #${orderNumber} - Darccuir Yatay`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div
              style="
                background-color: #8c622a;
                background: linear-gradient(to right, #8c622a, #a3794b);
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              "
            >
              <h1 style="color: white; margin: 0;">✅ ¡Orden Confirmada!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px;">Hola <strong>${name}</strong>,</p>
              
              <p>Gracias por tu compra. Hemos recibido tu orden y estamos preparándola para su envío.</p>
              
              <!-- Número de orden -->
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <p style="margin: 0; font-size: 14px; color: #666;">Número de orden</p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #3b82f6;">#${orderNumber}</p>
              </div>
              
              <!-- Productos -->
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                  Productos
                </h3>
                ${items.map(item => `
                  <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f3f4f6;">
                    <div style="flex: 1;">
                      <p style="margin: 0; font-weight: 600; color: #1f2937;">${item.name}</p>
                      ${item.variant ? `<p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Color: ${item.variant.color}</p>` : ''}
                      <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Cantidad: ${item.quantity}</p>
                    </div>
                    <div style="text-align: right;">
                      <p style="margin: 0; font-weight: 600; color: #1f2937;">$${(item.price * item.quantity).toFixed(2)}</p>
                      <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">$${item.price.toFixed(2)} c/u</p>
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <!-- Resumen de precios -->
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="color: #6b7280;">Subtotal:</span>
                  <span style="color: #1f2937;">$${subtotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="color: #6b7280;">Envío:</span>
                  <span style="color: #1f2937;">${shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #e5e7eb; margin-top: 10px;">
                  <span style="font-size: 18px; font-weight: bold; color: #1f2937;">Total:</span>
                  <span style="font-size: 18px; font-weight: bold; color: #3b82f6;">$${total.toFixed(2)}</span>
                </div>
              </div>
              
              <!-- Dirección de envío -->
              ${shippingAddress ? `
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1f2937;">📦 Dirección de envío</h3>
                <p style="margin: 5px 0; color: #4b5563;">${shippingAddress.street}</p>
                <p style="margin: 5px 0; color: #4b5563;">${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}</p>
                <p style="margin: 5px 0; color: #4b5563;">${shippingAddress.country}</p>
              </div>
              ` : ''}
              
              <!-- Fecha estimada -->
              ${estimatedDelivery ? `
              <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #065f46;">
                  <strong>📅 Entrega estimada:</strong> ${estimatedDelivery}
                </p>
              </div>
              ` : ''}
              
              <!-- Botón de seguimiento -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/orders/${orderId}" 
                   style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Ver estado de la orden
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #666;">
                Si tienes alguna pregunta sobre tu orden, no dudes en contactarnos.
              </p>
              
              <p style="font-size: 12px; color: #666; margin-top: 20px;">
                Gracias por tu compra,<br>
                El equipo de Darccuir Yatay
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("✅ Email de orden enviado:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error enviando email de orden:", error);
    return { success: false, error: error.message };
  }
}