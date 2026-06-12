import { cache } from "react";
import { serverClient } from "./supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Service = {
  id: string;
  name: string;
  short: string;
  description: string;
  sort_order: number;
};

export type ProcessStep = {
  id: string;
  n: string;
  title: string;
  body: string;
  sort_order: number;
};

export type SiteContent = {
  businessName: string;
  tagline: string;
  phoneDisplay: string;
  phoneHref: string;
  serviceArea: string;
  heroHeadline: string;
  heroDescription: string;
  heroBullets: string[];
  services: Service[];
  processSteps: ProcessStep[];
  serviceTowns: string[];
  logoUrl: string;
  shieldUrl: string;
};

// ---------------------------------------------------------------------------
// Hardcoded defaults — site works fine if Supabase isn't configured
// ---------------------------------------------------------------------------

export const DEFAULTS: SiteContent = {
  businessName: "Reclaim & Restore",
  tagline: "Mobile Auto Detailing",
  phoneDisplay: "256-508-5285",
  phoneHref: "tel:+12565085285",
  serviceArea: "We come to you anywhere in the North Alabama area",
  heroHeadline: "Professional detailing, done right in your driveway.",
  heroDescription:
    "Reclaim & Restore brings full-service interior and exterior detailing to your home or workplace. Steam cleaning, shampoo and extraction, and a finish that looks and feels brand new.",
  heroBullets: [
    "Steam & shampoo deep cleaning",
    "Interior & exterior detailing",
    "Fully mobile — we come to you",
  ],
  services: [
    {
      id: "steam",
      name: "Steam Cleaning",
      short: "Deep, chemical-light sanitizing",
      description:
        "High-temperature steam lifts baked-in grime, kills bacteria and odors, and refreshes upholstery, vents, and hard surfaces — without soaking your interior.",
      sort_order: 1,
    },
    {
      id: "shampoo",
      name: "Shampoo & Extraction",
      short: "Stains pulled out at the root",
      description:
        "Hot-water shampoo and extraction for carpets, mats, and cloth seats. We agitate, lift, and vacuum the dirt back out so stains and spills disappear.",
      sort_order: 2,
    },
    {
      id: "interior",
      name: "Full Interior Detail",
      short: "Top-to-bottom interior reset",
      description:
        "A complete interior restoration: vacuum, steam, shampoo, leather & plastic conditioning, glass, and a thorough wipe-down of every surface.",
      sort_order: 3,
    },
    {
      id: "exterior",
      name: "Exterior Wash & Wax",
      short: "Showroom shine, protected",
      description:
        "Hand wash, wheel and tire detail, bug and tar removal, and a protective wax that brings back the gloss and shields your paint.",
      sort_order: 4,
    },
  ],
  processSteps: [
    {
      id: "1",
      n: "01",
      title: "Request a date",
      body: "Tell us about your vehicle, the services you want, and a day that works for you.",
      sort_order: 1,
    },
    {
      id: "2",
      n: "02",
      title: "We confirm by phone",
      body: "We call to lock in your time and answer any questions about the job.",
      sort_order: 2,
    },
    {
      id: "3",
      n: "03",
      title: "We come to you",
      body: "Our mobile setup arrives at your home or workplace — anywhere in North Alabama.",
      sort_order: 3,
    },
    {
      id: "4",
      n: "04",
      title: "Reclaim & restore",
      body: "We steam, shampoo, and detail until your vehicle looks and feels new again.",
      sort_order: 4,
    },
  ],
  serviceTowns: [
    "Huntsville",
    "Madison",
    "Decatur",
    "Athens",
    "Cullman",
    "Scottsboro",
    "Guntersville",
    "Florence",
  ],
  logoUrl: "/brand/logo-monogram.png",
  shieldUrl: "/brand/logo-shield.png",
};

// ---------------------------------------------------------------------------
// Fetch — React cache deduplicates calls within the same request
// ---------------------------------------------------------------------------

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return DEFAULTS;
  }

  try {
    const supabase = serverClient();

    const [settingsRes, servicesRes, stepsRes, townsRes, bulletsRes] =
      await Promise.all([
        supabase.from("site_settings").select("key, value"),
        supabase.from("services").select("*").order("sort_order"),
        supabase.from("process_steps").select("*").order("sort_order"),
        supabase.from("service_towns").select("name").order("sort_order"),
        supabase.from("hero_bullets").select("text").order("sort_order"),
      ]);

    const settings: Record<string, string> = {};
    for (const row of settingsRes.data ?? []) {
      settings[row.key] = row.value;
    }

    return {
      businessName: settings.business_name ?? DEFAULTS.businessName,
      tagline: settings.tagline ?? DEFAULTS.tagline,
      phoneDisplay: settings.phone_display ?? DEFAULTS.phoneDisplay,
      phoneHref: settings.phone_href ?? DEFAULTS.phoneHref,
      serviceArea: settings.service_area ?? DEFAULTS.serviceArea,
      heroHeadline: settings.hero_headline ?? DEFAULTS.heroHeadline,
      heroDescription: settings.hero_description ?? DEFAULTS.heroDescription,
      heroBullets: bulletsRes.data?.length
        ? bulletsRes.data.map((b: { text: string }) => b.text)
        : DEFAULTS.heroBullets,
      services: (servicesRes.data as Service[] | null)?.length
        ? (servicesRes.data as Service[])
        : DEFAULTS.services,
      processSteps: (stepsRes.data as ProcessStep[] | null)?.length
        ? (stepsRes.data as ProcessStep[])
        : DEFAULTS.processSteps,
      serviceTowns: townsRes.data?.length
        ? townsRes.data.map((t: { name: string }) => t.name)
        : DEFAULTS.serviceTowns,
      logoUrl: settings.logo_url ?? DEFAULTS.logoUrl,
      shieldUrl: settings.shield_url ?? DEFAULTS.shieldUrl,
    };
  } catch {
    return DEFAULTS;
  }
});
