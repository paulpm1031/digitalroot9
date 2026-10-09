export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/enquiry" && request.method === "POST") {
      return handleEnquiryForm(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleEnquiryForm(request, env) {
  const formData = await request.formData();
  const value = (field) => String(formData.get(field) || "").trim();

  // Invisible spam trap. A completed value is treated as a successful submission.
  if (value("_gotcha")) {
    return Response.redirect(new URL("/thank-you.html", request.url), 302);
  }

  const enquiry = {
    name: value("name"),
    organisation: value("organisation"),
    environment: value("environment"),
    whatsapp: value("whatsapp"),
    email: value("email"),
    preferredDate: value("preferredDate"),
    preferredTime: value("preferredTime"),
    challenge: value("challenge")
  };

  if (!enquiry.name || !enquiry.organisation || !enquiry.environment || !enquiry.whatsapp) {
    return new Response("Please return to the form and complete all required fields.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=UTF-8" }
    });
  }

  const fieldLimits = {
    name: 120,
    organisation: 160,
    environment: 80,
    whatsapp: 30,
    email: 254,
    preferredDate: 10,
    preferredTime: 32,
    challenge: 500
  };
  if (Object.entries(fieldLimits).some(([field, limit]) => enquiry[field].length > limit)) {
    return new Response("One or more fields are too long. Please shorten your response and try again.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=UTF-8" }
    });
  }

  const submittedAt = new Date().toLocaleString("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    dateStyle: "full",
    timeStyle: "short"
  });
  const escapeHtml = (text) => text.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
  const display = (text) => text || "Not provided";
  const rows = [
    ["Submitted date & time", submittedAt],
    ["Name", enquiry.name],
    ["Organisation", enquiry.organisation],
    ["Industry", enquiry.environment],
    ["Phone / WhatsApp", enquiry.whatsapp],
    ["Business email", display(enquiry.email)],
    ["Preferred call date", display(enquiry.preferredDate)],
    ["Preferred call time", display(enquiry.preferredTime)],
    ["What they would like to improve", display(enquiry.challenge)]
  ];
  const plainText = rows.map(([label, text]) => `${label}: ${text}`).join("\n");
  const htmlRows = rows.map(([label, text]) => `<tr><td style="width:38%;padding:12px;border:1px solid #d9e2de;font-weight:700;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:12px;border:1px solid #d9e2de;">${escapeHtml(text)}</td></tr>`).join("");

  const whatsappUrl = new URL("https://wa.me/60123991031");
  whatsappUrl.searchParams.set("text", `New DigitalRoot9 business enquiry\n\n${plainText}`);

  try {
    await sendZohoEmail(env, {
      html: `<div style="font-family:Arial,sans-serif;max-width:650px;color:#17272d;"><h2 style="margin:0 0 16px;">New DigitalRoot9 AI &amp; Process Improvement Enquiry</h2><table style="width:100%;border-collapse:collapse;">${htmlRows}</table><p style="margin-top:18px;color:#617078;">Source: DigitalRoot9 Website</p></div>`
    });
  } catch (error) {
    const errorCode = error && typeof error === "object" && "code" in error ? String(error.code) : "unknown";
    console.error("Zoho Mail delivery failed:", errorCode);
    const whatsappLink = escapeHtml(whatsappUrl.toString());
    return new Response(
      `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email unavailable | DigitalRoot9</title><body style="margin:0;padding:32px;background:#121212;color:#e0e0e0;font:16px/1.6 system-ui,sans-serif"><main style="max-width:620px;margin:10vh auto;padding:32px;border:1px solid #444;border-radius:12px;background:#1a1a1a"><p style="color:#a0a0a0">Your enquiry could not be emailed automatically.</p><h1 style="font-size:1.7rem">Please send it to us on WhatsApp</h1><p>Your enquiry details are ready in WhatsApp. Review the message and tap Send to complete your submission.</p><a href="${whatsappLink}" style="display:inline-block;margin-top:12px;padding:12px 18px;border-radius:5px;background:#81c784;color:#121212;text-decoration:none;font-weight:700">Continue to WhatsApp</a></main></body></html>`,
      { status: 502, headers: { "Content-Type": "text/html; charset=UTF-8" } }
    );
  }

  return Response.redirect(whatsappUrl, 303);
}

async function sendZohoEmail(env, { html }) {
  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_ACCOUNT_ID } = env;
  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN || !ZOHO_ACCOUNT_ID) {
    throw Object.assign(new Error("Zoho Mail secrets are not configured."), { code: "missing_zoho_configuration" });
  }

  const tokenResponse = await fetch("https://accounts.zoho.com/oauth/v2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: ZOHO_CLIENT_ID,
      client_secret: ZOHO_CLIENT_SECRET,
      refresh_token: ZOHO_REFRESH_TOKEN
    })
  });
  if (!tokenResponse.ok) {
    throw Object.assign(new Error("Zoho Mail access token request failed."), { code: `zoho_token_http_${tokenResponse.status}` });
  }

  const tokenPayload = await tokenResponse.json();
  if (typeof tokenPayload.access_token !== "string" || !tokenPayload.access_token) {
    throw Object.assign(new Error("Zoho Mail did not return an access token."), { code: "zoho_token_missing" });
  }

  const emailResponse = await fetch(`https://mail.zoho.com/api/accounts/${encodeURIComponent(ZOHO_ACCOUNT_ID)}/messages`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": `Zoho-oauthtoken ${tokenPayload.access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fromAddress: "enquiries@digitalroot9.com",
      toAddress: "patrick@digitalroot9.com",
      subject: "New DigitalRoot9 AI & Process Improvement Enquiry",
      content: html,
      mailFormat: "html"
    })
  });
  if (!emailResponse.ok) {
    throw Object.assign(new Error("Zoho Mail rejected the enquiry email."), { code: `zoho_send_http_${emailResponse.status}` });
  }

  const emailPayload = await emailResponse.json();
  if (emailPayload?.status?.code !== 200) {
    const responseCode = Number.isInteger(emailPayload?.status?.code) ? emailPayload.status.code : "unknown";
    throw Object.assign(new Error("Zoho Mail did not confirm email delivery."), { code: `zoho_send_${responseCode}` });
  }
}
