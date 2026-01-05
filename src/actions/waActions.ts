const formatMobile = (mobile: string) => {
  const raw = mobile.replace(/\D/g, "");
  return raw.startsWith("91") ? raw : "91" + raw;
};

export async function SEND_BY_WHATSAPP({
  mobile,
  message,
}: {
  mobile: string;
  message: string;
}) {
  try {
    const formattedMobile = formatMobile(mobile);

    const payload = {
      "auth-key": process.env.WA_AUTH_KEY,
      "app-key": process.env.WA_APP_KEY,
      destination_number: formattedMobile,
      template_id: process.env.WA_TEMPLATE_ID,
      device_id: process.env.WA_DEVICE_ID,
      language: "en",
      variables: [message, "+917044076603"],
    };

    const response = await fetch("https://web.wabridge.com/api/createmessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return {
      success: true,
      message: "Message sent successfully",
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: error.response.data.message || error.message,
    };
  }
}
