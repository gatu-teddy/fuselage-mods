import type { Reel, SortValue } from './types'

/** e.g. "AED 5,260" — single place to change price formatting */
export const formatPrice = (r: Reel) => (r.price == null ? '' : `${r.currency} ${r.price.toLocaleString('en-AE')}`)

export const MOCK_REELS: Reel[] = [
  {
    id: '1',
    title: 'Yoshimura R-77 Full System',
    modification: 'Exhaust Upgrade',
    description:
      'Full titanium Yoshimura R-77 exhaust system. Reduces weight by 4.2 kg over stock. Deep growl at low RPM, aggressive scream at redline. Compliant with most track day regulations.',
    price: 5260,
    currency: 'AED',
    seller: { name: 'Moto Workshop NBI', handle: '@moto_nbi', verified: true },
    category: 'Exhaust',
    tags: ['Exhaust', 'Titanium', 'Yoshimura', 'Track'],
    bgGradient: ['#1a0a00', '#3d1a00'],
    compatibleBikes: ["Suzuki GSX-R1000 (2017–2024)", "Yamaha YZF-R1 (2015–2024)"],
    variations: ["Titanium sleeve", "Carbon sleeve", "Slip-on only (no headers)"],
    // Demo video until R2 uploads exist (MDN's public CC0 sample clip)
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  },
  {
    id: '2',
    title: 'LED Wheel Rings — Dual',
    modification: 'Lighting',
    description:
      'Custom RGB LED rings installed in both wheel rims. 16 zones, app-controlled via Bluetooth. IP67 waterproof. Includes relay harness with auto-cutoff above 120 km/h.',
    price: 1280,
    currency: 'AED',
    seller: { name: 'Circuit Garage KE', handle: '@circuit_ke', verified: false },
    category: 'Lighting',
    tags: ['LED', 'RGB', 'Wheels', 'App-controlled'],
    bgGradient: ['#00001a', '#0a001a'],
    compatibleBikes: ["Universal — 17\" wheels"],
    variations: ["RGB, app-controlled", "Single-colour white", "Front wheel only"],
  },
  {
    id: '3',
    title: 'Brembo M50 Monoblock Calipers',
    modification: 'Brakes',
    description:
      'Brembo M50 4-piston monoblock front calipers. Forged from a single aluminium billet. Radially mounted. Requires 320 mm disc minimum. Major improvement in feel and stopping power.',
    price: 9090,
    currency: 'AED',
    seller: { name: 'Apex Motorsport', handle: '@apex_ke', verified: true },
    category: 'Brakes',
    tags: ['Brembo', 'Caliper', 'Brakes', 'Track'],
    bgGradient: ['#1a0000', '#2d0505'],
    compatibleBikes: ["Ducati Panigale V4", "Aprilia RSV4 (2017+)", "BMW S1000RR (2019+)"],
    variations: ["Black anodised", "Titanium finish"],
  },
  {
    id: '4',
    title: 'Ohlins TTX25 Rear Shock',
    modification: 'Suspension',
    description:
      'Ohlins TTX25 rear shock, fully adjustable compression, rebound and preload. Set up for track and aggressive street use. Drop-in fit for CBR600RR, R6, Ninja 636.',
    price: 7810,
    currency: 'AED',
    seller: { name: 'Moto Workshop NBI', handle: '@moto_nbi', verified: true },
    category: 'Suspension',
    tags: ['Ohlins', 'Suspension', 'Track', 'Adjustable'],
    bgGradient: ['#0a0a00', '#1a1a00'],
    compatibleBikes: ["Yamaha YZF-R6 (2017–2020)", "Kawasaki ZX-6R (2019+)"],
    variations: ["Spring for 65–75 kg rider", "Spring for 75–85 kg rider", "Spring for 85–95 kg rider"],
  },
  {
    id: '5',
    title: 'Carbon Fibre Tank Shrouds',
    modification: 'Bodywork',
    description:
      'Dry carbon fibre tank shrouds, 2×2 twill weave finish. OEM fitment, no cutting required. Weight saving: 600 g per pair vs stock plastic. UV-clear coated for longevity.',
    price: 1650,
    currency: 'AED',
    seller: { name: 'Carbon Works EA', handle: '@carbonworks_ea', verified: false },
    category: 'Fairings',
    tags: ['Carbon', 'Bodywork', 'Lightweight', 'OEM-fit'],
    bgGradient: ['#0a0a0a', '#151515'],
    compatibleBikes: ["Kawasaki ZX-10R (2016–2020)"],
    variations: ["Gloss twill", "Matte twill", "Forged carbon"],
  },
  {
    id: '6',
    title: 'Quick Shifter + Blipper Kit',
    modification: 'Electronics',
    description:
      'Translogic QS+Blipper. Auto-blipper for downshifts, two-way for upshifts. Works under full throttle. Universal fit with included strain gauge sensor. ECU flash required.',
    price: 2730,
    currency: 'AED',
    seller: { name: 'Circuit Garage KE', handle: '@circuit_ke', verified: false },
    category: 'Electronics',
    tags: ['Quickshifter', 'Electronics', 'Performance'],
    bgGradient: ['#001a0a', '#002a10'],
    compatibleBikes: ["Honda CBR600RR (2013+)", "Yamaha MT-09 (2021+)"],
    variations: ["Up-shift only", "Up + down (blipper)"],
  },
  {
    id: '7',
    title: 'Rizoma Bar-End Mirrors',
    modification: 'Ergonomics',
    description:
      'Rizoma stainless steel bar-end mirrors, CNC-machined aluminium arms. Significantly less drag than stock mirrors. Wide convex view. Compatible with 18–22 mm bar ends.',
    price: 910,
    currency: 'AED',
    seller: { name: 'Apex Motorsport', handle: '@apex_ke', verified: true },
    category: 'Ergonomics',
    tags: ['Rizoma', 'Mirrors', 'Bar-end', 'Aero'],
    bgGradient: ['#0f0a00', '#1a1200'],
    compatibleBikes: ["Universal — 18–22 mm bar ends"],
    variations: ["Black", "Silver", "Red accent ring"],
  },
  {
    id: '8',
    title: 'Akrapovič Slip-On Carbon',
    modification: 'Exhaust Upgrade',
    description:
      'Akrapovič carbon slip-on with titanium link pipe. Bolt-on fit, no remap needed. Removable dB killer for road use.',
    price: 4030,
    currency: 'AED',
    seller: { name: 'Moto Workshop NBI', handle: '@moto_nbi', verified: true },
    category: 'Exhaust',
    tags: ['Exhaust', 'Carbon', 'Akrapovic', 'Slip-on'],
    bgGradient: ['#1a0500', '#2e1200'],
    compatibleBikes: ["BMW S1000RR (2019+)"],
    variations: ["Carbon end cap", "Titanium end cap"],
  },
  {
    id: '9',
    title: 'SC-Project CR-T Titanium',
    modification: 'Exhaust Upgrade',
    description:
      'SC-Project CR-T titanium silencer with carbon end cap. MotoGP-derived shape, sharp race note. Includes mid-pipe.',
    price: 4770,
    currency: 'AED',
    seller: { name: 'Apex Motorsport', handle: '@apex_ke', verified: true },
    category: 'Exhaust',
    tags: ['Exhaust', 'Titanium', 'SC-Project', 'Track'],
    bgGradient: ['#140800', '#301800'],
    compatibleBikes: ["Kawasaki ZX-10R (2021+)", "Honda CBR1000RR-R (2020+)"],
    variations: ["Titanium", "Carbon", "With dB killer"],
  },
  {
    id: '10',
    title: 'Projector Headlight Retrofit',
    modification: 'Lighting',
    description:
      'Bi-LED projector retrofit in stock housing. Sharp cut-off, twice the throw of halogen. Plug-and-play harness.',
    price: 1080,
    currency: 'AED',
    seller: { name: 'Circuit Garage KE', handle: '@circuit_ke', verified: false },
    category: 'Lighting',
    tags: ['LED', 'Headlight', 'Projector'],
    bgGradient: ['#00031a', '#000a2a'],
    compatibleBikes: ["Suzuki GSX-R750 (2011–2017)", "Suzuki GSX-R600 (2011–2017)"],
    variations: ["6000K white", "Yellow lens"],
  },
  {
    id: '11',
    title: 'Öhlins NIX30 Fork Cartridges',
    modification: 'Suspension',
    description:
      'Öhlins NIX30 cartridge kit for stock forks. Separate compression and rebound per leg. Set up for 75–85 kg rider.',
    price: 5970,
    currency: 'AED',
    seller: { name: 'Apex Motorsport', handle: '@apex_ke', verified: true },
    category: 'Suspension',
    tags: ['Ohlins', 'Forks', 'Track'],
    bgGradient: ['#1a1000', '#2a1a00'],
    compatibleBikes: ["Yamaha YZF-R1 (2015+)"],
    variations: ["Road setup", "Track setup"],
  },
  {
    id: '12',
    title: 'Forged Marchesini Wheels',
    modification: 'Wheels',
    description:
      'Marchesini forged aluminium wheel set, M7R Genesi pattern. Saves 2.1 kg of unsprung weight. Includes bearings and spacers.',
    price: 11220,
    currency: 'AED',
    seller: { name: 'Moto Workshop NBI', handle: '@moto_nbi', verified: true },
    category: 'Wheels',
    tags: ['Wheels', 'Forged', 'Marchesini', 'Track'],
    bgGradient: ['#0a0a0a', '#1f1f1f'],
    compatibleBikes: ["Ducati Panigale V2", "Ducati Streetfighter V2"],
    variations: ["Black", "Gold", "Titanium grey"],
  },
  {
    id: '13',
    title: 'Pirelli Supercorsa SP Set',
    modification: 'Tyres',
    description:
      'Pirelli Diablo Supercorsa SP V4 front and rear, 120/70 + 190/55. Fitted and balanced. Road-legal track compound.',
    price: 1760,
    currency: 'AED',
    seller: { name: 'Rift Valley Moto', handle: '@riftmoto', verified: false },
    category: 'Tyres',
    tags: ['Tyres', 'Pirelli', 'Track'],
    bgGradient: ['#0d0d0d', '#1a1a1a'],
    compatibleBikes: ["Any bike on 120/70 + 190/55 ZR17"],
    variations: ["SP V4 (road-legal)", "SC2 (track)"],
  },
  {
    id: '14',
    title: 'Custom Alcantara Solo Seat',
    modification: 'Seats',
    description:
      'Hand-stitched Alcantara solo seat with grip pattern. Firmer foam for track days. Includes rear seat cowl.',
    price: 770,
    currency: 'AED',
    seller: { name: 'Stitch & Throttle', handle: '@stitchthrottle', verified: true },
    category: 'Seats',
    tags: ['Seat', 'Alcantara', 'Custom'],
    bgGradient: ['#1a000a', '#2a0012'],
    compatibleBikes: ["Yamaha YZF-R6 (2017+)"],
    variations: ["Black stitching", "Red stitching", "Gel insert"],
  },
  {
    id: '15',
    title: 'R&G Crash Protection Kit',
    modification: 'Protection',
    description:
      'R&G aero frame sliders, engine case covers and fork protectors. Model-specific brackets, no cutting.',
    price: 680,
    currency: 'AED',
    seller: { name: 'Rift Valley Moto', handle: '@riftmoto', verified: false },
    category: 'Protection',
    tags: ['Sliders', 'R&G', 'Crash'],
    bgGradient: ['#001010', '#002020'],
    compatibleBikes: ["Kawasaki Z900 (2020+)", "Kawasaki ZX-6R (2019+)"],
    variations: ["Frame sliders only", "Full kit"],
  },
  {
    id: '16',
    title: 'Rearsets + Folding Levers',
    modification: 'Controls',
    description:
      'Gilles rearsets with reversible shift pattern and CNC folding brake and clutch levers. Six position adjustment.',
    price: 2020,
    currency: 'AED',
    seller: { name: 'Apex Motorsport', handle: '@apex_ke', verified: true },
    category: 'Controls',
    tags: ['Rearsets', 'Levers', 'Gilles', 'Track'],
    bgGradient: ['#100018', '#1c0028'],
    compatibleBikes: ["Yamaha YZF-R1 (2015+)"],
    variations: ["Standard shift", "GP (reverse) shift"],
  },
  {
    id: '17',
    title: 'Full Livery Wrap',
    modification: 'Graphics',
    description:
      'Full-body vinyl livery wrap, custom design. Gloss or matte laminate, cut to your fairings. Design proof included.',
    price: 1560,
    currency: 'AED',
    seller: { name: 'Stitch & Throttle', handle: '@stitchthrottle', verified: true },
    category: 'Graphics',
    tags: ['Wrap', 'Livery', 'Fairings'],
    bgGradient: ['#1a001a', '#100010'],
    compatibleBikes: ["Any fully faired sportbike"],
    variations: ["Gloss laminate", "Matte laminate", "Custom design"],
  },
  // ── Customer posts: buyers showing off a mod, tagging the seller who fitted it ──
  {
    id: '18',
    title: 'My GSX-R1000 with the R-77',
    modification: 'Exhaust Upgrade',
    description: 'Fitted by Moto Workshop NBI last month. Sounds unreal on the highway and the bike feels noticeably lighter.',
    currency: 'AED',
    author: { name: 'Kamau Mwangi', handle: '@kamau_rides' },
    seller: { name: 'Moto Workshop NBI', handle: '@moto_nbi', verified: true },
    listingId: '1',
    category: 'Exhaust',
    tags: ['Exhaust', 'Yoshimura', 'GSX-R1000'],
    bgGradient: ['#140a00', '#2a1400'],
  },
  {
    id: '19',
    title: 'ZX-10R + SC-Project CR-T',
    modification: 'Exhaust Upgrade',
    description: 'Apex sorted the CR-T for my ZX-10R before a Yas Marina track day. Zero fuss, great advice on the dB killer.',
    currency: 'AED',
    author: { name: 'Aisha Al Mansoori', handle: '@aisha.moto' },
    seller: { name: 'Apex Motorsport', handle: '@apex_ke', verified: true },
    listingId: '9',
    category: 'Exhaust',
    tags: ['Exhaust', 'SC-Project', 'ZX-10R', 'Track'],
    bgGradient: ['#0f0a14', '#1e1228'],
  },
  {
    id: '20',
    title: 'Night ride with the LED rings',
    modification: 'Lighting',
    description: 'Circuit Garage installed the dual LED rings. Set to white for the city, RGB for meets.',
    currency: 'AED',
    author: { name: 'Kamau Mwangi', handle: '@kamau_rides' },
    seller: { name: 'Circuit Garage KE', handle: '@circuit_ke', verified: false },
    listingId: '2',
    category: 'Lighting',
    tags: ['LED', 'Lighting', 'Night ride'],
    bgGradient: ['#00041a', '#06002a'],
  },
]

// Derived from posts so every category has at least one reel; seller-created
// categories will show up here automatically once listings come from the backend
export const CATEGORIES = ['All', ...new Set(MOCK_REELS.map(r => r.category))]

// TODO: 'newest' and 'popular' keep data order until reels carry createdAt / view counts
/** `categories`: selected categories; empty = all */
export function applySortFilter(sort: SortValue, categories: string[], source: Reel[] = MOCK_REELS) {
  const list = source.filter(r => !categories.length || categories.includes(r.category))
  if (sort === 'price_asc') list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
  if (sort === 'price_desc') list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity))
  return list
}

/** Search match on title, mod, category, seller/poster names + handles, tags */
export const matchesQuery = (reel: Reel, q: string) =>
  [reel.title, reel.modification, reel.category, reel.seller.name, reel.seller.handle,
    reel.author?.name ?? '', reel.author?.handle ?? '', ...reel.tags]
    .some(field => field.toLowerCase().includes(q))

/**
 * "View listing" URL. Listings live on the fitting seller's profile; a customer post
 * opens its seller's listing with the buyer's reel as the background.
 */
export const listingHref = (reel: Reel) =>
  `/sellers/${reel.seller.handle.replace('@', '')}/listing/${encodeURIComponent(reel.id)}`

/** For a listing page: the reel that was opened, and the seller listing behind it */
export function resolveListing(id: string) {
  const shown = MOCK_REELS.find(r => r.id === id)
  if (!shown) return undefined
  const listing = shown.author ? MOCK_REELS.find(r => r.id === shown.listingId) : shown
  return { shown, listing }
}

/** Reels for the given ids, in that order (unknown ids skipped) */
export const reelsByIds = (ids: string[]) => ids.flatMap(id => MOCK_REELS.find(r => r.id === id) ?? [])

/**
 * The reel followed by every other reel, most similar first: same category ranks
 * highest, then shared tags, then same seller. Used when opening explore from browse.
 */
export function similarReels(id: string): Reel[] {
  const seed = MOCK_REELS.find(r => r.id === id)
  if (!seed) return MOCK_REELS
  const score = (r: Reel) =>
    (r.category === seed.category ? 10 : 0) +
    r.tags.filter(t => seed.tags.includes(t)).length * 2 +
    (r.seller.handle === seed.seller.handle ? 1 : 0)
  const rest = MOCK_REELS.filter(r => r.id !== id)
  return [seed, ...rest.sort((a, b) => score(b) - score(a))]
}
