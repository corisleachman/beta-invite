# Pulse. — Marketing Site Handoff
## Context for a new Claude conversation window

---

## What this conversation is for

Building the **marketing site** for Pulse. (formerly outreach.) — a
multi-tenant SaaS cold email and prospect management platform for
consultants, fractional executives, and agency owners.

The beta page is done and live. This conversation is specifically for
designing and building the full marketing site. Do not use this window
for dashboard wireframing or implementation — those have their own
dedicated windows.

---

## The product

**Pulse.** is a calmer system for outreach. Not a CRM, not a cold-email
blaster. A simple tool that keeps outreach moving — tracking who you've
contacted, surfacing follow-ups when they're due, and making the next
action obvious.

**Tagline:** Pulse. — The heartbeat of outreach.

**Target users:** Consultants, fractional executives, agency owners,
recruiters — people who win work through conversations and need to stay
consistent with outreach without the overhead of a full CRM.

**Pricing:**
- Free: 1 campaign, 100 prospects, manual only
- Pro: ~£8–9/month or ~£45–50/year — unlimited campaigns, AI drafts,
  auto-scheduling

---

## Name decision

The product is currently called **outreach.** in the codebase and
dashboard. The name **Pulse.** is being explored as the brand name —
the beta page has been redesigned around this. The marketing site should
use **Pulse.** as the primary brand name throughout.

The dot after the name is intentional and part of the brand identity.

---

## Design direction — Electric Dreams

The approved visual language is called **Electric Dreams**. All new work
should use these tokens exactly.

### Colour tokens

**Dark mode (canonical):**
```css
--bg:    #0d0914;
--t:     #f4f4f2;
--tm:    #a8a8b8;
--td:    #6b6b80;
--pink:  #ff1493;
--cyan:  #00d4ff;
--green: #64dc78;
--amber: #ff9d42;
--grad:  linear-gradient(135deg, #ff1493, #00d4ff);
--grad-text: linear-gradient(135deg, #ff1493 0%, #00d4ff 100%);
--glow-pink: rgba(255,20,147,0.25);
--glow-cyan: rgba(0,212,255,0.2);
--s:     rgba(255,255,255,0.04);
--s2:    rgba(255,255,255,0.07);
--b:     rgba(255,255,255,0.07);
--b2:    rgba(255,255,255,0.13);
```

**Light mode (approved, optional):**
```css
--bg:    #faf8ff;
--t:     #1a1525;
--tm:    #5a5070;
--td:    #8a80a0;
--pink:  #c4006a;
--cyan:  #007a99;
--grad:  linear-gradient(135deg, #c4006a, #007a99);
--glow-pink: rgba(196,0,106,0.15);
--glow-cyan: rgba(0,122,153,0.12);
--s:     rgba(90,60,120,0.04);
--b:     rgba(90,60,120,0.10);
--b2:    rgba(90,60,120,0.18);
```

### Typography
- **Headings/UI:** Outfit (weights 300–900)
- **Body/inputs:** DM Sans (weights 300–500)
- Google Fonts — both already in use on the beta page

### Key visual elements
- Dark purple-black background (`#0d0914`)
- Pink→cyan gradient as the primary accent (text, buttons, borders)
- Noise texture overlay (SVG fractal noise, opacity 0.4)
- CSS orb blobs (pink, cyan, amber) — blurred, drifting slowly
- Heartbeat pulse canvas animation (see motion system below)
- Scan effect on cards/boxes
- Button hover: ink drop bloom from cursor entry point + pulse ring

---

## Motion system (canonical — read MOTION-SYSTEM.md)

The motion system is fully documented in:
`corisleachman/outreach-dashboard/MOTION-SYSTEM.md`

Key principles:
1. The 5–8 second heartbeat cycle is the master rhythm
2. Invisible mechanics, visible life — scan line is invisible
3. Ambient not distracting — motion is background
4. Functional motion — amber for urgency, cyan for replies
5. Consistent timing — reference CYCLE_MS and harmonics

### Approved tuning values (electric6 canonical):
| Parameter | Value |
|---|---|
| `BLOB_COUNT` | 9 |
| `RADIUS_MIN/MAX` | 110–240px |
| `CYCLE_MS` | 8000ms |
| `PULSE_SWELL` | 0.22 |
| `OPACITY_BASE` | 0.10 |
| `OPACITY_FLARE` | 0.14 |
| `BLUR_PX` | 55px |
| Scan `LIT_MS` | 280ms |
| Scan `FADE_MS` | 1400ms |
| Scan border opacity | 0.35 |

### Button hover interaction (locked):
- Ink drop: radial bloom from cursor entry, 1800ms, cubic ease-out
- Pulse ring: expands to 1.48× from wrapper outside overflow:hidden,
  opacity 0.44, 1.2s
- No hover lift (translateY removed from all buttons)
- One-shot per hover

---

## Live files

### Beta page (live)
- **URL:** https://corisleachman.github.io/beta-invite/
- **Domain:** www.pulse-outreach.co.uk (DNS being configured)
- **Repo:** corisleachman/beta-invite (GitHub Pages)
- **Canonical file:** index.html
- **Backup:** index-original.html

### Exploration files (reference only, not live pages)
- `electric.html` — heartbeat only
- `electric2.html` — heartbeat + scan
- `electric6.html` — canonical approved version (basis for index.html)
- `electric-light.html` — light mode version
- `pulse-variants.html` — headline variant explorer (A/B/C/D)

### Dashboard wireframes
- **Hub:** corisleachman.github.io/outreach-dashboard/hub.html
- **Repo:** corisleachman/outreach-dashboard
- **Canonical campaign view:** wireframes/campaign-view-v3.html
- **Activation wizard:** wireframes/outreach-wizard-v3.html
- **Dashboard home:** wireframes/dashboard-home.html
- **Key docs:** WIREFRAME-DECISIONS.md, MOTION-SYSTEM.md

---

## Beta page — what's on it (for reference/consistency)

Sections in order:
1. **Nav** — Pulse. logo (white + gradient dot) + "Request access →" CTA
2. **Hero** — Badge ("Invite-only beta") + "Pulse. / The heartbeat of
   outreach." headline + sub + CTAs
3. **Problem** — "Most outreach systems are built wrong"
4. **How it works** — 3 steps: Import & review / Send with intention /
   Never lose momentum
5. **Features** — What the system does + feature checklist (Free/Pro tags)
6. **Screen cards** — 6 feature screenshots with descriptions
7. **Access form** — First name, email, role, outreach method →
   webhook to Make.com
8. **Founder note** — Coris quote
9. **Footer**

Form webhook: `https://hook.eu1.make.com/eapza1auhc7ii5m2vcnljn98nbaie1bb`
Sends: `first_name`, `email`, `role`, `outreach_method`, `created_at`,
`source_url` as `application/x-www-form-urlencoded`

---

## Tech stack

- **Frontend:** Next.js (React) on Vercel
- **Backend:** Supabase (PostgreSQL + RLS)
- **Auth:** Gmail OAuth
- **AI:** Claude API (Anthropic)
- **Payments:** Stripe
- **Local path:** `/Users/impero/outreach-app`
- **Production:** outreach-app-theta.vercel.app
- **Repo:** corisleachman/outreach-app (private)

The marketing site will likely be a separate static site or a new
Next.js project — this hasn't been decided yet. The beta page is pure
HTML/CSS/JS on GitHub Pages, which has worked well for iteration speed.

---

## GitHub tooling

Push helper pattern (recreate at `/tmp/gh.py` each session):
```python
import base64, json, urllib.request

TOKEN = "YOUR_GITHUB_TOKEN_HERE"
REPO  = "corisleachman/beta-invite"  # change per repo

def push(local_path, repo_path, message):
    with open(local_path, 'rb') as f:
        content = base64.b64encode(f.read()).decode()
    req = urllib.request.Request(
        f"https://api.github.com/repos/{REPO}/contents/{repo_path}")
    req.add_header("Authorization", f"token {TOKEN}")
    try:
        with urllib.request.urlopen(req) as r:
            sha = json.loads(r.read())['sha']
    except:
        sha = None
    payload = json.dumps({
        "message": message, "content": content,
        **({"sha": sha} if sha else {})
    }).encode()
    req2 = urllib.request.Request(
        f"https://api.github.com/repos/{REPO}/contents/{repo_path}",
        data=payload, method="PUT")
    req2.add_header("Authorization", f"token {TOKEN}")
    req2.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req2) as r:
        print(f"  ✓ {repo_path}")
```

**Cloudflare CDN note:** Injected script tags truncate JavaScript blocks
— strip before deploying HTML files.

---

## Key decisions already made

- **Brand name:** Pulse. (dot is part of the brand)
- **Tagline:** The heartbeat of outreach.
- **Logo style:** "Pulse" in white, "." in pink→cyan gradient
- **Dark mode default**, light mode available as user preference
- **No hover lift on buttons** — translateY removed
- **Motion is ambient** — breathing not performing
- **Scan line is invisible** — boxes respond to it, line itself hidden
- **Warp effect on buttons** — explored, deferred (needs WebGL/shader
  pipeline to do justice)
- **Button interaction:** ink drop + pulse ring, one-shot per hover

---

## What the marketing site needs to do

This hasn't been fully specced yet — this conversation window is where
that spec will be developed. Starting questions to explore:

1. Is the marketing site a separate domain/subdomain from the beta page,
   or does it replace it when the product launches?
2. What's the conversion goal — beta signups, waitlist, direct purchase?
3. Does it need a pricing page, or just anchor to the Free/Pro
   distinction already on the beta page?
4. Screenshots/product visuals — use wireframe screenshots or wait for
   real product UI?
5. Same pure HTML/GitHub Pages approach as beta page, or Next.js?

---

## First session suggested starting point

Read this document, then read MOTION-SYSTEM.md from the outreach-dashboard
repo, then fetch and read the current index.html from corisleachman/beta-invite
to understand the full current state before proposing anything new.

