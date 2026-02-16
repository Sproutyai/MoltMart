# Molt Mart — Denied UX Items (With Explanations)

These items were flagged by auditors but denied by Thomas. Explanations below for reference.

---

## 6. "Sell Link Goes to Login"
**Thomas's response:** Doesn't see this issue.
**What the auditors found:** Clicking "Sell" in the navbar when logged out redirects to `/auth/login` instead of showing a landing page explaining how selling works on Molt Mart. Thomas likely doesn't see it because he's always logged in during testing. It's a minor conversion issue since most sellers will create an account first anyway.

## 13. "No Redirect Back After Login"
**Thomas's response:** Doesn't see it.
**What the auditors found:** When a user is browsing a template and clicks "Download" (which requires login), they get sent to `/auth/login`. After logging in, they land on `/dashboard` instead of being redirected back to the template they were viewing. This is about preserving the user's intent through the auth flow. It's a common UX pattern but not critical for MVP.

## 15. "Mobile Sign-Out"
**Thomas's response:** Doesn't make sense.
**What the auditors found:** The sign-out button in mobile nav submits a form POST to an API route. Auditors wanted to verify it actually works vs. silently failing. Since Thomas uses the site without issues, this is likely working fine.

## 17. "No Active Nav States"
**Thomas's response:** Doesn't make sense.
**What the auditors found:** When you're on the "Browse" page, the "Browse" link in the navbar doesn't look visually different from other nav links. "Active state" means highlighting the current page's nav link so users know where they are in the site. It's a subtle visual polish item.

## 22. "Add Breadcrumbs"
**Thomas's response:** Asks what this means.
**What the auditors found:** Breadcrumbs are the navigation trail at the top of a page like "Home > Browse > Template Name" that shows where you are and lets you click back to parent pages. Common on e-commerce sites for orientation. Nice-to-have but not essential for MVP.
