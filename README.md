This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



The link is here: 

(https://secure-vault-g165-laharisabbathi-2078s-projects.vercel.app/)


or you can deploy in your own pace!! Happy codingg..

## Backend setup

Cards, passwords and files are stored in a Postgres database (Neon) through Prisma. Everything you save is
encrypted by the server with AES-256-GCM before it is written, and each user has their own derived key.
Clerk handles sign-in; every API route checks the signed-in user and only touches that user's rows.

### 1. Create the database

1. Create a free project at [neon.tech](https://neon.tech).
2. Open **Connect** and copy the **pooled** connection string (the host contains `-pooler`).
   Also copy the **direct** connection string if you want to use it for migrations.

### 2. Configure environment variables

```bash
cp .env.example .env.local
openssl rand -base64 32      # paste the output as VAULT_ENCRYPTION_KEY
```

Fill in `.env.local`:

| Variable | What it is |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | From the Clerk dashboard |
| `DATABASE_URL` | Neon pooled connection string |
| `DIRECT_URL` | (optional) Neon direct connection string, used only by migrations |
| `VAULT_ENCRYPTION_KEY` | 32 random bytes, base64. **Back this up.** Without it, stored data cannot be decrypted |

### 3. Create the tables and run

```bash
npm install            # also generates the Prisma client
npm run db:migrate     # creates the tables
npm run dev
```

### Deploying on Vercel

Add the same environment variables under **Project Settings -> Environment Variables**, run
`npm run db:migrate` once from your machine (pointing at the Neon database), then deploy.
Use the same `VAULT_ENCRYPTION_KEY` everywhere you use the same database.

### Tests

The tests run against a real Postgres database and **delete the rows in its tables**, so give them a throwaway
database (for example a second Neon branch), never your real one:

```bash
DATABASE_URL="postgresql://..." npm run db:migrate    # once, against the test database
TEST_DATABASE_URL="postgresql://..." npm test
```

### Good to know

- **What the encryption protects:** someone who gets a copy of the database (a leaked backup, a Neon account
  compromise) sees only ciphertext. It does not protect against someone who has both the database and your
  `VAULT_ENCRYPTION_KEY`, or against the server itself being compromised, because the server holds the key.
- **Files** are limited to 4 MB each (Vercel rejects larger request bodies), 30 files and 60 MB per user.
- **Existing data:** cards, passwords and files saved in a browser before the backend existed are moved into the
  database automatically the next time that user signs in on that browser.
- Not included yet: rate limiting on the API, audit logging, key rotation.

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


