---
layout: post
title: An email relay where neither side sees the other's address
date:   2026-11-02 2:00:00
lang: en
description: A classifieds site has to let strangers talk without handing over an inbox. Here is the relay I built on Cloudflare Workers, the forgery hole in the obvious design, and what it still does not protect against.
categories: Engineering
tags: Email Cloudflare Privacy
---

A classifieds ad carries an awkward requirement inside it. A stranger has to be able to reach you — and then, if the thing turns out to be real, keep reaching you. But they must never learn where you actually are.

Most sites solve this by hiding the address behind a contact form. That works until someone wants to reply from their phone at eleven at night, which is when people reply. So the address has to travel by email, and an email address is the one thing you cannot take back once you send it.

[MingList](https://minglist.top) gives every ad a throwaway address instead. Both sides end up writing to it. Neither side ever sees the other's. This is how it works, the hole in the obvious design, and what it still does not protect against.

## What "anonymous" has to mean

There are four requirements here, and it is entirely possible to satisfy three of them and still leak.

1. The buyer must not learn the seller's address.
2. The seller must not learn the buyer's address. The seller is a stranger to the buyer too; sellers get stalked, and "I know where you live because I bought a chair from you" is a real thing.
3. The address must not be guessable. If addresses were sequential, anyone could spray the space and find live conversations to inject mail into.
4. The relay must not become an open relay, or it will be found by spammers within days and used to send mail under my domain.

Requirement 2 is the one that gets skipped. Hiding the seller is the obvious half; hiding the buyer is the half that costs an extra table.

## Two kinds of address

The relay uses two different addresses, and the gap between them is the whole design.

**`reply-<12 chars>@minglist.top`** — scoped to one ad. It is never printed on the ad page. It is the address the server writes *from*, and one a buyer only learns after the seller has already answered them once.

**`reply+<24 chars>@minglist.top`** — scoped to one conversation, and only ever seen by the seller, inside the `Reply-To` of a forwarded message.

The first is per-ad and random: twelve characters from a 36-symbol alphabet, about 62 bits. Nobody can walk the space looking for live ads to mail, and a buyer who has received one address cannot derive the address of the next ad from it.

Worth being exact about the first hop, because it is not email. A buyer who has never written before uses the contact form on the ad page. The server turns that into a message sent from `reply-7fq2m9x1@`, displayed as "Interested buyer", to the seller's real inbox. The buyer's own address is recorded on the thread and never handed to the seller.

The second address exists because of a routing problem. When the seller hits **Reply** in their own mail client, that message has to reach the buyer. But it must not reveal the seller's address, and the seller must not have the buyer's address to put in the `To:` field. So the relay hands the seller a `Reply-To` that identifies *the conversation* rather than the person.

```
buyer (web form)         relay worker             seller's inbox
      |                       |                         |
      |-- POST /contact ----->|                         |
      |                       |-- From: reply-7fq2m9x1@ -->|
      |                       |   ("Interested buyer")
      |                       |   Reply-To: reply+k3n8p2w7@
      |                       |<-- to: reply+k3n8p2w7@ --|
      |<-- From: reply-7fq2m9x1@ (copy of the reply) ----|
```

Every hop rewrites both the envelope sender and the display name. The seller sees "Interested buyer" writing from the ad's address; the buyer sees "Seller" writing from that same address, which is the only address they ever learn. Neither mailbox ever contains the other's real address.

## The hole in the obvious design

The tempting implementation of the second route is: look up the token, find the buyer, deliver. That version is broken.

If `reply+<token>@` means "deliver to the buyer of this thread", then whoever holds the token can send mail to the buyer while claiming to be the seller. Tokens leak constantly — forwarded mail, quoted replies, a shared family inbox, a mail client that syncs to a tablet someone else picks up. A routing token is not an authenticator.

So the route checks who is sending, not just what they know:

```js
// Only the poster themselves (matching their real address) may use this
// path to reply. Otherwise anyone holding the token could impersonate them.
if (from !== (thread.owner_email || '').toLowerCase()) {
  console.log('relay_token_sender_mismatch');
  return;
}
```

The token authenticates the conversation. The sending address authenticates the person. Both are required, and neither is sufficient alone.

That check has a consequence worth spelling out: the reverse direction cannot also point at `reply+<token>@`. When the seller's reply reaches the buyer, the `Reply-To` has to go back to the ad's `reply-<12>@` address, because the token route only accepts mail from the seller. Getting this backwards produces an infinite bounce, or worse, a conversation that silently dies after the seller's first reply.

The last rule is the blunt one: any local part that is neither `reply+` nor `reply-` is dropped and never forwarded. A relay that forwards unknown addresses is an open relay with extra steps.

## Three things that are easy to get wrong

**Local parts must be lowercase.** Mail delivery chains are allowed to normalise the local part, and some do. A token with uppercase letters in it can come back lowercased, fail the lookup, and the conversation dies with no error anyone can see. Everything that appears in an address is generated from the alphabet `a-z0-9` only, and the lookup still does a case-insensitive fallback for old rows.

**MIME boundaries are case-sensitive, and you must not lowercase before reading them.** The natural first line of a parser is to normalise the content type:

```js
const ctype = rawCtype.toLowerCase();
```

That is fine for deciding whether something starts with `multipart/`. It is fatal for extracting the boundary, because `boundary="BB"` and the delimiter `--BB` no longer agree once you have lowercased one and not the other. The boundary has to be pulled from the original header, and everything else can be lowercased afterwards.

**Do not throw out of the email handler.** A thrown error becomes a bounce, a bounce can become an auto-reply, and an auto-reply can become another bounce. The handler catches everything, logs it, and returns quietly.

## Rate limiting the inbound side

The buyer's mail client learns `reply-<12>@` from the `Reply-To` of a forwarded message. It is public, unauthenticated, and every message that arrives at it is written to the database *and* forwarded to a real inbox. Unbounded, that is a way to bomb somebody by knowing one address.

So inbound mail is limited to 30 messages per hour per relay address. Thirty is not a security number, it is a plausibility number: real conversations rarely exceed it, and one angry person can still send eleven messages in a row without being cut off.

## What this does not protect against

This section is the honest one, and it is why I would rather describe the mechanism than advertise "anonymous".

**The relay reads everything.** Message bodies are parsed, truncated at 20,000 characters, and stored — that is the conversation record. There is no end-to-end encryption anywhere in this design. I am the exception to "neither side sees the other"; I am the one who can. Calling it anonymous is a statement about the two parties relative to each other, not about the operator.

**Anything typed into the body is not covered.** Half the people who want to trade locally will eventually write "here is my number" or "email me at". A relay cannot prevent the other party from volunteering. Most privacy failures here will be voluntary.

**Metadata remains.** The server has to know both addresses in order to deliver, and when each message arrived. The delivery log deliberately stores only context, success, and error — no recipient — but the thread table exists precisely because delivery requires knowing who to deliver to.

**Subject lines pass through.** If a buyer types their phone number into the subject, it is forwarded untouched.

**Forwarding and shared accounts defeat it.** If the seller's mail client auto-forwards to a work address, or the account is a family account, the relay did its job and the mailbox gave it away anyway.

## Why not something simpler

A web form only would have been the obvious cheap answer. It breaks the eleven-at-night case and it puts the reply behind a login for the buyer, which is exactly the friction a free local site cannot afford.

A third-party relay service would work, and would move the trust problem from me to a vendor I cannot audit. It also charges per message for something that is, in the end, a database write and one outbound send.

Per-message random addresses — a fresh address for every single reply — would give stronger unlinkability. It is also more state, more failure modes, and the same four guarantees, because the guarantee that matters is who is allowed to write to whom, not how many addresses exist.

## The part I did not expect

There is no cryptography in this design. The interesting problem was never encryption; it was deciding, for each direction, exactly one thing that proves who is writing. The seller is proven by their address. The buyer, deliberately, is proven by nothing at all — a buyer with no account is the product, and their address only becomes semi-trusted after they have already been routed once.

Anonymous, between two people, is a routing problem. Once you write down which party is authenticated on which hop, the rest is bookkeeping.
