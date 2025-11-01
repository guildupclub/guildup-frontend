# Subdomain Setup Guide

This guide explains how to set up custom subdomains for communities on GuildUp, so that each community can have their own subdomain like `khushi-tayal.guildup.club`.

## Overview

Instead of accessing a community profile via:
```
https://guildup.club/community/Khushi-Tayal-685bcf2d76aa736a1c6853fe/profile
```

Communities can be accessed via their subdomain:
```
https://khushi-tayal.guildup.club
```

## Architecture

### 1. Middleware (`middleware.ts`)
- Detects subdomain from the request hostname
- Rewrites subdomain requests to a lookup route
- Adds subdomain to headers for component access

### 2. Subdomain Lookup Route (`/community/subdomain/[subdomain]/page.tsx`)
- Looks up community by matching subdomain to community name
- Redirects to the proper profile route with community ID
- Handles errors gracefully

### 3. Vercel Configuration (`vercel.json`)
- Configures project settings
- Note: Wildcard domain configuration is done in Vercel dashboard

## Setup Steps

### Step 1: Configure DNS (Production Only)

For production, you need to configure DNS for wildcard subdomains:

1. **Go to your domain registrar** (where you manage `guildup.club`)
2. **Add a wildcard DNS A record or CNAME:**
   - Type: `A` (or `CNAME` if using Vercel's nameservers)
   - Name: `*` (wildcard)
   - Value: Vercel's IP address (or `cname.vercel-dns.com` for CNAME)
   - TTL: Auto or 3600

   This allows `*.guildup.club` to resolve to your Vercel deployment.

### Step 2: Configure Vercel Project

1. **Go to Vercel Dashboard** → Your Project → Settings → Domains
2. **Add the main domain:**
   - Add `guildup.club` as a domain
   - Add `www.guildup.club` as a domain (optional)
3. **Add wildcard subdomain:**
   - Add `*.guildup.club` as a wildcard domain
   - Vercel will automatically handle all subdomains

### Step 3: Environment Variables

Ensure these environment variables are set in Vercel:
- `NEXT_PUBLIC_BACKEND_BASE_URL` - Your backend API URL
- Any other required environment variables

### Step 4: Deploy

Deploy your Next.js application to Vercel. The middleware and routing should work automatically.

## How It Works

### Flow Diagram

```
User visits: khushi-tayal.guildup.club
    ↓
Middleware detects subdomain: "khushi-tayal"
    ↓
Rewrites to: /community/subdomain/khushi-tayal
    ↓
Subdomain page looks up community by name
    ↓
Finds community with name "Khushi Tayal" → ID: 685bcf2d76aa736a1c6853fe
    ↓
Redirects to: /community/khushi-tayal-685bcf2d76aa736a1c6853fe/profile
    ↓
Profile page renders normally
```

### Subdomain Matching Logic

The subdomain is matched to community names using this logic:
1. Convert subdomain to lowercase: `khushi-tayal`
2. Convert community name to slug: `Khushi Tayal` → `khushi-tayal`
3. Match: `khushi-tayal` === `khushi-tayal` ✅

## Development/Local Testing

For local development, you can test subdomains by:

1. **Modifying your hosts file** (Windows: `C:\Windows\System32\drivers\etc\hosts`, Mac/Linux: `/etc/hosts`):
   ```
   127.0.0.1 khushi-tayal.localhost
   ```

2. **Access via** `http://khushi-tayal.localhost:3000`

3. **Or use a tool like** [ngrok](https://ngrok.com) for local subdomain testing

## Performance Optimization

### Current Implementation
- Fetches all communities and matches in memory
- Works for small to medium numbers of communities
- Suitable for MVP and early stages

### Recommended Backend Enhancement
For better performance at scale, consider adding a backend endpoint:

**Option 1: GET endpoint**
```
GET /v1/community/by-slug/:slug
```

**Option 2: POST endpoint**
```
POST /v1/community/by-name
Body: { name: "Khushi Tayal" }
```

Then update `src/app/community/subdomain/[subdomain]/page.tsx` to use this endpoint instead of fetching all communities.

## Troubleshooting

### Subdomain not working?
1. Check DNS propagation: Use `dig *.guildup.club` to verify DNS records
2. Check Vercel domain configuration: Ensure `*.guildup.club` is added
3. Check middleware logs: Add `console.log` in middleware to debug
4. Verify community name format: Subdomain must match community name slug

### Community not found?
1. Check community name in database matches subdomain format
2. Verify name normalization logic in subdomain lookup
3. Check backend API response format
4. Review console logs for errors

### DNS issues?
1. Wait 24-48 hours for DNS propagation
2. Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
3. Use online DNS checkers like [whatsmydns.net](https://www.whatsmydns.net)

## Security Considerations

1. **Subdomain validation**: Middleware validates subdomain format
2. **Rate limiting**: Consider adding rate limiting for subdomain lookups
3. **Caching**: Consider caching community slug → ID mappings
4. **HTTPS**: Ensure SSL certificates are configured for wildcard domains

## Future Enhancements

1. **Custom domains**: Allow communities to use their own custom domains
2. **Subdomain aliases**: Support multiple subdomains per community
3. **Slug management**: Allow communities to customize their subdomain slug
4. **Caching layer**: Cache subdomain → community ID mappings in Redis/Upstash

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Review middleware execution in Vercel dashboard
3. Check browser console for client-side errors
4. Review backend API logs

