---
layout: post
title: "MingList's Verification Bot Was Blocked by Its Own Firewall"
date: 2026-11-22 16:00:00 +0800
lang: en
description: "MingList is a free local classifieds site where buyers and sellers meet in person without ever seeing each other's email. When a directory paused our listing, Cloudflare Security Events explained why four rounds of HTML changes could never fix it."
categories: Engineering
tags: MingList Cloudflare StartupFame Debugging Classifieds Privacy
---

[MingList](https://minglist.top/) is a free local classifieds site. Buyers and sellers meet in person, browse and reply without an account, and neither side ever sees the other's real email — every listing gets a disposable address like `reply-osfogyr3xkxw@minglist.top` that stops working when the listing comes down. In late October we listed the site on a directory called Startup Fame. When the free listing went live, the link from that directory back to MingList was do-follow.

Then, in the early hours of 22 November (Beijing time), an email told us the listing had been paused and the do-follow removed. The reason: the checker could not find a visible link to the directory on our homepage.

The badge had been on that page since 28 October. The separate root-domain link was added on the morning of the 22nd. Both were there when I finished.

What followed was a morning of changing the page, purging the cache, watching the same error come back after every attempt, and then finding the answer in a place I should have looked first.

## First: what the page actually said

I did not want to guess, so I checked what the checker was supposed to see. The [directory's own guide](https://startupfa.me/guides/homepage-badge) says its bot loads the homepage, looks for a visible link to the directory's root domain, and fails if that link is hidden or absent. It also says the embed code from the dashboard already meets the requirement.

The homepage at minglist.top, fetched with both a plain UA and the directory's bot UA, contained:

- a badge linking to the listing page, with `target="_blank"` and no `rel` attribute;
- a separate, visible text link to the root domain in the footer.

No `nofollow`, no `ugc`, no `sponsored`. Not hidden by CSS. The HTML matched the published criteria character for character. So the checker was reporting something that was not true of the page I was serving — or it was not seeing my page at all.

## Four rounds of changing the wrong thing

I had one clue: the error message named the checker's IP, `149.56.28.175`, and asked for a link I could see. So I assumed the link was somehow wrong.

**Round 1 — the link attributes.** My badge had `rel="noopener"` and the image had `loading="lazy"`. The official embed had neither. I removed both, bumped the script version, deployed, purged the cache. Verification failed with the same sentence.

**Round 2 — the root domain.** My only link had been the deep link to my listing. I added a separate visible text link to the root domain in all three footer templates, wrote an end-to-end assertion for it, deployed, purged. Failed again.

One caution about this round: I briefly believed the checklist's green ticks meant the checks had passed. They had not. Those ticks are the *list of requirements*, not results. Only one checkbox on that page is an actual user action. I corrected this in my notes after the fact — worth saying here because misreading a green tick cost me time.

**Round 3 — the image URL.** I had been using a static image URL from a pasted copy of the embed code. Reading the embed code live from the dashboard showed the current one was a different endpoint (`/badge?t=classic&theme=default`). I changed all three copies, deployed, purged. Failed again.

**Round 4 — the cache.** I had seen a real problem here: immediately after a deploy, repeated requests returned a mix of old and new HTML, because different edge nodes still held different copies. I purged the URL again and verified with a cache-buster that every request served the new version. Failed again.

At this point the strongest argument against my own theory was the obvious one: *you keep changing things, so maybe one of the changes will work eventually — or maybe your last change was wrong.* I could not answer that from the HTML side. Every version I served was already correct.

## Where I should have looked first

I searched the directory's feedback board. There were at least fifteen posts with the same shape: badge present, HTML correct, "Verify now" failing forever. One reporter, mamonov, had the same checker IP I did, a homepage that loaded fine, and a badge that was visible — and had been pending for about a month. Others described a listing that passed for weeks and then stopped being found without any change on their side.

Two things became clear. First, the error text is a template: it says "add a link" whether the real cause is a missing badge, a checker that cannot fetch the page, or a domain with no authority. It cannot tell you what is wrong. Second, if other people with correct HTML were failing too, the problem might not be on the page at all.

I then opened Cloudflare's **Security → Events** and filtered by the IP from the error message. There it was:

- `149.56.28.175`, Canada, `AS16276 OVH SAS`;
- Action: **Managed Challenge**; Service: **Bot fight mode**;
- User agent: `Mozilla/5.0 (X11; Linux x86_64) ... HeadlessChrome/121.0.0.0 Safari/537.36`;
- timestamps `11:28`, `11:33`, `12:02`, `12:03` (GMT+8) — exactly when I had clicked "Verify now."

The checker was never getting my HTML. It was getting a Cloudflare challenge page, which contains no directory link, no badge, and nothing to verify. The error message was technically right from its point of view: it could not find a link.

## Why every curl looked fine

This is the part that made the bug hard to see. Every request I made from my own machine returned HTTP 200 with the correct page. Bot Fight Mode challenges by IP reputation and browser fingerprint, not by URL. My residential IP and curl did not trigger it. A checker on an OVH datacenter IP running HeadlessChrome triggered it every time.

So the test I trusted most — "I fetched the page and the link is there" — was testing a different client from the one that mattered.

## The fix, and what it costs

I turned Bot Fight Mode off. "Verify now" passed immediately. No HTML change was needed; the page had been correct the whole time.

There is no way to keep free Bot Fight Mode and exempt one trusted checker. [Cloudflare's documentation](https://developers.cloudflare.com/bots/get-started/bot-fight-mode) is explicit: "You cannot bypass or skip Bot Fight Mode using WAF custom rules or Page Rules," because it runs in a separate evaluation pipeline where Skip, Bypass and Allow have no effect. The documented alternative is Super Bot Fight Mode (a paid product) or IP Access rules that match before BFM evaluates.

That is a real trade-off, not a free win. Turning BFM off removes an indiscriminate barrier against automated traffic. In my case the site's actual abuse controls live in the Worker — relay rate limits, validation, sender checks — not in BFM, and verified crawlers such as Googlebot and bingbot were not being challenged by BFM anyway. But if your only protection is BFM, turning it off is not the same fix.

## What I cannot claim from this

I can prove the cause in my case: the challenge events line up with the verification attempts, and the verification passed the moment BFM went off. I cannot claim that everyone reporting the same error is being challenged by their own CDN. Their HTML may be wrong, their bot may be blocked elsewhere, or the directory may have a bug. The shared error text makes all of those look identical from the outside.

I also cannot say the listing is restored yet. Verification passing is the first step; the directory says restoration goes through a manual review of several business days.

## The rule I am keeping

When a checker reports something you can see is there, and its checklist looks fine, do not spend the morning editing the page. Check what the checker actually received — in my case, Cloudflare Security Events filtered by the IP in the error, which showed a challenge page instead of my homepage.

I filed [a report on the directory's feedback board](https://startupfame.userjot.com/feedback/p/verification-keeps-failing-although-the-badge-is-live--) with the details, partly to get an answer and partly because someone else will hit this with their own CDN. None of the page changes could have fixed it: the bot was never reading the HTML.

## About MingList

[MingList](https://minglist.top/) is a free local classifieds site for stuff, jobs, housing, services and vehicles. It is built around a simple idea: people meet in person to exchange a physical object, and nobody has to hand over an inbox to do it. Browsing and replying need no account. Each listing gets its own relay address — `reply-osfogyr3xkxw@minglist.top` — so buyers and sellers can write to each other without either side seeing the other's real email. The address stops working when the listing comes down. The site does not handle payments or shipping, and it does not publish ratings; a report freezes a listing's automatic bump instead of putting a public score on it.

The Startup Fame listing is one of the directory badges in the site's footer, alongside Peerlist and Product Hunt. If you want to see the page the verification bot never received, the homepage is [minglist.top](https://minglist.top/).
