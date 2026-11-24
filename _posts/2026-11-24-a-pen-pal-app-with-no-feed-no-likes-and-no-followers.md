---
layout: post
title: "A Pen Pal App with No Feed, No Likes, and No Followers"
date: 2026-11-24 18:00:00 +0800
lang: en
description: "Echo Connect is a small international pen-pal app: sign in with Google, write three lines about yourself, and exchange Gmail addresses only when the interest is mutual — no feed, no likes, no follower counts."
categories: Projects
tags: Echo Connect PenPals Privacy ProductHunt Cloudflare
---

Most social products ask the same question: how do we keep you here longer? [Echo Connect](https://echo.minglist.top/) starts from the opposite assumption — that the good part of meeting someone in another country is the letter you write afterward, not the time you spend on a screen.

Echo Connect is a free pen-pal app. You sign in with Google, write three lines about yourself — your country, what you read, what you are curious about — and say hello to someone. If the interest is mutual, both of you see each other's Gmail address, and the conversation moves to your own inbox.

## What we left out

The design is mostly a list of things that are not there:

**No feed.** There is nothing to scroll. You come in, decide who you'd like to write to, and leave.

**No likes and no follower counts.** Nobody is ranking anybody. A hello is a hello, not a number that goes up.

**No chat inside the app.** We don't host message threads. Once two people match, the letters happen in Gmail, in an inbox they already own. That choice keeps the app small and keeps the conversation where the user actually reads mail.

**Interest stays private until it is returned.** If you say hello to someone and they don't say hello back, nobody is told. There is no "someone viewed your profile," no hint of who passed on whom.

**Small on purpose.** You will find a few people here, not thousands, and every reply is a real one.

## How it works

1. **Sign in with Google.** One click. There is no password to create, remember, or lose.
2. **Write three lines about yourself.** Country, what you read, what you are curious about.
3. **Say hello to someone.** When the interest is mutual, both of you see each other's Gmail address, and the letters begin.

Email addresses are never shown in Discover. They appear only between two people who have both said yes.

## The stack

It is a deliberately boring stack: Cloudflare Workers with Hono, D1 (SQLite), Workers Assets for the static frontend, and vanilla HTML, CSS, and JavaScript. There is no frontend build step. OAuth, sessions, and the match logic live in the Worker; the public pages are server-rendered so search engines can read them. Security headers and basic rate limiting are in place, and the site ships `robots.txt`, `sitemap.xml`, and OG/Twitter cards.

Boring technology is a feature here. The product is about writing letters, not about the framework.

## Where it stands

This is an experiment, and it is early. There are not many people on Echo Connect yet, and I'm not going to claim the numbers are impressive. The interesting question isn't how big it gets — it's whether two strangers who would never have met can end up with a correspondence worth keeping.

I built [MingList](https://minglist.top/) around a similar idea: remove the part that makes people uncomfortable, and let the useful part happen. On MingList that means local, in-person exchanges with an anonymous relay address instead of a real email. On Echo Connect it means no feed, no scores, and no messages stored on our side. Different products, same bet — that people will show up when you stop asking them to perform.

## Product Hunt

Echo Connect has a page on Product Hunt. If you'd like to see the launch page or leave feedback, the card below will take you there:

<div style="font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, sans-serif; border: 1px solid rgb(224, 224, 224); border-radius: 12px; padding: 20px; max-width: 500px; background: rgb(255, 255, 255); box-shadow: rgba(0, 0, 0, 0.05) 0px 2px 8px;"><div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;"><img alt="Echo Connect" src="https://ph-files.imgix.net/1839ef87-2a6c-4ea0-b2e8-3e1b3d1d32fb.png?auto=compress,format&amp;codec=mozjpeg&amp;cs=strip&amp;fit=crop&amp;h=80&amp;w=80" style="width: 64px; height: 64px; border-radius: 8px; object-fit: cover; flex-shrink: 0;"><div style="flex: 1 1 0%; min-width: 0px;"><h3 style="margin: 0px; font-size: 18px; font-weight: 600; color: rgb(26, 26, 26); line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Echo Connect</h3><p style="margin: 4px 0px 0px; font-size: 14px; color: rgb(102, 102, 102); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">Meet pen pals worldwide, one letter at a time</p></div></div><a href="https://www.producthunt.com/products/echo-connect?embed=true&amp;utm_source=embed&amp;utm_medium=post_embed" target="_blank" rel="noopener" style="display: inline-flex; align-items: center; gap: 4px; margin-top: 12px; padding: 8px 16px; background: rgb(255, 97, 84); color: rgb(255, 255, 255); text-decoration: none; border-radius: 9999px; font-size: 16px; font-weight: 600; line-height: 1.5;">Check it out on Product Hunt →</a></div>

That's the whole idea: a quiet place to write, and a real mailbox at the end of it.
