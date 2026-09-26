This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database setup

Set `DATABASE_URL` to Supabase's shared transaction-mode pooler (port `6543`) for application requests. Set `DIRECT_URL` to the session/direct connection for Prisma migrations. In the Supabase dashboard, open **Connect** to find both connection strings, then copy them into a local `.env` file:

```powershell
Copy-Item .env.example .env
```

Replace the placeholder `DATABASE_URL` and `DIRECT_URL` values in `.env`, then run:

```powershell
npm run prisma:migrate
```

Keep `.env` out of source control. It is already ignored by this project.

## OpenAI chatbot setup

1. Create an account or sign in at [platform.openai.com](https://platform.openai.com/).
2. Add billing or credits under **Settings > Billing**. API access is separate from a ChatGPT subscription.
3. Open [API keys](https://platform.openai.com/api-keys), select **Create new secret key**, and copy it immediately. OpenAI will not show the complete key again.
4. Put the key in your local `.env` file:

```env
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4o-mini
```

Restart `npm run dev` after changing `.env`. The server uses OpenAI when the key is configured and automatically uses the local PrimeQuest knowledge fallback when it is absent or invalid. Never commit `.env` or expose the key in browser code.

## Ollama chatbot setup

Ollama can run the dynamic chatbot locally without OpenAI credits. On Windows, install Ollama from [ollama.com/download](https://ollama.com/download), then run:

```powershell
ollama pull llama3.2
```

Configure the server in `.env`:

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434/v1
OLLAMA_MODEL=llama3.2
```

Restart the Next.js server after changing `.env`. The public chatbot and admin assistant will use Ollama for general conversation while the shared PrimeQuest tools continue to read verified listings and mandates from the database. `OLLAMA_API_KEY` is only required when using Ollama Cloud; local Ollama requests do not need one.

## Vessel web discovery

The AI can research approved HTTPS sources when `DISCOVERY_SOURCE_URLS` is configured as a comma-separated list. Add those domains to `SCRAPER_ALLOWED_DOMAINS`, then restart the server. Discovery returns unverified research candidates only; a human must review and map them to a lead or listing before publication. The chatbot does not execute arbitrary URLs or destructive admin actions.

## WhatsApp intake acknowledgement

The public buyer and seller intake route can send an optional acknowledgement through WhatsApp Cloud API. Configure `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN` and `WHATSAPP_APP_SECRET` in the server-only `.env` file. The acknowledgement uses `WHATSAPP_DEFAULT_TIMEZONE` for its greeting and does not fail the intake if Meta rejects the message.

Set `WHATSAPP_AUTO_REPLY=true` only after configuring Meta's webhook URL as `/api/webhooks/whatsapp`. Incoming messages and delivery statuses are logged as admin notifications. Keep automatic replies disabled until the response policy, consent process and approved WhatsApp templates have been reviewed.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:


You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
