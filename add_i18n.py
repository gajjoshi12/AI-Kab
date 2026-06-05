#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Adds EN/ES bilingual support to index.html.
- Injects CSS for the language toggle button
- Adds the EN · ES toggle pill to the nav
- Adds data-i18n / data-i18n-html attributes to every translatable element
- Wraps bare text-nodes (e.g. "WhatsApp us") in <span data-i18n="...">
- Injects the full LANGS translations object + setLang / toggleLang JS
"""

import re

PATH = r'C:\Users\Gaj\Desktop\Coding-Projects\experience-lounge\index.html'

with open(PATH, 'r', encoding='utf-8') as f:
    h = f.read()

# ─────────────────────────────────────────────────────────────────
# 1.  CSS for the language pill
# ─────────────────────────────────────────────────────────────────
LANG_CSS = """
    /* ── Language switcher ─────────────────────────────────────────── */
    .lang-pill {
      display: inline-flex; align-items: center; gap: 3px;
      background: none; border: 1px solid var(--line-2); border-radius: 8px;
      padding: 4px 9px; font-family: var(--mono); font-size: 9px;
      letter-spacing: .12em; text-transform: uppercase; cursor: pointer;
      color: var(--muted-2);
      transition: border-color .2s, color .2s, background .2s;
      flex-shrink: 0;
    }
    .lang-pill:hover { border-color: var(--accent); background: var(--accent-3); color: var(--accent); }
    .lang-pill .lp-sep { opacity: .35; }
    .lang-pill .lp-on  { color: var(--accent); font-weight: 600; }
"""
h = h.replace('  </style>', LANG_CSS + '  </style>', 1)


# ─────────────────────────────────────────────────────────────────
# 2.  Nav: add lang pill + data-i18n on nav links + CTA
# ─────────────────────────────────────────────────────────────────
h = h.replace(
    '    <div class="nav-links">\n      <a href="#features">Features</a>\n      <a href="#demos">Live Demos</a>\n      <a href="#results">Results</a>\n\n    </div>\n    <div class="nav-cta">\n      <a href="#cta" class="btn btn-solid">Book A Demo</a>\n    </div>',
    '    <div class="nav-links">\n      <a href="#features" data-i18n="nav-features">Features</a>\n      <a href="#demos" data-i18n="nav-demos">Live Demos</a>\n      <a href="#results" data-i18n="nav-results">Results</a>\n\n    </div>\n    <div class="nav-cta">\n      <button class="lang-pill" id="lang-pill" onclick="toggleLang()" aria-label="Switch language"><span class="lp-on" id="lp-en">EN</span><span class="lp-sep">·</span><span id="lp-es">ES</span></button>\n      <a href="#cta" class="btn btn-solid" data-i18n="nav-cta">Book A Demo</a>\n    </div>'
)


# ─────────────────────────────────────────────────────────────────
# 3.  Hero
# ─────────────────────────────────────────────────────────────────
# Hero meta first span
h = h.replace(
    '<span class="mono">— AI Front Desk · Every Service Business</span>',
    '<span class="mono" data-i18n="hero-meta">— AI Front Desk · Every Service Business</span>'
)

# Hero h1 — mark for JS rebuild
h = h.replace('<h1 class="hero-title">', '<h1 class="hero-title" data-i18n-hero="true">')

# "Start converting more customers." — multi-line p, add attr after <p
h = re.sub(
    r'(<p)\s*\n(\s+style="font-size:clamp\(26px)',
    r'<p data-i18n="hero-sub-1"\n\2',
    h
)

# AIKABZ helps... — has <strong>, use innerHTML
h = re.sub(
    r'(<p class="reveal")\s*\n(\s+style="font-size:clamp\(15px,1\.6vw,19px\))',
    r'<p class="reveal" data-i18n-html="hero-sub-2"\n\2',
    h
)


# ─────────────────────────────────────────────────────────────────
# 4.  Verticals strip
# ─────────────────────────────────────────────────────────────────
h = h.replace(
    '<div class="strip-label">Built for any service business</div>',
    '<div class="strip-label" data-i18n="strip-label">Built for any service business</div>'
)
STRIP_MAP = {
    'Real Estate': 'strip-real-estate',
    'Restaurants': 'strip-restaurants',
    'Salons': 'strip-salons',
    'Fitness Studios': 'strip-fitness',
    'Law Firms': 'strip-law',
    'Agencies': 'strip-agencies',
    'Home Services': 'strip-home',
    'Med Spas': 'strip-medspas',
    'Photography': 'strip-photo',
    'Wellness': 'strip-wellness',
    'Auto': 'strip-auto',
    'Clinics': 'strip-clinics',
}
for txt, key in STRIP_MAP.items():
    h = h.replace(
        f'<span class="strip-item">{txt}</span>',
        f'<span class="strip-item" data-i18n="{key}">{txt}</span>',
        1  # only first occurrence (the original, before JS duplicates)
    )


# ─────────────────────────────────────────────────────────────────
# 5.  Features section
# ─────────────────────────────────────────────────────────────────
h = h.replace(
    '<h2 class="sec-h reveal">A real AI teammate —<em> not a chatbot.</em></h2>',
    '<h2 class="sec-h reveal" data-i18n-html="feat-h">A real AI teammate —<em> not a chatbot.</em></h2>'
)
FEATS = [
    ('01 · AI Front Desk', 'feat-1-k'),
    ('Never misses a customer', 'feat-1-name'),
    ('02 · Real-Time Booking', 'feat-2-k'),
    ('Books while you sleep', 'feat-2-name'),
    ('03 · Voice AI', 'feat-3-k'),
    ('24/7 phone teammate', 'feat-3-name'),
    ('04 · Unified Inbox', 'feat-4-k'),
    ('All channels, one inbox', 'feat-4-name'),
    ('05 · Knowledge-Grounded', 'feat-5-k'),
    ('Knows your business inside out', 'feat-5-name'),
    ('06 · Retention Engine', 'feat-6-k'),
    ('Win-backs &amp; referrals', 'feat-6-name'),
]
# feat-k divs
h = h.replace('<div class="feat-k">01 · AI Front Desk</div>', '<div class="feat-k" data-i18n="feat-1-k">01 · AI Front Desk</div>')
h = h.replace('<div class="feat-k">02 · Real-Time Booking</div>', '<div class="feat-k" data-i18n="feat-2-k">02 · Real-Time Booking</div>')
h = h.replace('<div class="feat-k">03 · Voice AI</div>', '<div class="feat-k" data-i18n="feat-3-k">03 · Voice AI</div>')
h = h.replace('<div class="feat-k">04 · Unified Inbox</div>', '<div class="feat-k" data-i18n="feat-4-k">04 · Unified Inbox</div>')
h = h.replace('<div class="feat-k">05 · Knowledge-Grounded</div>', '<div class="feat-k" data-i18n="feat-5-k">05 · Knowledge-Grounded</div>')
h = h.replace('<div class="feat-k">06 · Retention Engine</div>', '<div class="feat-k" data-i18n="feat-6-k">06 · Retention Engine</div>')
# feat-name divs
h = h.replace('<div class="feat-name">Never misses a customer</div>', '<div class="feat-name" data-i18n="feat-1-name">Never misses a customer</div>')
h = h.replace('<div class="feat-name">Books while you sleep</div>', '<div class="feat-name" data-i18n="feat-2-name">Books while you sleep</div>')
h = h.replace('<div class="feat-name">24/7 phone teammate</div>', '<div class="feat-name" data-i18n="feat-3-name">24/7 phone teammate</div>')
h = h.replace('<div class="feat-name">All channels, one inbox</div>', '<div class="feat-name" data-i18n="feat-4-name">All channels, one inbox</div>')
h = h.replace('<div class="feat-name">Knows your business inside out</div>', '<div class="feat-name" data-i18n="feat-5-name">Knows your business inside out</div>')
h = h.replace('<div class="feat-name">Win-backs &amp; referrals</div>', '<div class="feat-name" data-i18n="feat-6-name">Win-backs &amp; referrals</div>')
# feat-desc (use regex since they span multiple lines)
FEAT_DESCS = [
    (r'Answers WhatsApp, Instagram, LinkedIn, Messenger, email, and SMS like a real teammate\.\s*Knows your services, KB, and hours\.', 'feat-1-desc'),
    (r'Proposes real available slots from your calendar\. Books, reschedules, and cancels from\s*the chat — single approval\.', 'feat-2-desc'),
    (r'Answers, qualifies, and books on every call\. Every call recorded, transcribed, scored,\s*and routed intelligently\.', 'feat-3-desc'),
    (r'Every conversation across every channel in one place\. AI runs the front desk by default —\s*flip to human with one toggle\.', 'feat-4-desc'),
    (r'Pricing, policies, services, FAQs\. The AI never invents what it does not know — grounded\s*in your knowledge base\.', 'feat-5-desc'),
    (r'Automated win-backs, AI lead scoring, and a referral engine that turns happy customers\s*into your top growth channel\.', 'feat-6-desc'),
]
for pattern, key in FEAT_DESCS:
    h = re.sub(
        r'(<p class="feat-desc">)(' + pattern + r')(</p>)',
        lambda m, k=key: f'<p class="feat-desc" data-i18n="{k}">{m.group(2)}</p>',
        h, flags=re.DOTALL
    )


# ─────────────────────────────────────────────────────────────────
# 6.  Split / trained-on-your-business
# ─────────────────────────────────────────────────────────────────
h = h.replace(
    '<div class="sec-num">Trained on YOUR business</div>',
    '<div class="sec-num" data-i18n="split-num">Trained on YOUR business</div>'
)
h = h.replace(
    '<h2 class="sec-h" style="margin-bottom:0;">The AI knows your services, your policies, your prices —<em> and\n              only ever answers from that.</em></h2>',
    '<h2 class="sec-h" data-i18n-html="split-h" style="margin-bottom:0;">The AI knows your services, your policies, your prices —<em> and\n              only ever answers from that.</em></h2>'
)
h = re.sub(
    r'(<p>)Tell us what kind of business you run and AI Kabz sets itself up(.*?)(</p>)',
    lambda m: f'<p data-i18n="split-p">Tell us what kind of business you run and AI Kabz sets itself up{m.group(2)}</p>',
    h, flags=re.DOTALL
)


# ─────────────────────────────────────────────────────────────────
# 7.  Demos intro
# ─────────────────────────────────────────────────────────────────
h = h.replace(
    '<div class="sec-tag">Live Demos</div>',
    '<div class="sec-tag" data-i18n="demos-tag">Live Demos</div>'
)
h = h.replace(
    '<h2>Watch it work —<em> in real time</em></h2>',
    '<h2 data-i18n-html="demos-h">Watch it work —<em> in real time</em></h2>'
)
h = h.replace(
    '<p>Scroll through each demo.\n      </p>',
    '<p data-i18n="demos-p">Scroll through each demo.\n      </p>'
)


# ─────────────────────────────────────────────────────────────────
# 8.  Demo rows 1–6
# ─────────────────────────────────────────────────────────────────

# sec-num for each demo
h = h.replace('<div class="sec-num">01 · AI Kabz AI Front Desk</div>', '<div class="sec-num" data-i18n="d1-num">01 · AI Kabz AI Front Desk</div>')
h = h.replace('<div class="sec-num">02 · Smart Follow-Up</div>', '<div class="sec-num" data-i18n="d2-num">02 · Smart Follow-Up</div>')
h = h.replace('<div class="sec-num">03 · Voice AI</div>', '<div class="sec-num" data-i18n="d3-num">03 · Voice AI</div>')
h = h.replace('<div class="sec-num">04 · AI Support</div>', '<div class="sec-num" data-i18n="d4-num">04 · AI Support</div>')
h = h.replace('<div class="sec-num">05 · Reputation Management</div>', '<div class="sec-num" data-i18n="d5-num">05 · Reputation Management</div>')
h = h.replace('<div class="sec-num">06 · Call Analytics</div>', '<div class="sec-num" data-i18n="d6-num">06 · Call Analytics</div>')

# demo-name h3s (have <em> inside → use data-i18n-html)
h = h.replace(
    '<h3 class="demo-name">AI that responds in seconds, day or night,<em> around the clock</em></h3>',
    '<h3 class="demo-name" data-i18n-html="d1-name">AI that responds in seconds, day or night,<em> around the clock</em></h3>'
)
h = h.replace(
    '<h3 class="demo-name">Multi-channel nurture,<em> fully automated</em></h3>',
    '<h3 class="demo-name" data-i18n-html="d2-name">Multi-channel nurture,<em> fully automated</em></h3>'
)
h = h.replace(
    '<h3 class="demo-name">Every call answered,<em> every booking captured</em></h3>',
    '<h3 class="demo-name" data-i18n-html="d3-name">Every call answered,<em> every booking captured</em></h3>'
)
h = h.replace(
    '<h3 class="demo-name">80% of tickets resolved<em> in seconds</em></h3>',
    '<h3 class="demo-name" data-i18n-html="d4-name">80% of tickets resolved<em> in seconds</em></h3>'
)
h = h.replace(
    '<h3 class="demo-name">Every review monitored,<em> every reply perfect</em></h3>',
    '<h3 class="demo-name" data-i18n-html="d5-name">Every review monitored,<em> every reply perfect</em></h3>'
)
h = h.replace(
    '<h3 class="demo-name">Every sales call scored,<em> every pattern surfaced</em></h3>',
    '<h3 class="demo-name" data-i18n-html="d6-name">Every sales call scored,<em> every pattern surfaced</em></h3>'
)

# demo-desc paragraphs
DEMO_DESCS = [
    ('AI Kabz handles every inbound enquiry across WhatsApp, Instagram DMs, email, and more —\n          qualifying leads, answering questions, and booking slots in under 3 seconds.', 'd1-desc'),
    ('Behaviour-triggered sequences fire across email, WhatsApp, and SMS based on what each lead\n          actually does — open, click, reply, or go quiet.', 'd2-desc'),
    ('Your AI receptionist answers every inbound call, detects intent, checks live calendar\n          availability, and confirms appointments — no hold music, no missed revenue.', 'd3-desc'),
    ('The AI works through your support queue in real time — resolving password resets, billing\n          questions, and FAQs automatically, escalating only what truly needs a human.', 'd4-desc'),
    ('AI Kabz watches Google, Yelp, TripAdvisor, and industry-specific platforms. Negative\n          reviews\n          get an instant, empathetic AI response — positive ones get amplified.', 'd5-desc'),
    ('AI transcribes, scores, and analyses every sales call — flagging losing patterns, top\n          objections, talk-time ratios, and which reps close and which don\'t.', 'd6-desc'),
]
for txt, key in DEMO_DESCS:
    h = h.replace(
        f'<p class="demo-desc">{txt}</p>',
        f'<p class="demo-desc" data-i18n="{key}">{txt}</p>'
    )

# demo bullets
BULLETS = [
    # demo 1
    ('Responds across 7+ channels simultaneously', 'd1-b1'),
    ('Qualifies leads with natural conversation', 'd1-b2'),
    ('Books directly from the chat thread', 'd1-b3'),
    ('Escalates to human with full context', 'd1-b4'),
    # demo 2
    ('Triggers on open, click, and no-reply', 'd2-b1'),
    ('Adapts channel based on engagement', 'd2-b2'),
    ('10-touch sequence runs on autopilot', 'd2-b3'),
    ('Books demos when intent is detected', 'd2-b4'),
    # demo 3
    ('Answers in under 2 rings, 24/7', 'd3-b1'),
    ('Detects appointment intent vs general enquiry', 'd3-b2'),
    ('Books real slots from your live calendar', 'd3-b3'),
    ('Sends SMS confirmation instantly', 'd3-b4'),
    # demo 4
    ('Resolves 70–80% of tickets autonomously', 'd4-b1'),
    ('Uses your SOPs and FAQ library', 'd4-b2'),
    ('Priority scoring: high / med / low', 'd4-b3'),
    ('Escalates edge cases with full context', 'd4-b4'),
    # demo 5
    ('Monitors all major review platforms', 'd5-b1'),
    ('AI responds to negatives within minutes', 'd5-b2'),
    ('Weekly sentiment trend reports', 'd5-b3'),
    ('Surfaces review requests to happy customers', 'd5-b4'),
    # demo 6
    ('Auto-transcription of every call', 'd6-b1'),
    ('0–100 sales quality score per call', 'd6-b2'),
    ('Talk-time ratio: rep vs prospect', 'd6-b3'),
    ('Flags top objections across all calls', 'd6-b4'),
]
for txt, key in BULLETS:
    h = h.replace(f'<li>{txt}</li>', f'<li data-i18n="{key}">{txt}</li>')


# ─────────────────────────────────────────────────────────────────
# 9.  Wide editorial
# ─────────────────────────────────────────────────────────────────
h = re.sub(
    r'(<div class="sec-num mono" [^>]+>)Calm by\s*default(</div>)',
    r'\1<span data-i18n="wide-num">Calm by default</span>\2',
    h
)
h = h.replace(
    '<h2 class="wide-h">No red badges.<em> No busy dashboards.</em><br>Just the next right thing to do.</h2>',
    '<h2 class="wide-h" data-i18n-html="wide-h">No red badges.<em> No busy dashboards.</em><br>Just the next right thing to do.</h2>'
)


# ─────────────────────────────────────────────────────────────────
# 10. Testimonials / outcome cards
# ─────────────────────────────────────────────────────────────────
h = h.replace(
    '<div class="sec-num">02 / 03 · The difference</div>',
    '<div class="sec-num" data-i18n="voices-num">02 / 03 · The difference</div>'
)
h = h.replace(
    '<h2 class="sec-h reveal">What changes when you use AIKABZ.<em> From day one.</em></h2>',
    '<h2 class="sec-h reveal" data-i18n-html="voices-h">What changes when you use AIKABZ.<em> From day one.</em></h2>'
)
QUOTES_TEXT = [
    ('Every enquiry gets a reply before your competitor\n            picks up the phone. No more leads going cold because someone was busy with another customer.', 'q1-text'),
    ('Respond in seconds, not hours', 'q1-who'),
    ('Automated instant replies across every channel', 'q1-at'),
    ('Follow-ups happen automatically — no reminders, no\n            spreadsheets, no dropped balls. Every customer gets the right message at exactly the right time.', 'q2-text'),
    ('Follow-ups that never stop', 'q2-who'),
    ('Multi-step sequences running 24/7 on autopilot', 'q2-at'),
    ('Your calendar fills itself. Your reviews improve.\n            Your revenue grows — without hiring more staff or working longer hours.', 'q3-text'),
    ('More bookings, less effort', 'q3-who'),
    ('Growth that runs while you focus on your work', 'q3-at'),
]
for txt, key in QUOTES_TEXT:
    if key.endswith('-text'):
        h = h.replace(
            f'<p class="q-text" style="font-style:normal;font-size:15px;">{txt}</p>',
            f'<p class="q-text" data-i18n="{key}" style="font-style:normal;font-size:15px;">{txt}</p>'
        )
    elif key.endswith('-who'):
        h = h.replace(
            f'<div class="q-who">{txt}</div>',
            f'<div class="q-who" data-i18n="{key}">{txt}</div>'
        )
    elif key.endswith('-at'):
        h = h.replace(
            f'<div class="q-at" style="margin-top:4px;">{txt}</div>',
            f'<div class="q-at" data-i18n="{key}" style="margin-top:4px;">{txt}</div>'
        )


# ─────────────────────────────────────────────────────────────────
# 11. Results
# ─────────────────────────────────────────────────────────────────
h = h.replace(
    '<div class="sec-num" style="text-align:center;margin-bottom:36px;">03 / 03 · Results · Median numbers, not the\n        best case</div>',
    '<div class="sec-num" data-i18n="res-num" style="text-align:center;margin-bottom:36px;">03 / 03 · Results · Median numbers, not the\n        best case</div>'
)
RESULTS_CELLS = [
    ('+38%', 'res-1-k'), ('Revenue lift · first 90 days', 'res-1-l'), ('Median · all verticals', 'res-1-sub'),
    ('&lt;60s', 'res-2-k'), ('Lead response time', 'res-2-l'), ('vs 2–4 hour industry avg', 'res-2-sub'),
    ('86%', 'res-3-k'), ('Support tickets auto-resolved', 'res-3-l'), ('Without human intervention', 'res-3-sub'),
    ('11×', 'res-4-k'), ('Median LTV : CAC ratio', 'res-4-l'), ('Category benchmark: 3×', 'res-4-sub'),
]
for txt, key in RESULTS_CELLS:
    css = 'res-k' if key.endswith('-k') else ('res-l' if key.endswith('-l') else 'res-sub')
    h = h.replace(
        f'<div class="{css}">{txt}</div>',
        f'<div class="{css}" data-i18n="{key}">{txt}</div>'
    )


# ─────────────────────────────────────────────────────────────────
# 12. CTA section
# ─────────────────────────────────────────────────────────────────
h = h.replace(
    '<div class="sec-num" style="text-align:center;margin-bottom:16px;">Begin</div>',
    '<div class="sec-num" data-i18n="cta-num" style="text-align:center;margin-bottom:16px;">Begin</div>'
)
h = h.replace(
    '<h2 class="cta-h reveal">Your next quarter<br><em>starts today.</em></h2>',
    '<h2 class="cta-h reveal" data-i18n-html="cta-h">Your next quarter<br><em>starts today.</em></h2>'
)
h = h.replace(
    '<p class="cta-sub reveal">Most businesses see ROI in 30 days. The only risk is waiting.</p>',
    '<p class="cta-sub reveal" data-i18n="cta-sub">Most businesses see ROI in 30 days. The only risk is waiting.</p>'
)
h = h.replace(
    '<button onclick="openCalendly()" class="btn btn-solid btn-lg">Book A Demo</button>',
    '<button onclick="openCalendly()" class="btn btn-solid btn-lg" data-i18n="cta-btn">Book A Demo</button>'
)
h = h.replace(
    '<a href="#features" class="btn btn-ghost btn-lg">Explore features</a>',
    '<a href="#features" class="btn btn-ghost btn-lg" data-i18n="cta-explore">Explore features</a>'
)
# WhatsApp text node → wrap in span
h = h.replace(
    '          WhatsApp us\n        </a>',
    '          <span data-i18n="cta-wa">WhatsApp us</span>\n        </a>'
)
h = h.replace(
    '<p class="cta-note reveal" style="margin-top:18px;">No credit card · 20-min call · No obligation</p>',
    '<p class="cta-note reveal" data-i18n="cta-note" style="margin-top:18px;">No credit card · 20-min call · No obligation</p>'
)


# ─────────────────────────────────────────────────────────────────
# 13. Footer
# ─────────────────────────────────────────────────────────────────
h = h.replace(
    '<p class="foot-tag">The AI front desk for service businesses. Every conversation, every booking, every\n            customer — in one place.</p>',
    '<p class="foot-tag" data-i18n="foot-tag">The AI front desk for service businesses. Every conversation, every booking, every\n            customer — in one place.</p>'
)
h = h.replace(
    '<h4>Navigate</h4>',
    '<h4 data-i18n="foot-nav-h">Navigate</h4>'
)
h = h.replace(
    '<li><a href="#features">Features</a></li>',
    '<li><a href="#features" data-i18n="foot-nav-features">Features</a></li>'
)
h = h.replace(
    '<li><a href="#demos">Live Demos</a></li>',
    '<li><a href="#demos" data-i18n="foot-nav-demos">Live Demos</a></li>'
)
h = h.replace(
    '<li><a href="#results">Results</a></li>',
    '<li><a href="#results" data-i18n="foot-nav-results">Results</a></li>'
)
h = h.replace(
    '<li><a href="#voices">Why AIKABZ</a></li>',
    '<li><a href="#voices" data-i18n="foot-nav-why">Why AIKABZ</a></li>'
)
h = h.replace(
    '<h4>Get Started</h4>',
    '<h4 data-i18n="foot-gs-h">Get Started</h4>'
)
h = h.replace(
    '<li><a href="#cta">Book A Demo</a></li>',
    '<li><a href="#cta" data-i18n="foot-gs-demo">Book A Demo</a></li>'
)
h = h.replace(
    '<span class="foot-copy">© 2026 AIKABZ — built for service businesses</span>',
    '<span class="foot-copy" data-i18n="foot-copy">© 2026 AIKABZ — built for service businesses</span>'
)


# ─────────────────────────────────────────────────────────────────
# 14. Inject translations JS (before closing </script>)
# ─────────────────────────────────────────────────────────────────
I18N_JS = r"""
    /* ── Translations ───────────────────────────────────────────────── */
    (function () {
      const LANGS = {
        en: {
          'nav-features': 'Features',
          'nav-demos': 'Live Demos',
          'nav-results': 'Results',
          'nav-cta': 'Book A Demo',

          'hero-meta': '— AI Front Desk · Every Service Business',
          'hero-sub-1': 'Start converting more customers.',
          'hero-sub-2': 'AIKABZ helps businesses <strong style="color:#F4F1EA;">respond instantly</strong>, follow up automatically, and turn more enquiries into paying customers.',

          'strip-label': 'Built for any service business',
          'strip-real-estate': 'Real Estate', 'strip-restaurants': 'Restaurants',
          'strip-salons': 'Salons', 'strip-fitness': 'Fitness Studios',
          'strip-law': 'Law Firms', 'strip-agencies': 'Agencies',
          'strip-home': 'Home Services', 'strip-medspas': 'Med Spas',
          'strip-photo': 'Photography', 'strip-wellness': 'Wellness',
          'strip-auto': 'Auto', 'strip-clinics': 'Clinics',

          'feat-h': 'A real AI teammate —<em> not a chatbot.</em>',
          'feat-1-k': '01 · AI Front Desk', 'feat-1-name': 'Never misses a customer',
          'feat-1-desc': 'Answers WhatsApp, Instagram, LinkedIn, Messenger, email, and SMS like a real teammate. Knows your services, KB, and hours.',
          'feat-2-k': '02 · Real-Time Booking', 'feat-2-name': 'Books while you sleep',
          'feat-2-desc': 'Proposes real available slots from your calendar. Books, reschedules, and cancels from the chat — single approval.',
          'feat-3-k': '03 · Voice AI', 'feat-3-name': '24/7 phone teammate',
          'feat-3-desc': 'Answers, qualifies, and books on every call. Every call recorded, transcribed, scored, and routed intelligently.',
          'feat-4-k': '04 · Unified Inbox', 'feat-4-name': 'All channels, one inbox',
          'feat-4-desc': 'Every conversation across every channel in one place. AI runs the front desk by default — flip to human with one toggle.',
          'feat-5-k': '05 · Knowledge-Grounded', 'feat-5-name': 'Knows your business inside out',
          'feat-5-desc': 'Pricing, policies, services, FAQs. The AI never invents what it does not know — grounded in your knowledge base.',
          'feat-6-k': '06 · Retention Engine', 'feat-6-name': 'Win-backs & referrals',
          'feat-6-desc': 'Automated win-backs, AI lead scoring, and a referral engine that turns happy customers into your top growth channel.',

          'split-num': 'Trained on YOUR business',
          'split-h': 'The AI knows your services, your policies, your prices —<em> and only ever answers from that.</em>',
          'split-p': 'Tell us what kind of business you run and AI Kabz sets itself up — your services, your prices, your tone. Every message it sends and every question it answers comes straight from your own information. It never guesses or makes things up.',

          'demos-tag': 'Live Demos',
          'demos-h': 'Watch it work —<em> in real time</em>',
          'demos-p': 'Scroll through each demo.',

          'd1-num': '01 · AI Kabz AI Front Desk',
          'd1-name': 'AI that responds in seconds, day or night,<em> around the clock</em>',
          'd1-desc': 'AI Kabz handles every inbound enquiry across WhatsApp, Instagram DMs, email, and more — qualifying leads, answering questions, and booking slots in under 3 seconds.',
          'd1-b1': 'Responds across 7+ channels simultaneously', 'd1-b2': 'Qualifies leads with natural conversation',
          'd1-b3': 'Books directly from the chat thread', 'd1-b4': 'Escalates to human with full context',

          'd2-num': '02 · Smart Follow-Up',
          'd2-name': 'Multi-channel nurture,<em> fully automated</em>',
          'd2-desc': 'Behaviour-triggered sequences fire across email, WhatsApp, and SMS based on what each lead actually does — open, click, reply, or go quiet.',
          'd2-b1': 'Triggers on open, click, and no-reply', 'd2-b2': 'Adapts channel based on engagement',
          'd2-b3': '10-touch sequence runs on autopilot', 'd2-b4': 'Books demos when intent is detected',

          'd3-num': '03 · Voice AI',
          'd3-name': 'Every call answered,<em> every booking captured</em>',
          'd3-desc': 'Your AI receptionist answers every inbound call, detects intent, checks live calendar availability, and confirms appointments — no hold music, no missed revenue.',
          'd3-b1': 'Answers in under 2 rings, 24/7', 'd3-b2': 'Detects appointment intent vs general enquiry',
          'd3-b3': 'Books real slots from your live calendar', 'd3-b4': 'Sends SMS confirmation instantly',

          'd4-num': '04 · AI Support',
          'd4-name': '80% of tickets resolved<em> in seconds</em>',
          'd4-desc': 'The AI works through your support queue in real time — resolving password resets, billing questions, and FAQs automatically, escalating only what truly needs a human.',
          'd4-b1': 'Resolves 70–80% of tickets autonomously', 'd4-b2': 'Uses your SOPs and FAQ library',
          'd4-b3': 'Priority scoring: high / med / low', 'd4-b4': 'Escalates edge cases with full context',

          'd5-num': '05 · Reputation Management',
          'd5-name': 'Every review monitored,<em> every reply perfect</em>',
          'd5-desc': 'AI Kabz watches Google, Yelp, TripAdvisor, and industry-specific platforms. Negative reviews get an instant, empathetic AI response — positive ones get amplified.',
          'd5-b1': 'Monitors all major review platforms', 'd5-b2': 'AI responds to negatives within minutes',
          'd5-b3': 'Weekly sentiment trend reports', 'd5-b4': 'Surfaces review requests to happy customers',

          'd6-num': '06 · Call Analytics',
          'd6-name': 'Every sales call scored,<em> every pattern surfaced</em>',
          'd6-desc': "AI transcribes, scores, and analyses every sales call — flagging losing patterns, top objections, talk-time ratios, and which reps close and which don't.",
          'd6-b1': 'Auto-transcription of every call', 'd6-b2': '0–100 sales quality score per call',
          'd6-b3': 'Talk-time ratio: rep vs prospect', 'd6-b4': 'Flags top objections across all calls',

          'wide-num': 'Calm by default',
          'wide-h': 'No red badges.<em> No busy dashboards.</em><br>Just the next right thing to do.',

          'voices-num': '02 / 03 · The difference',
          'voices-h': 'What changes when you use AIKABZ.<em> From day one.</em>',
          'q1-text': 'Every enquiry gets a reply before your competitor picks up the phone. No more leads going cold because someone was busy with another customer.',
          'q1-who': 'Respond in seconds, not hours', 'q1-at': 'Automated instant replies across every channel',
          'q2-text': 'Follow-ups happen automatically — no reminders, no spreadsheets, no dropped balls. Every customer gets the right message at exactly the right time.',
          'q2-who': 'Follow-ups that never stop', 'q2-at': 'Multi-step sequences running 24/7 on autopilot',
          'q3-text': 'Your calendar fills itself. Your reviews improve. Your revenue grows — without hiring more staff or working longer hours.',
          'q3-who': 'More bookings, less effort', 'q3-at': 'Growth that runs while you focus on your work',

          'res-num': '03 / 03 · Results · Median numbers, not the best case',
          'res-1-k': '+38%', 'res-1-l': 'Revenue lift · first 90 days', 'res-1-sub': 'Median · all verticals',
          'res-2-k': '<60s', 'res-2-l': 'Lead response time', 'res-2-sub': 'vs 2–4 hour industry avg',
          'res-3-k': '86%', 'res-3-l': 'Support tickets auto-resolved', 'res-3-sub': 'Without human intervention',
          'res-4-k': '11×', 'res-4-l': 'Median LTV : CAC ratio', 'res-4-sub': 'Category benchmark: 3×',

          'cta-num': 'Begin',
          'cta-h': 'Your next quarter<br><em>starts today.</em>',
          'cta-sub': 'Most businesses see ROI in 30 days. The only risk is waiting.',
          'cta-btn': 'Book A Demo', 'cta-explore': 'Explore features',
          'cta-wa': 'WhatsApp us', 'cta-note': 'No credit card · 20-min call · No obligation',

          'foot-tag': 'The AI front desk for service businesses. Every conversation, every booking, every customer — in one place.',
          'foot-nav-h': 'Navigate', 'foot-nav-features': 'Features',
          'foot-nav-demos': 'Live Demos', 'foot-nav-results': 'Results', 'foot-nav-why': 'Why AIKABZ',
          'foot-gs-h': 'Get Started', 'foot-gs-demo': 'Book A Demo',
          'foot-copy': '© 2026 AIKABZ — built for service businesses',
        },
        es: {
          'nav-features': 'Funcionalidades',
          'nav-demos': 'Demos en Vivo',
          'nav-results': 'Resultados',
          'nav-cta': 'Reservar Demo',

          'hero-meta': '— Recepcionista IA · Para Todo Negocio de Servicios',
          'hero-sub-1': 'Empieza a convertir más clientes.',
          'hero-sub-2': 'AIKABZ ayuda a los negocios a <strong style="color:#F4F1EA;">responder al instante</strong>, hacer seguimiento automático y convertir más consultas en clientes de pago.',

          'strip-label': 'Para cualquier negocio de servicios',
          'strip-real-estate': 'Inmobiliaria', 'strip-restaurants': 'Restaurantes',
          'strip-salons': 'Salones', 'strip-fitness': 'Gimnasios',
          'strip-law': 'Despachos Jurídicos', 'strip-agencies': 'Agencias',
          'strip-home': 'Servicios del Hogar', 'strip-medspas': 'Centros Estéticos',
          'strip-photo': 'Fotografía', 'strip-wellness': 'Bienestar',
          'strip-auto': 'Automoción', 'strip-clinics': 'Clínicas',

          'feat-h': 'Un verdadero compañero IA —<em> no un chatbot.</em>',
          'feat-1-k': '01 · Recepcionista IA', 'feat-1-name': 'Nunca pierde un cliente',
          'feat-1-desc': 'Responde WhatsApp, Instagram, LinkedIn, Messenger, email y SMS como un compañero real. Conoce tus servicios, precios y horarios.',
          'feat-2-k': '02 · Reservas en Tiempo Real', 'feat-2-name': 'Reserva mientras duermes',
          'feat-2-desc': 'Propone horarios disponibles reales de tu calendario. Reserva, reprograma y cancela desde el chat — con una sola confirmación.',
          'feat-3-k': '03 · IA de Voz', 'feat-3-name': 'Compañero telefónico 24/7',
          'feat-3-desc': 'Atiende, califica y reserva en cada llamada. Cada llamada grabada, transcrita, puntuada y enrutada de forma inteligente.',
          'feat-4-k': '04 · Bandeja Unificada', 'feat-4-name': 'Todos los canales, una bandeja',
          'feat-4-desc': 'Cada conversación de todos los canales en un solo lugar. La IA gestiona la recepción por defecto — cambia a humano con un solo toque.',
          'feat-5-k': '05 · Base de Conocimiento', 'feat-5-name': 'Conoce tu negocio a fondo',
          'feat-5-desc': 'Precios, políticas, servicios y preguntas frecuentes. La IA nunca inventa lo que no sabe — responde desde tu propia base de conocimiento.',
          'feat-6-k': '06 · Motor de Retención', 'feat-6-name': 'Reactivaciones y referencias',
          'feat-6-desc': 'Reactivaciones automáticas, puntuación IA de leads y un motor de referencias que convierte a los clientes felices en tu canal de crecimiento.',

          'split-num': 'Entrenado en TU negocio',
          'split-h': 'La IA conoce tus servicios, tus políticas, tus precios —<em> y solo responde a partir de eso.</em>',
          'split-p': 'Cuéntanos qué tipo de negocio tienes y AI Kabz se configura solo — tus servicios, tus precios, tu tono. Cada mensaje que envía y cada pregunta que responde viene directamente de tu propia información. Nunca adivina ni inventa nada.',

          'demos-tag': 'Demos en Vivo',
          'demos-h': 'Míralo funcionar —<em> en tiempo real</em>',
          'demos-p': 'Desp\u00lazate por cada demo.',

          'd1-num': '01 · Recepcionista IA de Kabz',
          'd1-name': 'IA que responde en segundos, día y noche,<em> las 24 horas</em>',
          'd1-desc': 'AI Kabz gestiona cada consulta entrante en WhatsApp, Instagram DMs, email y más — calificando leads, respondiendo preguntas y reservando citas en menos de 3 segundos.',
          'd1-b1': 'Responde en 7+ canales simultáneamente', 'd1-b2': 'Califica leads con conversación natural',
          'd1-b3': 'Reserva directamente desde el hilo del chat', 'd1-b4': 'Escala a humano con contexto completo',

          'd2-num': '02 · Seguimiento Inteligente',
          'd2-name': 'Nutrición multicanal,<em> totalmente automatizada</em>',
          'd2-desc': 'Secuencias activadas por comportamiento en email, WhatsApp y SMS según lo que hace cada lead — abrir, hacer clic, responder o quedarse en silencio.',
          'd2-b1': 'Se activa en apertura, clic y sin respuesta', 'd2-b2': 'Adapta el canal según la interacción',
          'd2-b3': 'Secuencia de 10 contactos en piloto automático', 'd2-b4': 'Reserva demos cuando detecta intención',

          'd3-num': '03 · IA de Voz',
          'd3-name': 'Cada llamada atendida,<em> cada reserva capturada</em>',
          'd3-desc': 'Tu recepcionista IA responde cada llamada entrante, detecta la intención, comprueba disponibilidad en tiempo real y confirma citas — sin música de espera, sin ingresos perdidos.',
          'd3-b1': 'Responde en menos de 2 tonos, 24/7', 'd3-b2': 'Detecta intención de cita vs consulta general',
          'd3-b3': 'Reserva horarios reales de tu calendario', 'd3-b4': 'Envía confirmación por SMS al instante',

          'd4-num': '04 · Soporte IA',
          'd4-name': 'El 80% de los tickets resueltos<em> en segundos</em>',
          'd4-desc': 'La IA trabaja tu cola de soporte en tiempo real — resolviendo contraseñas, preguntas de facturación y FAQs automáticamente, escalando solo lo que realmente necesita un humano.',
          'd4-b1': 'Resuelve el 70–80% de tickets de forma autónoma', 'd4-b2': 'Usa tus SOPs y biblioteca de FAQs',
          'd4-b3': 'Puntuación de prioridad: alta / media / baja', 'd4-b4': 'Escala casos complejos con contexto completo',

          'd5-num': '05 · Gestión de Reputación',
          'd5-name': 'Cada reseña monitorizada,<em> cada respuesta perfecta</em>',
          'd5-desc': 'AI Kabz vigila Google, Yelp, TripAdvisor y plataformas del sector. Las reseñas negativas reciben una respuesta IA inmediata y empática — las positivas se amplifican.',
          'd5-b1': 'Monitoriza todas las plataformas principales', 'd5-b2': 'IA responde a negativas en minutos',
          'd5-b3': 'Informes semanales de tendencias de sentimiento', 'd5-b4': 'Solicita reseñas a clientes satisfechos',

          'd6-num': '06 · Análisis de Llamadas',
          'd6-name': 'Cada llamada de ventas puntuada,<em> cada patrón descubierto</em>',
          'd6-desc': 'La IA transcribe, puntúa y analiza cada llamada de ventas — detectando patrones perdedores, principales objeciones, ratios de tiempo de habla y qué comerciales cierran.',
          'd6-b1': 'Transcripción automática de cada llamada', 'd6-b2': 'Puntuación de calidad de ventas 0–100 por llamada',
          'd6-b3': 'Ratio de tiempo de habla: comercial vs cliente', 'd6-b4': 'Detecta las principales objeciones en todas las llamadas',

          'wide-num': 'Calma por defecto',
          'wide-h': 'Sin notificaciones urgentes.<em> Sin paneles saturados.</em><br>Solo lo que tienes que hacer ahora.',

          'voices-num': '02 / 03 · La diferencia',
          'voices-h': 'Qué cambia cuando usas AIKABZ.<em> Desde el primer día.</em>',
          'q1-text': 'Cada consulta recibe respuesta antes de que tu competidor descuelgue el teléfono. Sin más leads fríos porque alguien estaba ocupado con otro cliente.',
          'q1-who': 'Responde en segundos, no en horas', 'q1-at': 'Respuestas automáticas instantáneas en todos los canales',
          'q2-text': 'Los seguimientos ocurren automáticamente — sin recordatorios, sin hojas de cálculo, sin nada que se escape. Cada cliente recibe el mensaje correcto en el momento exacto.',
          'q2-who': 'Seguimientos que nunca paran', 'q2-at': 'Secuencias de múltiples pasos funcionando 24/7 en piloto automático',
          'q3-text': 'Tu agenda se llena sola. Tus reseñas mejoran. Tus ingresos crecen — sin contratar más personal ni trabajar más horas.',
          'q3-who': 'Más reservas, menos esfuerzo', 'q3-at': 'Crecimiento que funciona mientras tú te centras en tu trabajo',

          'res-num': '03 / 03 · Resultados · Números medios, no el mejor caso',
          'res-1-k': '+38%', 'res-1-l': 'Aumento de ingresos · primeros 90 días', 'res-1-sub': 'Mediana · todos los sectores',
          'res-2-k': '<60s', 'res-2-l': 'Tiempo de respuesta a leads', 'res-2-sub': 'vs promedio del sector 2–4 horas',
          'res-3-k': '86%', 'res-3-l': 'Tickets de soporte resueltos automáticamente', 'res-3-sub': 'Sin intervención humana',
          'res-4-k': '11×', 'res-4-l': 'Ratio mediano LTV : CAC', 'res-4-sub': 'Referencia del sector: 3×',

          'cta-num': 'Comenzar',
          'cta-h': 'Tu próximo trimestre<br><em>empieza hoy.</em>',
          'cta-sub': 'La mayoría de negocios ven retorno en 30 días. El único riesgo es esperar.',
          'cta-btn': 'Reservar Demo', 'cta-explore': 'Explorar funcionalidades',
          'cta-wa': 'Eschíbenos por WhatsApp', 'cta-note': 'Sin tarjeta · Llamada de 20 min · Sin compromiso',

          'foot-tag': 'El recepcionista IA para negocios de servicios. Cada conversación, cada reserva, cada cliente — en un solo lugar.',
          'foot-nav-h': 'Navegar', 'foot-nav-features': 'Funcionalidades',
          'foot-nav-demos': 'Demos en Vivo', 'foot-nav-results': 'Resultados', 'foot-nav-why': 'Por qué AIKABZ',
          'foot-gs-h': 'Empezar', 'foot-gs-demo': 'Reservar Demo',
          'foot-copy': '© 2026 AIKABZ — para negocios de servicios',
        },
      };

      const HERO = {
        en: { line1: 'Stop', line2: 'leaking ', muted: 'revenue.' },
        es: { line1: 'Deja de', line2: 'perder ', muted: 'ingresos.' },
      };

      let currentLang = 'en';

      function buildHeroTitle(lang) {
        const h1 = document.querySelector('[data-i18n-hero]');
        if (!h1) return;
        const { line1, line2, muted } = HERO[lang];
        let d = 0.02;
        function ch(c, extra) {
          const s = `<span class="ch" style="animation-delay:${d.toFixed(2)}s${extra || ''}">${c === ' ' ? ' ' : c}</span>`;
          d += 0.03; return s;
        }
        let html = [...line1].map(c => ch(c)).join('') + '<br>';
        html += [...line2].map(c => ch(c)).join('');
        html += [...muted].map(c => ch(c, ';font-style:italic;color:rgba(244,241,234,.55)')).join('');
        h1.innerHTML = html;
      }

      function updateStrip(lang) {
        const row = document.getElementById('strip-row');
        if (!row) return;
        row.querySelectorAll('[data-i18n]').forEach(el => {
          const v = LANGS[lang][el.dataset.i18n];
          if (v !== undefined) el.textContent = v;
        });
        // Re-run the duplication
        const origItems = [...row.querySelectorAll('[data-i18n]')];
        const clones = origItems.map(el => el.cloneNode(true));
        // Remove any previously added clones (those without data-i18n)
        [...row.children].forEach(c => { if (!c.hasAttribute('data-i18n')) c.remove(); });
        clones.forEach(c => row.appendChild(c));
      }

      function setLang(lang) {
        currentLang = lang;
        document.documentElement.lang = lang;
        // Update pill
        const lpEn = document.getElementById('lp-en');
        const lpEs = document.getElementById('lp-es');
        if (lpEn && lpEs) {
          lpEn.className = lang === 'en' ? 'lp-on' : '';
          lpEs.className = lang === 'es' ? 'lp-on' : '';
        }
        // Hero title rebuild
        buildHeroTitle(lang);
        // All data-i18n elements (textContent)
        document.querySelectorAll('[data-i18n]').forEach(el => {
          // Skip strip items — handled by updateStrip
          if (el.classList.contains('strip-item')) return;
          const v = LANGS[lang][el.dataset.i18n];
          if (v !== undefined) el.textContent = v;
        });
        // All data-i18n-html elements (innerHTML)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
          const v = LANGS[lang][el.dataset.i18nHtml];
          if (v !== undefined) el.innerHTML = v;
        });
        // Strip (special — needs re-duplication)
        updateStrip(lang);
        // Also update <html lang> for SEO
        document.title = lang === 'es'
          ? 'AIKABZ — Recepcionista IA para Negocios de Servicios'
          : 'AIKABZ — AI Front Desk for Service Businesses';
        // Persist preference
        try { localStorage.setItem('aikabz-lang', lang); } catch (_) {}
      }

      window.toggleLang = function () {
        setLang(currentLang === 'en' ? 'es' : 'en');
      };

      // Auto-detect on first load
      (function () {
        let saved;
        try { saved = localStorage.getItem('aikabz-lang'); } catch (_) {}
        const pref = saved || (navigator.language || '').slice(0, 2).toLowerCase();
        if (pref === 'es') setLang('es');
      })();
    })();
"""

# Inject just before the closing </script>
h = h.replace('  </script>', I18N_JS + '  </script>', 1)

# ─────────────────────────────────────────────────────────────────
# Write back
# ─────────────────────────────────────────────────────────────────
with open(PATH, 'w', encoding='utf-8') as f:
    f.write(h)

print("Done — i18n applied to index.html")
