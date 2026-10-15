# Zero Trust — Among Us community event

```
among-us-event/
├── client/   Vite + React site: home page, /register, /admin
└── server/   Express API: registrations and admin login, on Supabase Postgres
```

## 1. Get your database connection string

The server connects straight to your Supabase Postgres database. It only needs one
value from Supabase: the connection string.

1. In the Supabase dashboard, click **Connect** in the top bar.
2. Choose **Session pooler** and copy the URI. It looks like
   `postgresql://postgres.abcdefgh:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`
3. Replace `[YOUR-PASSWORD]` with your database password (reset it under
   **Project Settings → Database** if you don't have it). If the password has special
   characters like `@ : / ? # %`, URL-encode them.

## 2. Configure and start the server

```bash
cd server
cp .env.example .env               # paste DATABASE_URL, set SESSION_SECRET
npm install
npm run db:setup                   # creates the tables (safe to run again)
npm run create-admin -- yourname   # asks for a password (min 12 characters)
npm run dev                        # API on http://localhost:4000
```

Generate a `SESSION_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Run `npm run create-admin -- <username>` again any time to add another admin or reset a password.

## 3. Start the client

```bash
cd client
npm install
npm run dev                        # http://localhost:5173, proxies /api to the server
```

- `/` — the event site
- `/register` — the registration form
- `/admin` — admin sign-in and the registrations dashboard

## Deploying

Build the client, then let the Express server serve it, so the site and API share one origin
(the admin cookie needs this):

```bash
cd client && npm run build      # creates client/dist
cd ../server && NODE_ENV=production npm start
```

The server serves `client/dist` automatically when it exists. In production set
`NODE_ENV=production` (HTTPS-only cookies), and `TRUST_PROXY=1` if you're behind a proxy or
on a host like Render or Railway.

## API

| Method | Path | Who | What |
|---|---|---|---|
| GET | `/api/registrations/status` | Anyone | Whether registration is open |
| POST | `/api/registrations` | Anyone | Submit a registration (10 per hour per IP) |
| POST | `/api/admin/login` | Anyone | Sign in (10 failed tries per 15 min per IP) |
| POST | `/api/admin/logout` | Admin | Sign out |
| GET | `/api/admin/me` | Admin | Current admin |
| GET | `/api/admin/registrations` | Admin | List with `status`, `q`, `page`, `limit`, plus counts |
| PATCH | `/api/admin/registrations/:id` | Admin | Set `status` (pending/accepted/rejected) and `adminNote` |

## Security notes

- The server talks to Postgres directly with parameterised queries (`pg`). The tables keep
  Row Level Security on with no policies, so Supabase's public REST API can't reach them.
- The database connection is SSL-encrypted. To also verify Supabase's certificate, download
  it from **Project Settings → Database** and set `DATABASE_CA_CERT` in `.env`.
- Admin passwords are stored only as bcrypt hashes. Sign-in sets a signed, httpOnly,
  `SameSite=Strict` cookie; the browser never sees a token.
- A wrong username and a wrong password get the same error and take the same time.
- Each email can register once. A hidden honeypot field quietly drops simple bots.
- No emails are sent to applicants. Accepting or rejecting only changes the status.

## Tests

```bash
cd server && npm test
```

Runs the registration and admin handlers against an in-memory database. No database
connection or network access is needed.

Site content (event details, roles, maps, FAQ, the intro text) is documented in
`client/README.md`.
