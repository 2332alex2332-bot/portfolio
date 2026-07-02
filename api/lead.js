export default async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return response.status(503).json({ ok: false, error: "Telegram not configured" });
  }

  let body = request.body;

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return response.status(400).json({ ok: false, error: "Invalid JSON" });
    }
  }

  const name = String(body?.name ?? "").trim();
  const contact = String(body?.contact ?? "").trim();
  const social = String(body?.social ?? "telegram").trim().toLowerCase();

  if (!contact || contact.length < 3) {
    return response.status(400).json({ ok: false, error: "Contact is required" });
  }

  const socialLabel = social === "vk" ? "VK" : "Telegram";
  const lines = ["🆕 <b>Новая заявка — Сайты для бизнеса</b>", ""];

  if (name) {
    lines.push(`<b>Имя:</b> ${escapeHtml(name)}`);
  }

  lines.push(`<b>${socialLabel}:</b> ${escapeHtml(contact)}`);
  lines.push("", `<i>${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })} · portfolio</i>`);

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines.join("\n"),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!telegramResponse.ok) {
    return response.status(502).json({ ok: false, error: "Telegram delivery failed" });
  }

  response.setHeader("Access-Control-Allow-Origin", "*");
  return response.status(200).json({ ok: true });
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
