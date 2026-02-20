# Manual Action Required: Enable Manual Linking in Supabase

**Thomas — you need to do this in the Supabase Dashboard (can't be done via code).**

## Steps

1. Go to: https://supabase.com/dashboard/project/pixasvjwrjvuorqqrpti/settings/auth
2. Scroll to the **"Security"** section
3. **Enable "Manual Linking"** (Allow manual linking of accounts)
4. Click **Save**

This fixes the "Manual linking is disabled" error when users try to connect GitHub or X accounts.

## Also Verify OAuth Providers

Make sure these are configured at https://supabase.com/dashboard/project/pixasvjwrjvuorqqrpti/auth/providers:

- **GitHub**: Client ID + Client Secret must be set
- **Twitter/X**: API Key + API Secret must be set
