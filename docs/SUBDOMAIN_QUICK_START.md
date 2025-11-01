# Subdomain Quick Start Guide

## Quick Setup for Community Subdomains

### Prerequisites
- ✅ Vercel account with your project deployed
- ✅ Domain `guildup.club` connected to Vercel

### Step 1: Configure Vercel (5 minutes)

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Domains**
2. Add these domains:
   - `guildup.club` (main domain)
   - `www.guildup.club` (optional)
   - `*.guildup.club` (wildcard for all subdomains)

### Step 2: Configure DNS (10 minutes)

1. Go to your **domain registrar** (where you manage `guildup.club`)
2. Add a **CNAME record** (recommended):
   ```
   Type: CNAME
   Name: *
   Value: cname.vercel-dns.com
   TTL: Auto (or 3600)
   ```

   OR add an **A record**:
   ```
   Type: A
   Name: *
   Value: [Vercel's IP - check Vercel dashboard]
   TTL: Auto (or 3600)
   ```

3. **Wait 24-48 hours** for DNS propagation (or use Cloudflare for instant updates)

### Step 3: Deploy to Vercel

```bash
git push origin main
```

Vercel will automatically:
- Build your Next.js app
- Deploy with middleware
- Handle wildcard subdomains

### Step 4: Test

Once DNS is propagated:
- Visit: `https://khushi-tayal.guildup.club`
- Should redirect to: `/community/khushi-tayal-{communityId}/profile`

## How It Works

1. User visits `khushi-tayal.guildup.club`
2. Middleware detects subdomain `khushi-tayal`
3. Looks up community with name matching `khushi-tayal` (normalized)
4. Redirects to proper profile route with community ID

## Troubleshooting

**Not working?**
- Check DNS: `dig *.guildup.club` or use [whatsmydns.net](https://www.whatsmydns.net)
- Verify Vercel domain configuration
- Check Vercel deployment logs
- Ensure community name matches subdomain format (e.g., "Khushi Tayal" → "khushi-tayal")

**Need help?**
- See full documentation: `docs/SUBDOMAIN_SETUP.md`
- Check middleware logs in Vercel dashboard
- Review browser console for errors

