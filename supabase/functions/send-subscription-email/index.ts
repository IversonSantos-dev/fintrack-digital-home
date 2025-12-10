import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  type: "renewal_success" | "expiring_soon" | "cancelled";
  userName?: string;
  planType?: string;
  expirationDate?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-SUBSCRIPTION-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { to, type, userName, planType, expirationDate }: EmailRequest = await req.json();
    logStep("Request received", { to, type, planType });

    let subject = "";
    let html = "";
    const name = userName || "Cliente";

    switch (type) {
      case "renewal_success":
        subject = "✅ Sua assinatura foi renovada com sucesso!";
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10B981, #059669); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 24px; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
              .plan-badge { display: inline-block; background: #10B981; color: white; padding: 6px 16px; border-radius: 20px; font-weight: 600; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Assinatura Renovada! 🎉</h1>
              </div>
              <div class="content">
                <p>Olá, <strong>${name}</strong>!</p>
                <p>Sua assinatura do plano <span class="plan-badge">${planType?.toUpperCase() || 'PRO'}</span> foi renovada com sucesso.</p>
                <p>Continue aproveitando todos os recursos premium do nosso sistema de gestão financeira.</p>
                <p>Se tiver qualquer dúvida, nossa equipe de suporte está sempre à disposição.</p>
                <p>Obrigado por confiar em nós!</p>
              </div>
              <div class="footer">
                <p>Equipe FinanceApp</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case "expiring_soon":
        subject = "⚠️ Sua assinatura expira em breve";
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #F59E0B, #D97706); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 24px; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
              .date-box { background: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
              .cta-button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Sua Assinatura Expira em Breve</h1>
              </div>
              <div class="content">
                <p>Olá, <strong>${name}</strong>!</p>
                <p>Queremos avisar que sua assinatura do plano <strong>${planType?.toUpperCase() || 'PRO'}</strong> está prestes a expirar.</p>
                <div class="date-box">
                  <strong>Data de expiração:</strong><br>
                  <span style="font-size: 18px; color: #D97706;">${expirationDate || 'Em breve'}</span>
                </div>
                <p>Para continuar aproveitando todos os recursos premium, certifique-se de que seu método de pagamento está atualizado.</p>
                <p>Se você não deseja renovar, não se preocupe - sua conta continuará ativa com o plano gratuito.</p>
              </div>
              <div class="footer">
                <p>Equipe FinanceApp</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      case "cancelled":
        subject = "😢 Sua assinatura foi cancelada";
        html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6B7280, #4B5563); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 24px; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Assinatura Cancelada</h1>
              </div>
              <div class="content">
                <p>Olá, <strong>${name}</strong>!</p>
                <p>Confirmamos o cancelamento da sua assinatura do plano <strong>${planType?.toUpperCase() || 'PRO'}</strong>.</p>
                <p>Sua conta foi convertida para o plano gratuito e você ainda pode acessar os recursos básicos.</p>
                <p>Se mudar de ideia, você pode assinar novamente a qualquer momento.</p>
                <p>Sentiremos sua falta! 💙</p>
              </div>
              <div class="footer">
                <p>Equipe FinanceApp</p>
              </div>
            </div>
          </body>
          </html>
        `;
        break;

      default:
        throw new Error("Invalid email type");
    }

    logStep("Sending email", { to, subject });

    const emailResponse = await resend.emails.send({
      from: "FinanceApp <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    logStep("Email sent successfully", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
