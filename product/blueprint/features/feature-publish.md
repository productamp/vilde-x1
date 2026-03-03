# Feature — Publish

Add a publishing feature so users can deploy their website directly.

This is a simple product feature:
- A `Publish` action is available in the product.
- User can choose a target provider (Netlify, Cloudflare, or Vercel).
- Product publishes directly to the selected provider.
- User gets a live URL after publish.

## User flow

1. User clicks `Publish`.
2. User selects provider (`Netlify`, `Cloudflare`, or `Vercel`).
3. User confirms publish settings.
4. Product deploys the current website.
5. User receives the live link.

## Behavior

- Keep publishing flow short and simple for non-technical users.
- Make re-publish easy after edits.
- Show clear status (publishing, success, failed).
- Keep provider selection straightforward.

## Goal

Let users go from built website to live website in one simple flow, without manual deployment steps.
