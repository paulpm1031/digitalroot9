export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        /*
            ONLY HANDLE THE WEBSITE FORM.

            The website form sends its information to:

            /api/enquiry
        */
        if (
            url.pathname === "/api/enquiry" &&
            request.method === "POST"
        ) {
            return handleEnquiryForm(request);
        }

        /*
            FOR EVERYTHING ELSE:

            Show your normal website files:
            - index.html
            - thank-you.html
            - Emblem_NB.jpg
            - CSS / images / other files
        */
        return env.ASSETS.fetch(request);
    }
};


/*
    ============================================
    DIGITALROOT9 WEBSITE FORM EMAIL HANDLER
    ============================================
*/
async function handleEnquiryForm(request) {
    const formData = await request.formData();

    /*
        SPAM TRAP

        Real visitors cannot see this input.
        Many spam bots fill all inputs, including hidden ones.
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
        READ CLIENT-ENTERED INFORMATION
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
        CREATE THE AUTOMATIC MALAYSIA DATE AND TIME
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
        CHECK REQUIRED FIELDS
    */
    if (
        !name ||
        !organisation ||
        !environment ||
        !whatsapp
    ) {
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
        MAKE TEXT SAFE FOR HTML EMAIL
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
        ============================================
        CHANGE ONLY THESE TWO EMAIL ADDRESSES
        ============================================

        1. Your Zoho DigitalRoot9 mailbox:
           Example: hello@digitalroot9.com

        2. Your personal Gmail or Outlook email:
           Example: yourname@gmail.com

        If you do NOT want a personal email copy:
        set personalEmail to an empty value: ""
    */

    const digitalRoot9Email =
        "Patrick@digitalroot9.com";

    const personalEmail =
        "paulpm1031@gmail.com";

    /*
        CREATE THE RECIPIENT LIST
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
        CREATE EMAIL DATA
    */
    const emailPayload = {
        personalizations: [
            {
                to: recipients
            }
        ],

        /*
            You are NOT emailing the client.

            This is only the technical "From" address used
            by the email delivery service to send a notification
            into your own inbox.
        */
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

                        <p
                            style="
                                margin: 0 0 20px;
                                color: #52525b;
                            "
                        >
                            Submitted from the DigitalRoot9 website.
                        </p>

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
        SEND THE EMAIL TO YOUR INBOXES
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
        IF EMAIL SENDING FAILS
    */
    if (!response.ok) {
        const errorText = await response.text();

        console.log(
            "MailChannels email sending error:",
            errorText
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
        IF EMAIL SENDING SUCCEEDS
    */
    return Response.redirect(
        new URL("/thank-you.html", request.url),
        302
    );
}
