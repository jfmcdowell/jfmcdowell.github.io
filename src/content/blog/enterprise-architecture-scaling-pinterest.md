---
title: "Enterprise Architecture in the wild - Scaling Pinterest"
pubDate: 2013-04-19
description: "Lessons from Pinterest's rapid scaling illustrate how designing for humans leads to sound enterprise architecture decisions."
tags: ["architecture", "webdev", "enterprise-design"]
---

It is my belief that we can learn a great deal about Enterprise Architecture in the wild from consumer or social focused startups. In fact I think that they are the perfect example of where enterprise architecture is critical, though it is never called out by name or formally practiced. In a startup, one can literally feel the impact of architecture decisions over a reduced time scale and startups lack the weight of being an *enterprise*. Alignment, or lack thereof, to the business isn't an issue. Startups have two goals, survive and thrive. In this context, Enterprise Architecture is in its purest form.

~~ <!-- more -->

Pinterest is a great example of this. Their growth has been exponential. In the span of two years they've grown from **zero to tens of billions** of page views per month and from 2 founders and one engineer to over 40 engineers. How do you scale for that growth, how does your architecture rapidly evolve, and what lessons can you learn from the experience? All to often this type of scenario isn't  well documented and we miss out on the lessons learned.

Thankfully, [Yashwanth Nelapati] and [Marty Weiner] provide an in-depth and down to earth perspective in their talk, [Scaling Pinterest]. With practical strategies and insights on the decisions that led them down certain paths, this talk is invaluable, particularly from a technical perspective.

However, my biggest take away from the talk was the notion that all technologies fail in their own unique way when pushed to their limit. I'd add that all enterprises (and enterprise architectures) fail in a similar manner, particularly when they are not designed for humans. {" Have you ever heard a customer (doesn't matter where in the value chain) complain that your company is too difficult to do business with? Have you ever tried to unpack that statement? "} While there can be a plethora of reasons, a few common ones are your inconvenient to deal with, your products suck, your delivery times are too long, or Company X showed that they have my best interests at heart. **Ouch!**  All signs point to the fact that something in your organization isn't designed for humans.

Pinterest however, isn't currently suffering from any of those symptoms. From the very beginning they have designed their product and company for humans. In their talk they showcased their agility by iterating over their technical architecture so users would be minimally impacted. They standardized on well-liked technologies and avoided having to hire specialized engineering resources for exotic or bleeding edge technologies. They are at a mature place where they can "throw money" at a problem to make it go away because their architecture is solid. They iterate constantly. While their product is "free", they nullify any barriers to signup with great design, and big bold Twitter and Facebook buttons. You don't even have to enter any personal information or remember a password to sign up unless you want that pain. How convenient. Their growth speaks for itself and their user base is engaged.

The remarkable thing about designing an enterprise for humans is that when you design with humans in mind, (produce a great product, ease any barriers to the acquisition of new customers, honor commitments quickly and with quality, and engage your customer base), you will rarely make mistakes in your enterprise architecture or alignment to the business. Designing with humans in mind forces organizations to naturally do the right thing for your customers. Once that habit is formed the same focus and effort follows internally with your employees. Focusing on delighting humans externally and internally is a recipe for success.

For those seeking a more technical slant, [High Scalability] wrote a great summary of the talk. I recommend you listen to the talk in detail, particularly if you want to learn about the ins and outs of [Cassandra] , [memcache] and [MongoDB] under extreme loads. It's under an hour and worthy of your time.
