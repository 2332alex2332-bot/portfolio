/**
 * Помогает получить TELEGRAM_CHAT_ID после первого сообщения боту.
 *
 * Windows (PowerShell):
 *   $env:TELEGRAM_BOT_TOKEN="ваш_токен"; node scripts/telegram-setup.mjs
 *
 * macOS / Linux:
 *   TELEGRAM_BOT_TOKEN=ваш_токен node scripts/telegram-setup.mjs
 */

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();

if (!token) {
  console.error("Укажите TELEGRAM_BOT_TOKEN в переменных окружения.");
  console.error('Пример: $env:TELEGRAM_BOT_TOKEN="123:ABC"; node scripts/telegram-setup.mjs');
  process.exit(1);
}

console.log("1. Откройте Telegram и напишите вашему боту любое сообщение (например «привет»).");
console.log("2. Жду 30 секунд и проверяю getUpdates...\n");

await new Promise((resolve) => setTimeout(resolve, 30000));

const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);

if (!response.ok) {
  console.error("Ошибка Telegram API:", response.status, await response.text());
  process.exit(1);
}

const data = await response.json();

if (!data.ok || !Array.isArray(data.result) || data.result.length === 0) {
  console.error("Сообщений не найдено. Напишите боту и запустите скрипт снова.");
  process.exit(1);
}

const last = data.result[data.result.length - 1];
const chat = last.message?.chat ?? last.edited_message?.chat;

if (!chat?.id) {
  console.error("Не удалось прочитать chat id из ответа.");
  process.exit(1);
}

console.log("Готово. Добавьте в Vercel (или .env.local):");
console.log("");
console.log(`TELEGRAM_CHAT_ID=${chat.id}`);
if (chat.username) {
  console.log(`# чат: @${chat.username}`);
} else if (chat.first_name) {
  console.log(`# чат: ${chat.first_name}`);
}
console.log("");
console.log("Затем: vercel env add TELEGRAM_BOT_TOKEN && vercel env add TELEGRAM_CHAT_ID");
console.log("И деплой: vercel --prod");
