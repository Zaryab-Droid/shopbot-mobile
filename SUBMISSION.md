# G36 · ShopBot Mobile · Track 1

- Website: https://shopbot-mobile-web.vercel.app/
- Agent API base: https://shopbot-mobile.onrender.com
- Public repo: https://github.com/Zaryab-Droid/shopbot-mobile
- Demo video: add a public-viewable Drive or unlisted YouTube link.
- Completed paper canvas: add a public-viewable Drive link. The local worksheet photos are blank; photograph the filled original.

## Form answers

ShopBot helps a mobile shop compare phone variants and reserve them for pickup. The LangGraph safety router sends shopping requests to the phone advisor and holds to the reservation handler. Claude Haiku 5.5 interprets natural language. The two tools query phone stock and write confirmed reservations in Postgres. The demo catalog includes the Samsung Galaxy A16, Xiaomi Redmi Note 14, Google Pixel 7, and Samsung Galaxy A26.

The Supabase checkpointer stores the shortlist and pending hold by user and conversation; a separate preferences table stores explicitly saved preferences per user across conversations. The public grading API is for synthetic data only: caller-supplied IDs separate records but do not authenticate real shoppers. The seller dashboard requires a separate token. The backend refuses unrelated or injection requests and writes a hold only after explicit confirmation. It rechecks stock and price and returns the same code for duplicate confirmation.

## Record a 2–3 minute demo

- 0:00–0:25: Open the storefront. Explain the shop's problem, propose a monthly fee, and show the live catalog.
- 0:25–1:00: Ask for PTA-approved 128 GB phones under PKR 60,000. Ask to hold the second result. Show the preview before confirming.
- 1:00–1:25: Confirm, repeat confirmation, and show the same pickup code and one matching row in the seller dashboard. Start recording the dashboard only after signing in; never show the token.
- 1:25–1:55: Ask ShopBot to remember Xiaomi, start a new conversation, and show the saved preference affecting recommendations.
- 1:55–2:20: Show an unrelated request or bypass attempt refused. Show the architecture and benchmark table. Mention six Claude-backed turns and 5,655 reported tokens for ten cases.

Capture a short storefront clip for the README GIF. Review the video and GIF for visible secrets. Verify the site, video and photo in a signed-out window. The group leader completes the instructor form, and the same links go to Classroom. The stated deadline was 23 November 2026 at 11:59 PM Pakistan time; confirm late-submission acceptance with the instructor before assuming the submission counts.
