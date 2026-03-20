# Custom Email Setup for Monday + Partners

## Step 1: Set Up Custom SMTP (Required for custom sender)

To send emails from "MONDAY + PARTNERS" instead of Supabase, you need a custom SMTP provider.

**Recommended: Resend** (free tier: 3,000 emails/month)

1. Sign up at https://resend.com
2. Add and verify your domain: `mondayandpartners.com`
3. Get your API key from Resend dashboard

## Step 2: Configure Supabase SMTP

1. Go to **Supabase Dashboard** → **Project Settings** → **Authentication**
2. Scroll to **SMTP Settings**
3. Enable **Custom SMTP**
4. Enter these settings for Resend:

```
Host: smtp.resend.com
Port: 465
Username: resend
Password: [Your Resend API Key]
Sender email: projects@mondayandpartners.com
Sender name: Monday + Partners
```

## Step 3: Update Email Template

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Select **Magic Link**
3. Set **Subject**: `Access Your Project — Monday + Partners`
4. Replace the **Body** with contents of `magic-link.html`

## Template Variables

Supabase uses Go template syntax:
- `{{ .ConfirmationURL }}` - The magic link URL
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your site URL

## Testing

1. Request a magic link from your login page
2. Check that the email:
   - Comes from `Monday + Partners <projects@mondayandpartners.com>`
   - Has the premium dark design
   - Button links correctly to your site
