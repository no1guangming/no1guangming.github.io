---
layout: post
title: "The Hard Part Wasn't Building the Website"
date: 2026-11-18 16:00:00 +0800
description: A tweet from Craig Newmark, an answer nobody wanted to give, eleven users, and why trust — not code — is the hard part of a classifieds site.
tags: Craigslist MingList Trust Privacy Classifieds
---

In September 2023, Rohit Krishnan asked a software engineer what it would cost to build Craigslist today. Three years later he was still quoting the answer:

> "We can't, we don't know how to do it."

In October 2026, Craig Newmark — the founder of Craigslist — [reposted that tweet](https://x.com/craignewmark/status/2107052870163952117) with four words of his own: *"I forgot all about this."*

I read that and couldn't put it down. Here was the founder of the most successful classifieds site on earth, admitting he'd forgotten how hard it had been. Meanwhile the engineer's answer was still sitting there, untouched: we don't know how to do it.

That exchange is part of why I built [minglist.top](https://minglist.top/).

## The numbers, without makeup

Today the admin dashboard shows: **11 registered users. 37 listings. 0 reports. 37 anonymous relay addresses. 351 page views.**

Those are small numbers. I'm not going to dress them up. Eleven people is not a growth story, and zero reports on eleven users proves nothing. If you came here expecting a launch post, this is the part where you should be skeptical.

But here's the thing about those eleven people: every one of them decided to try a site they'd never heard of, run by someone they'd never met, in order to meet a stranger and hand over a physical object. That decision is not small. It's the entire business.

## Building it was the easy part

I mean that literally. In 2026, putting up a classifieds board is a solved problem — pick a stack, wire up a database, add a search box, deploy. Things broke, I fixed them. Search engines ignored parts of it, and I spent a day learning why. That was annoying, but ordinary. Engineers know how to do that part.

The hard part starts the first time you ask someone to trust it.

Trust here isn't a feeling. It's a stack of specific decisions, most of them about things I chose **not** to build:

**Your email is nobody's business.** Every listing gets its own relay address — `reply-osfogyr3xkxw@minglist.top`. Replies go through it, and they stop the moment the listing comes down. Your real email, your Google ID and your avatar never appear in any public response. Browsing and replying need no account at all.

**No ratings.** I considered it and said no. On a site with eleven users, every score would be either 0 or 5, and a 0 reads as "scam" to a stranger. Instead, a report does one thing: it freezes the listing's automatic bump. No public score, no pile-on.

**A takedown needs a rule, not a mood.** Early on I removed a listing I shouldn't have. Since then, nothing comes down unless I can point to a rule written on the site itself. If I can't, I ask first. That single constraint has changed more about how I work than any feature I've shipped.

**We don't touch money.** Local pickup only, no payments, no escrow. Less convenience, less liability, and one less thing you have to trust me with.

## The strongest objection

The obvious rebuttal is sitting right there in the dashboard: zero reports and eleven users is not evidence of anything except a small sample. Maybe people simply haven't been around long enough to be annoyed.

Fair. I'm not holding up that zero as proof that I got it right. I'll make mistakes — I already made one. The point isn't that I've earned trust. It's that I've started treating every small decision as a trust decision, because on a classifieds site that's what the product actually is. Not the listings. Not the search box. The judgment calls you make when nobody is watching.

Craig Newmark forgot about that conversation with the engineer. I didn't. Maybe the engineer was right about rebuilding Craigslist at Craigslist's scale. But at our scale — eleven people, thirty-seven listings — the question was never whether we could build the thing. We did.

The question is whether eleven more people will trust us enough to try it.

That's the part I'm still working on.
