export const site = {
  name: "Reclaim & Restore",
  tagline: "Mobile Auto Detailing",
  phoneDisplay: "256-508-5285",
  phoneHref: "tel:+12565085285",
  serviceArea: "We come to you anywhere in the North Alabama area",
};

export const services = [
  {
    id: "steam",
    name: "Steam Cleaning",
    short: "Deep, chemical-light sanitizing",
    description:
      "High-temperature steam lifts baked-in grime, kills bacteria and odors, and refreshes upholstery, vents, and hard surfaces — without soaking your interior.",
  },
  {
    id: "shampoo",
    name: "Shampoo & Extraction",
    short: "Stains pulled out at the root",
    description:
      "Hot-water shampoo and extraction for carpets, mats, and cloth seats. We agitate, lift, and vacuum the dirt back out so stains and spills disappear.",
  },
  {
    id: "interior",
    name: "Full Interior Detail",
    short: "Top-to-bottom interior reset",
    description:
      "A complete interior restoration: vacuum, steam, shampoo, leather & plastic conditioning, glass, and a thorough wipe-down of every surface.",
  },
  {
    id: "exterior",
    name: "Exterior Wash & Wax",
    short: "Showroom shine, protected",
    description:
      "Hand wash, wheel and tire detail, bug and tar removal, and a protective wax that brings back the gloss and shields your paint.",
  },
] as const;

export type ServiceId = (typeof services)[number]["id"];
