# Flowlist

A TickTick-style task management SaaS built with Next.js, Supabase, Paddle, and PostHog.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql) once — it creates all tables, Row Level Security policies, and a trigger that bootstraps a new user's profile, free subscription, and default "Inbox" list on signup.
3. Under **Authentication → Email Templates → Confirm signup**, change the link to:
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard
   ```
   This template uses `{{ .SiteURL }}`, which Supabase fills in from **Authentication → URL Configuration → Site URL** — not from the app's `NEXT_PUBLIC_SITE_URL` env var. When you deploy, update **Site URL** there to your production domain (e.g. `https://your-app.vercel.app`), or confirmation emails will keep linking to whatever it was last set to (`http://localhost:3000` by default). Also add your production domain to **Redirect URLs** in the same settings page.
4. Copy your project's URL, anon key, and service role key from **Project Settings → API** into `.env.local` (see step 5).

### 3. Paddle

1. Create a [Paddle](https://www.paddle.com) sandbox account.
2. Create a Pro subscription price under **Catalog → Products**; copy its price ID.
3. Under **Developer Tools → Authentication**, create a client-side token and an API key.
4. Under **Developer Tools → Notifications**, create a webhook destination pointing at `<your-site-url>/api/webhooks/paddle` subscribed to `subscription.created`, `subscription.updated`, and `subscription.canceled`; copy its signing secret. (For local testing, tunnel `localhost:3000` with a tool like ngrok first.)

### 4. PostHog

1. Create a project at [posthog.com](https://posthog.com) (or self-hosted).
2. Copy the project API key and host from **Project Settings**.

### 5. Environment variables

```bash
cp .env.example .env.local
```

Fill in every value in `.env.local` from the steps above.

When deploying (e.g. to Vercel), also set `NEXT_PUBLIC_SITE_URL` to your production URL in the host's environment variable settings for the Production environment — it's inlined at build time, so a redeploy is needed after changing it.

### 6. Run

```bash
npm run dev
```

## What's here

- **Auth**: Supabase email/password auth, `proxy.ts` for optimistic route protection, `lib/dal.ts` as the real authorization boundary.
- **Tasks**: lists, tasks (due date/priority/notes), one level of subtasks, tags, and Today/Upcoming/All smart views — all via Server Actions with server-side Free-plan limit enforcement (`lib/plan-limits.ts`).
- **Billing**: Paddle overlay checkout, a webhook that syncs subscription status into Supabase, and a customer portal link for managing/cancelling.
- **Analytics**: PostHog pageviews plus custom events for signup, list/task creation, task completion, and the checkout → subscription lifecycle.

See `supabase/schema.sql` for the full database schema.
