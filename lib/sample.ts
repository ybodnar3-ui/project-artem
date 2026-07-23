/**
 * Sample generation used for the /p/demo preview (and reused as the homepage
 * seed example in Phase 6). Lets us build and view the template with no DB or
 * API key.
 */
import type { GenerationRow } from "./db";

export const DEMO_SLUG = "demo";

export const SAMPLE_GENERATION: GenerationRow = {
  slug: DEMO_SLUG,
  restyled: false,
  created_at: new Date(0).toISOString(),
  answers: {
    qa: [
      {
        question: "What do you sell?",
        answer: "Done-for-you premium landing pages for coaches and agencies.",
      },
      {
        question: "Who is it for?",
        answer: "Established coaches doing $10k+/mo who look amateur online.",
      },
      {
        question: "What result do they get?",
        answer: "A conversion-grade site that matches their real authority.",
      },
      { question: "Your price?", answer: "$3,000 per site." },
      {
        question: "What makes you different?",
        answer: "Editorial design + copy done in 5 days, not 5 weeks.",
      },
    ],
    contactLink: "https://cal.com/example/intro",
  },
  offer: {
    offer_name: "The 5-Day Authority Site",
    dream_outcome:
      "A landing page that makes premium clients say 'these people are the real deal' before you ever get on a call.",
    value_stack: [
      {
        problem: "Your current site undersells you.",
        solution: "Editorial redesign engineered around one clear offer.",
        value_label: "$3,000 value",
      },
      {
        problem: "You don't have the words.",
        solution: "Conversion copy written from your wins and voice.",
        value_label: "$1,500 value",
      },
      {
        problem: "Launches drag for weeks.",
        solution: "Fixed 5-day build sprint with daily previews.",
        value_label: "$1,200 value",
      },
    ],
    bonuses: [
      {
        name: "Offer Teardown Call",
        description: "A 60-min session sharpening your core offer before design.",
        value_label: "$500 value",
      },
      {
        name: "90-Day Tune-Up",
        description: "One free revision round after you see real traffic.",
        value_label: "$800 value",
      },
    ],
    guarantee: {
      name: "Love-the-Draft Guarantee",
      statement:
        "If the first design direction doesn't feel like you, we rebuild it free — or you don't pay.",
    },
    pricing: {
      anchor: "$7,000 in total value",
      price: "$3,000",
      framing:
        "One new client usually covers it many times over — this pays for itself on the first booking.",
    },
    scarcity: "We take only 4 build slots per month to protect quality.",
    urgency: "This month's cohort starts Monday; the next opens in 3 weeks.",
    language: "en",
  },
  page_config: {
    template: "editorial",
    palette_id: "ed-cream-terracotta",
    font_pair_id: "ed-fraunces-newsreader",
    sections: {
      hero: {
        headline: "Your site should look as good as you actually are.",
        subheadline:
          "Editorial landing pages for coaches and agencies — built and written in 5 days.",
        cta: "Book an intro call",
      },
      problem: {
        heading: "The gap that's costing you clients",
        body: "You've earned real authority. But a template-looking site quietly tells premium buyers otherwise — and they decide before they ever reach your calendar.",
      },
      value_stack: [
        {
          title: "An editorial redesign around one offer",
          description:
            "No busy homepage. One clear promise, engineered to convert.",
        },
        {
          title: "Copy in your voice",
          description:
            "Words pulled from your real wins — not generic agency filler.",
        },
        {
          title: "A fixed 5-day sprint",
          description: "Daily previews, no month-long limbo, launch on schedule.",
        },
      ],
      how_it_works: [
        {
          step: "01",
          title: "Offer teardown",
          description: "We sharpen your core offer on a 60-minute call.",
        },
        {
          step: "02",
          title: "Design + copy sprint",
          description: "Five days, daily previews, you steer as we build.",
        },
        {
          step: "03",
          title: "Launch",
          description: "You go live with a site that matches your authority.",
        },
      ],
      guarantee: {
        heading: "Love the draft, or don't pay",
        body: "If the first design direction doesn't feel like you, we rebuild it free — or you walk away owing nothing.",
      },
      pricing: {
        heading: "One flat price",
        price: "$3,000",
        note: "$7,000 in total value. One new client usually covers it many times over.",
        cta: "Claim a build slot",
      },
      faq: [
        {
          q: "How is this only 5 days?",
          a: "A fixed scope and a proven process. We design around one offer instead of endlessly revising a sprawling site.",
        },
        {
          q: "What if I don't have copy?",
          a: "We write it. You bring your wins and your voice; we turn them into words that convert.",
        },
        {
          q: "Do you offer revisions?",
          a: "Yes — one free tune-up round in your first 90 days once you've seen real traffic.",
        },
      ],
      final_cta: {
        heading: "Ready to look like the real deal?",
        subheading: "Only 4 slots a month. This cohort starts Monday.",
        cta: "Book an intro call",
      },
    },
  },
};
