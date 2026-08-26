# FoodOrder

A multi-vendor food ordering website prototype (school project). Customers
browse restaurants and place orders; restaurant owners manage their own
menu and incoming orders; an admin manages restaurants and assigns owners.

Stack: React + Vite frontend, Supabase (Postgres + Auth + Row Level
Security) for data/auth, deployed to Vercel.

## Competition

This project was prepared for the competition announced in this
[Instagram post](https://www.instagram.com/p/DcX3w7FJ6qB/).

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the SQL editor, run the entire contents of [`supabase/schema.sql`](supabase/schema.sql).
   This creates all tables, the profile-creation trigger, helper
   functions, and every Row Level Security policy.
3. In **Project Settings → API**, copy the **Project URL** and the
   **anon public** key.
4. Optional but convenient for a school demo: in **Authentication →
   Providers → Email**, turn off "Confirm email" so test signups don't
   need to click an email link.

## 2. Configure the app locally

Copy `.env.example` to `.env.local` (already done in this repo — just
fill in the two values) with the URL/key from step 1:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then:

```
npm install
npm run dev
```

## 3. Bootstrap your first admin account

There's a bootstrap problem: the admin dashboard is the only way to
promote users, but no admin exists yet on a fresh project. To fix that
once:

1. Sign up a normal account through the app (`/signup`).
2. In Supabase's **Table editor → profiles**, find that user's row and
   change `role` from `customer` to `admin`.
3. Log out and back in — you'll now see the admin navigation.

From then on, use the admin **Users** page to promote other accounts to
`owner` or `admin`, and the admin **Restaurants** page to create
restaurants and assign an owner to each.

## 4. Seed some demo data (optional)

To avoid an empty homepage during a demo, create 2-3 restaurants from the
admin Restaurants page and add a few menu items to each from the
corresponding owner's Menu page (promote a couple of test accounts to
`owner` and assign them first).

## 5. Deploy

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com) (framework preset: Vite).
3. In Vercel's Project Settings → Environment Variables, add the same
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values.
4. Deploy. `vercel.json` is already set up so client-side routes (like
   `/owner/menu`) don't 404 on refresh.

## Roles

- **customer** — default role on signup. Browses restaurants, orders,
  views own order history.
- **owner** — manages the one restaurant an admin assigned them to
  (menu items, incoming order statuses).
- **admin** — manages all restaurants, assigns owners, promotes user
  roles, and can view every order platform-wide.

Route protection in the React app (`src/routes/ProtectedRoute.jsx`) is a
UX convenience only — the actual security boundary is the Postgres Row
Level Security policies in `supabase/schema.sql`, which are enforced no
matter what the frontend does.
