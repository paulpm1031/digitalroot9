export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/enquiry" && request.method === "POST") {
      return handleEnquiryForm(request);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleEnquiryForm(request) {
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

  const recipients = [
    { email: "Patrick@digitalroot9.com", name: "DigitalRoot9 Enquiries" },
    { email: "paulpm1031@gmail.com", name: "DigitalRoot9 Personal Copy" }
  ];
  const emailPayload = {
    personalizations: [{ to: recipients }],
    from: { email: "no-reply@digitalroot9.paulpm1031.workers.dev", name: "DigitalRoot9 Website" },
    subject: "New DigitalRoot9 Business Growth Enquiry",
    content: [
      { type: "text/plain", value: `NEW DIGITALROOT9 BUSINESS GROWTH ENQUIRY\n\n${plainText}\n\nSource: DigitalRoot9 Website` },
      { type: "text/html", value: `<div style="font-family:Arial,sans-serif;max-width:650px;color:#17272d;"><h2 style="margin:0 0 16px;">New DigitalRoot9 Business Growth Enquiry</h2><table style="width:100%;border-collapse:collapse;">${htmlRows}</table><p style="margin-top:18px;color:#617078;">Source: DigitalRoot9 Website</p></div>` }
    ]
  };

  const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(emailPayload)
  });

  if (!response.ok) {
    console.log("MailChannels email error:", await response.text());
    return new Response("Your request could not be sent. Please try again later.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=UTF-8" }
    });
  }

  return Response.redirect(new URL("/thank-you.html", request.url), 302);
}
