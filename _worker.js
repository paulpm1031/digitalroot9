export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        /*
            FORM SUBMISSION ROUTE

            Your HTML form sends data to:

            /api/enquiry
        */
        if (
            url.pathname === "/api/enquiry" &&
            request.method === "POST"
        ) {
            return handleEnquiryForm(request);
        }

        /*
            THANK-YOU PAGE

            When the form is submitted successfully, the visitor
            is redirected to:

            /thank-you.html
        */
        if (url.pathname === "/thank-you.html") {
            return new Response(
                THANK_YOU_PAGE,
                {
                    headers: {
                        "Content-Type": "text/html; charset=UTF-8"
                    }
                }
            );
        }

        /*
            HOMEPAGE

            This gives a basic response for the main website URL.

            IMPORTANT:
            Your existing website may already be served as assets.
            If your homepage disappears after adding this Worker,
            tell me and do not delete anything.
        */
        if (url.pathname === "/" || url.pathname === "/index.html") {
            return new Response(
                HOME_MESSAGE,
                {
                    headers: {
                        "Content-Type": "text/html; charset=UTF-8"
                    }
                }
            );
        }

        /*
            Anything else returns 404.
        */
        return new Response(
            "Page not found.",
            {
                status: 404,
                headers: {
                    "Content-Type": "text/plain; charset=UTF-8"
                }
            }
        );
    }
};


/*
    ======================================
    FORM PROCESSING FUNCTION
    ======================================
*/
async function handleEnquiryForm(request) {
    const formData = await request.formData();

    /*
        SPAM CHECK

        Normal clients do not see this field.
    */
    const honeypot = String(
        formData.get("_gotcha") || ""
    ).trim();

    if (honeypot) {
        return Response.redirect(
            new URL("/thank-you.html", request.url),
            302
        );
    }

    /*
        READ CLIENT FORM DATA
    */
    const name = String(
        formData.get("name") || ""
    ).trim();

    const organisation = String(
        formData.get("organisation") || ""
    ).trim();

    const environment = String(
        formData.get("environment") || ""
    ).trim();

    const whatsapp = String(
        formData.get("whatsapp") || ""
    ).trim();

    const email = String(
        formData.get("email") || ""
    ).trim();

    const preferredDate = String(
        formData.get("preferredDate") || ""
    ).trim();

    const preferredTime = String(
        formData.get("preferredTime") || ""
    ).trim();

    const challenge = String(
        formData.get("challenge") || ""
    ).trim();

    /*
        AUTOMATIC MALAYSIA DATE AND TIME
    */
    const submittedAt = new Date().toLocaleString(
        "en-MY",
        {
            timeZone: "Asia/Kuala_Lumpur",
            dateStyle: "full",
            timeStyle: "short"
        }
    );

    /*
        REQUIRED FIELD CHECK
    */
    if (!name || !organisation || !environment || !whatsapp) {
        return new Response(
            "Please return to the form and complete all required fields.",
            {
                status: 400,
                headers: {
                    "Content-Type": "text/plain; charset=UTF-8"
                }
            }
        );
    }

    /*
        MAKE CLIENT TEXT SAFE FOR HTML EMAIL
    */
    function escapeHtml(value) {
        return value.replace(
            /[&<>"']/g,
            function (character) {
                const characters = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"
                };

                return characters[character];
            }
        );
    }

    const safeName = escapeHtml(name);

    const safeOrganisation = escapeHtml(organisation);

    const safeEnvironment = escapeHtml(environment);

    const safeWhatsapp = escapeHtml(whatsapp);

    const safeEmail = escapeHtml(
        email || "Not provided"
    );

    const safePreferredDate = escapeHtml(
        preferredDate || "Not provided"
    );

    const safePreferredTime = escapeHtml(
        preferredTime || "Not provided"
    );

    const safeChallenge = escapeHtml(
        challenge || "Not provided"
    );

    /*
        ======================================
        CHANGE ONLY THESE TWO EMAIL ADDRESSES
        ======================================
    */

    // Your Zoho DigitalRoot9 mailbox
    const digitalRoot9Email =
        "patrick@digitalroot9.com";

    // Your personal Gmail, Outlook, etc.
    // Leave as "" if you do not want a personal copy.
    const personalEmail =
        "paulpm1031@gmail.com";

    /*
        CREATE LIST OF RECIPIENTS
    */
    const recipients = [
        {
            email: digitalRoot9Email,
            name: "DigitalRoot9 Enquiries"
        }
    ];

    if (personalEmail) {
        recipients.push({
            email: personalEmail,
            name: "DigitalRoot9 Personal Copy"
        });
    }

    /*
        EMAIL CONTENT
    */
    const emailPayload = {
        personalizations: [
            {
                to: recipients
            }
        ],

        from: {
            email: "no-reply@digitalroot9.paulpm1031.workers.dev",
            name: "DigitalRoot9 Website"
        },

        subject: "New DigitalRoot9 Healthcare Discovery Request",

        content: [
            {
                type: "text/plain",

                value:
                    "NEW DIGITALROOT9 HEALTHCARE DISCOVERY REQUEST\n\n" +

                    "Submitted Date & Time: " +
                    submittedAt +
                    "\n\n" +

                    "Name: " +
                    name +
                    "\n" +

                    "Clinic / Hospital / Medical Group: " +
                    organisation +
                    "\n" +

                    "Current Application Environment: " +
                    environment +
                    "\n" +

                    "WhatsApp Number: " +
                    whatsapp +
                    "\n" +

                    "Business Email: " +
                    (email || "Not provided") +
                    "\n" +

                    "Preferred Call Date: " +
                    (preferredDate || "Not provided") +
                    "\n" +

                    "Preferred Call Time: " +
                    (preferredTime || "Not provided") +
                    "\n" +

                    "Main Operational Challenge: " +
                    (challenge || "Not provided") +
                    "\n\n" +

                    "Source: DigitalRoot9 Website"
            },

            {
                type: "text/html",

                value: `
                    <div
                        style="
                            font-family: Arial, sans-serif;
                            max-width: 650px;
                            color: #18181b;
                        "
                    >
                        <h2 style="margin: 0 0 16px;">
                            New DigitalRoot9 Healthcare Discovery Request
                        </h2>

                        <table
                            style="
                                width: 100%;
                                border-collapse: collapse;
                            "
                        >
                            <tr>
                                <td
                                    style="
                                        width: 42%;
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                        font-weight: bold;
                                    "
                                >
                                    Submitted Date & Time
                                </td>

                                <td
                                    style="
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                    "
                                >
                                    ${submittedAt}
                                </td>
                            </tr>

                            <tr>
                                <td
                                    style="
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                        font-weight: bold;
                                    "
                                >
                                    Name
                                </td>

                                <td
                                    style="
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                    "
                                >
                                    ${safeName}
                                </td>
                            </tr>

                            <tr>
                                <td
                                    style="
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                        font-weight: bold;
                                    "
                                >
                                    Clinic / Hospital / Medical Group
                                </td>

                                <td
                                    style="
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                    "
                                >
                                    ${safeOrganisation}
                                </td>
                            </tr>

                            <tr>
                                <td
                                    style="
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                        font-weight: bold;
                                    "
                                >
                                    Current Application Environment
                                </td>

                                <td
                                    style="
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                    "
                                >
                                    ${safeEnvironment}
                                </td>
                            </tr>

                            <tr>
                                <td
                                    style="
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                        font-weight: bold;
                                    "
                                >
                                    WhatsApp Number
                                </td>

                                <td
                                    style="
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                    "
                                >
                                    ${safeWhatsapp}
                                </td>
                            </tr>

                            <tr>
                                <td
                                    style="
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                        font-weight: bold;
                                    "
                                >
                                    Business Email
                                </td>

                                <td
                                    style="
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                    "
                                >
                                    ${safeEmail}
                                </td>
                            </tr>

                            <tr>
                                <td
                                    style="
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                        font-weight: bold;
                                    "
                                >
                                    Preferred Call Date
                                </td>

                                <td
                                    style="
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                    "
                                >
                                    ${safePreferredDate}
                                </td>
                            </tr>

                            <tr>
                                <td
                                    style="
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                        font-weight: bold;
                                    "
                                >
                                    Preferred Call Time
                                </td>

                                <td
                                    style="
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                    "
                                >
                                    ${safePreferredTime}
                                </td>
                            </tr>

                            <tr>
                                <td
                                    style="
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                        font-weight: bold;
                                        vertical-align: top;
                                    "
                                >
                                    Main Operational Challenge
                                </td>

                                <td
                                    style="
                                        padding: 12px;
                                        border: 1px solid #e4e4e7;
                                    "
                                >
                                    ${safeChallenge}
                                </td>
                            </tr>
                        </table>
                    </div>
                `
            }
        ]
    };

    /*
        SEND NOTIFICATION EMAIL
    */
    const response = await fetch(
        "https://api.mailchannels.net/tx/v1/send",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(emailPayload)
        }
    );

    /*
        ERROR HANDLING
    */
    if (!response.ok) {
        const errorMessage = await response.text();

        console.log(
            "MailChannels error:",
            errorMessage
        );

        return new Response(
            "Your request could not be sent. Please try again later.",
            {
                status: 500,
                headers: {
                    "Content-Type": "text/plain; charset=UTF-8"
                }
            }
        );
    }

    /*
        SUCCESS: SHOW THANK-YOU PAGE
    */
    return Response.redirect(
        new URL("/thank-you.html", request.url),
        302
    );
}


/*
    THANK-YOU PAGE
*/
const THANK_YOU_PAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Thank You | DigitalRoot9</title>

    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="flex min-h-screen items-center justify-center bg-zinc-950 px-6 font-sans text-zinc-300">
    <main class="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center shadow-2xl">
        <div class="mb-6 text-5xl text-emerald-400">
            ✓
        </div>

        <h1 class="text-3xl font-bold text-white">
            Thank You
        </h1>

        <p class="mt-4 leading-relaxed text-zinc-400">
            Your DigitalRoot9 discovery request has been received.
            We will contact you shortly.
        </p>

        <a
            href="/"
            class="mt-8 inline-block rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
        >
            Return to Website
        </a>
    </main>
</body>
</html>
`;


/*
    TEMPORARY HOME MESSAGE

    This exists only in case the Worker takes control of
    your homepage. Your actual website assets should remain
    served by Cloudflare.

    If you see this message instead of your full website,
    do not worry. Send me a screenshot and I will provide
    the correct Worker asset configuration.
*/
const HOME_MESSAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DigitalRoot9</title>
</head>
<body style="background:#09090b;color:#fff;font-family:Arial,sans-serif;padding:48px;">
    <h1>DigitalRoot9 Worker is active.</h1>
    <p>The form endpoint is being configured.</p>
</body>
</html>
`;
