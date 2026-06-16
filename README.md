This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database Setup

To run a PostgreSQL database locally using Docker with persistent volumes, execute the following command:

```bash
docker run --name tv-tools-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=tv_tools_platform \
  -p 23535:5432 \
  -v tv-tools-postgres-data:/var/lib/postgresql/data \
  -d postgres:17
```

This matches the configuration in your `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:23535/tv_tools_platform"
```

Once the database container is running, initialize the database by creating and running migrations:

```bash
# 1. Create and apply the initial migration (generates the Prisma Client automatically)
pnpm db:migrate --name init

# 2. Seed the database with initial tools and plans
pnpm db:seed
```

> [!NOTE]
> For rapid prototyping where you don't need migration history, you can alternatively use `pnpm db:generate` followed by `pnpm db:push`.

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
