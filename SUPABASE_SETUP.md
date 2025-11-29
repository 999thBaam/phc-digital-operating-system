# Supabase Setup for Multi-Tenancy

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: PHC Platform (or your choice)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you (e.g., Mumbai for India)
   - **Pricing Plan**: Free tier is sufficient
5. Click "Create new project"
6. Wait 2-3 minutes for provisioning

## Step 2: Get Connection String

1. In your Supabase project dashboard, go to **Settings** (gear icon)
2. Click **Database** in the left sidebar
3. Scroll to **Connection string** section
4. Select **URI** tab
5. Copy the connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with the password you set in Step 1

## Step 3: Update Environment Variables

I'll help you update the `.env` file once you have the connection string.

**Important**: Add `?schema=public` to the end of your connection string:
```
postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres?schema=public
```

## Step 4: Enable Required Extensions (Optional)

In Supabase dashboard:
1. Go to **Database** → **Extensions**
2. Search for and enable:
   - `uuid-ossp` (for UUID generation)
   - Already enabled by default!

## Next Steps

Once you have your connection string:
1. I'll update the `.env` file
2. Run Prisma migrations to create schemas
3. Seed the database with Super Admin and demo PHC
4. Continue with multi-tenancy implementation

---

## Supabase Benefits for This Project

✅ **Free tier includes**:
- 500 MB database storage
- Unlimited API requests
- Auto-scaling
- Built-in authentication (we can use later)
- Real-time subscriptions (for future features)
- Database backups

✅ **Perfect for hackathon**:
- No credit card required
- Instant setup
- Web-based SQL editor
- Easy to share/demo

---

**Ready?** Share your Supabase connection string and I'll configure everything!
