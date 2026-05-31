# EmailJS Setup Guide — FDR Maturity Notifications

Follow these steps to enable automatic email notifications when an FDR matures.

---

## Step 1 — Create an EmailJS account

1. Go to **https://www.emailjs.com** and sign up (free tier = 200 emails/month).
2. After login, go to **Email Services** → **Add New Service**.
3. Choose **Gmail** (or your provider), connect your Google account, save.
4. Copy the **Service ID** (looks like `service_xxxxxxx`).

---

## Step 2 — Create an email template

1. Go to **Email Templates** → **Create New Template**.
2. Set **To Email**: `{{to_email}}`
3. Set **Subject**: `{{subject}}`
4. In the **Content** tab, switch to **HTML** mode and paste:

```html
{{{html_content}}}
```

> The triple-brace `{{{ }}}` tells EmailJS to render raw HTML (not escaped).

5. Click **Save**. Copy the **Template ID** (looks like `template_xxxxxxx`).

---

## Step 3 — Get your Public Key

1. Go to **Account** → **General** tab.
2. Copy **Public Key** (looks like `AbCdEfGhIjKlMnOp`).

---

## Step 4 — Configure your .env file

Create a `.env` file in the project root (copy from `.env.example`):

```
REACT_APP_EMAILJS_SERVICE_ID=service_xxxxxxx
REACT_APP_EMAILJS_TEMPLATE_ID=template_xxxxxxx
REACT_APP_EMAILJS_PUBLIC_KEY=AbCdEfGhIjKlMnOp
REACT_APP_NOTIFY_EMAIL=hafizsakib5@gmail.com
```

---

## Step 5 — Install & run

```bash
npm install
npm start
```

---

## How it works

- Every time the app loads (or the date picker changes to a new date), it checks if any FDR's **current cycle maturity date** (`cycleEnd`) matches today.
- If yes → a **notification panel** slides in from the top-right corner showing all matured FDRs with principal, net interest, TDS, and maturity amounts.
- Simultaneously, a **beautiful HTML email** is sent to `hafizsakib5@gmail.com` with the full breakdown table.
- A **dedup guard** (localStorage) ensures the email fires only once per FDR per calendar day — no spam.

---

## Troubleshooting

| Problem                             | Fix                                                    |
| ----------------------------------- | ------------------------------------------------------ |
| `EmailJS not configured` warning    | Check `.env` values are correct and restart dev server |
| Email not arriving                  | Check spam folder; verify EmailJS service is connected |
| `Email failed: ...` in notification | Check EmailJS dashboard for send logs                  |
| Notification not showing            | Use the date picker to simulate a maturity date        |
