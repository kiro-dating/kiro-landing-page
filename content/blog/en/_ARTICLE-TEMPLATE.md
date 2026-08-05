---
# ═══════════════════════════════════════════════════════════════════════════
# ARTICLE TEMPLATE — Kiro blog (English)
# ───────────────────────────────────────────────────────────────────────────
# Mirror of content/blog/fr/_MODELE-ARTICLE.md. Same fields, same rules.
#
# 1. Copy to:  content/blog/en/my-seo-slug.md
#    The FILENAME becomes the URL: /en/blog/my-seo-slug/
# 2. Remove `draft: true` when ready to publish.
# 3. Run `npm run blog:build` to check, `npm run build` for the full site.
#
# English articles are NOT translations by default. Write them natively for
# the Canadian anglophone reader, and only where Kiro has something specific
# to say (diaspora, bilingual Montreal, newcomers). Generic English dating
# keywords are saturated worldwide — not worth the effort.
# ═══════════════════════════════════════════════════════════════════════════

# ── REQUIRED ───────────────────────────────────────────────────────────────

title: 'Article title with the main keyword'
# Optional: <title> tag when it should differ from the H1. Used verbatim
# (no « | Kiro » suffix is appended), so keep it to 50-60 characters.
# Without it, the <title> is "{title} | Kiro".
seoTitle: 'The SERP-optimised title, 50-60 characters'
slug: 'my-seo-slug'
description: 'What the reader will learn, in one clear sentence that earns the click from Google.'
publishedAt: '2026-08-04'
# NOTE: `category` and `tags` use the internal KEYS from taxonomy.json
# (they are language-independent); the English slug and label are resolved from there.
category: 'conversation-et-profil'
author: 'equipe-kiro'

# ── RECOMMENDED ────────────────────────────────────────────────────────────

updatedAt: '2026-08-04'
excerpt: 'The standfirst: what this article covers, in one or two direct sentences.'
cover: '/images/blog/my-seo-slug.webp'
coverAlt: 'Image description for accessibility and image SEO.'
tags:
  - 'premier-message'
  - 'montreal'

# ── OPTIONAL ───────────────────────────────────────────────────────────────

draft: true
featured: false
# readingTime: 8
# related:
#   - 'another-article'

# Same value in the FR and EN files → reciprocal hreflang tags.
# translationKey: 'my-topic'

# noindex: false
# canonical: 'https://kirodating.com/en/blog/another-page/'

# ── FAQ ────────────────────────────────────────────────────────────────────
# Renders an accordion at the end of the article AND emits schema.org/FAQPage
# structured data. 3-6 questions max, phrased the way people actually search,
# answered in 40-60 words with the direct answer first.
faq:
  - q: 'A question phrased the way people actually type it?'
    a: 'The direct answer in the first sentence, then one useful detail. Around 40-60 words.'
  - q: 'A second common question?'
    a: 'Short, concrete, no hedging. An [internal link](/en/blog/another-article/) works here.'
---

<!--
  BODY STRUCTURE
  · No `# H1` here — the H1 comes from the `title` field.
  · Open with 2-3 paragraphs: the problem, why it matters in Quebec/Canada,
    and what this article delivers.
  · Then 5-9 `## H2` sections, with `### H3` where needed. Three or more H2s
    automatically generate the table of contents.
  · Length: 900-1,300 words for focused advice, 2,000-3,500 for a pillar page.
  · 3-5 internal links minimum, at least one crossing into another cluster.
    Descriptive anchors, never "click here".
  · ONE product call to action in the body, after real value has landed. The
    footer CTA block is added automatically — do not duplicate it.
  · Tone: direct, second person, no miracle promises.
-->

Opening paragraph: state the concrete problem in its Canadian context.

Second paragraph: what this article delivers.

## First H2: the main question

Body copy. Short paragraphs read better on mobile — and mobile will be most
of this blog's traffic.

## Second H2

Content.

## Where Kiro fits

The single product passage in the body. It should answer a question the
reader already has at this point, not interrupt them.

## The short version

Three to five lines summarising the essentials.
