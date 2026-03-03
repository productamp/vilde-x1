# Open-Source Business Website Templates

## Template library v1 (final 4)

| Template | Best for | Core pages | Core sections | Best source templates from research | Why these fit |
|---|---|---|---|---|---|
| Generic Business | SMBs: accounting, legal, clinic, logistics, local brands | Home, About, Services, Pricing, Contact | Hero, value props, service packages, testimonials, FAQ, CTA | AstroWind (`onwidget/astrowind`), Tailwind Astro Starter (`themesberg/tailwind-astro-starter`), Tailark blocks | Clean business structure, reusable marketing sections, easy section-level conversion. |
| SaaS / Product Marketing | Software products and apps | Home, Features, Pricing, Integrations, Contact | Product hero, feature grid, social proof, pricing, FAQ | Astroplate (`zeon-studio/astroplate`), shadcn-landing-page (`leoMirandaa/shadcn-landing-page`), saas-landing-template (`gonzalochale/saas-landing-template`) | Strong SaaS section patterns and pricing flows; close to advanced stack. |
| Personal Portfolio | Creators, freelancers, independent professionals | Home, Work, About, Testimonials, Contact | Intro hero, project gallery, services, client quotes, CTA | Odyssey Theme (`treefarmstudio/odyssey-theme`), Astro Theme Stone (`MIM0SA/astro-theme-stone`), Framer portfolio templates (reference) | Portfolio/storytelling layout quality with case-study friendly structures. |
| Restaurant / Cafe | Restaurants, cafes, bakeries, small food brands | Home, Menu, About, Contact | Hero, menu highlights, gallery, hours/location, reservation CTA | Chef's Kitchen (`GetNextjsTemplates/chef-kitchen-nextjs-landing-page-template`), Webflow restaurant templates (reference), Framer restaurant templates (reference) | Food-business specific sections (menu/gallery/hours) plus strong visual inspiration sources. |

Research date: 2026-03-02  
Target ProductVibe stacks:
- Default: `HTML + Tailwind + DaisyUI`
- Advanced: `Vite + React + Tailwind + shadcn`

## Template providers to clone from (top priority)

| Provider | Template source | Why it matters for design quality | Clone/import path into ProductVibe | License / usage notes |
|---|---|---|---|---|
| Tailark | https://tailark.com and https://pro.tailark.com | High-quality shadcn marketing blocks/pages with strong business aesthetics. | Prefer direct block/page reuse when license allows. For faster conversion: map sections into React + Tailwind + shadcn components. | Tailark open `blocks` repo is MIT; Tailark Pro is paid access and should be used under purchased terms. |
| Framer Marketplace | https://www.framer.com/marketplace/templates/ | Very large business template catalog (free + paid), usually polished motion and visual system quality. | Use template as visual/source reference, then convert sections/components to your stack. For free templates, Framer supports copy/remix flow. | Follow each creator/template license and Framer marketplace terms before cloning/reuse. |
| Webflow Templates + Made in Webflow (cloneables) | https://webflow.com/templates and https://webflow.com/made-in-webflow | Massive volume of business templates and cloneables; broad category coverage for agencies/local businesses/SaaS. | Use cloneable/template as structural and visual source, then migrate page sections into ProductVibe stack. | Respect template-specific rights and creator restrictions; cloneable does not imply unrestricted resale/redistribution rights. |

| Template | Business fit | Source stack | License | Best target in ProductVibe | Conversion effort | Repo |
|---|---|---|---|---|---|---|
| Tailwind Toolbox - Landing Page | Generic local business, consultants, service pages | HTML + Tailwind (CDN) | MIT | Default | Low | https://github.com/tailwindtoolbox/Landing-Page |
| Themesberg Landwind | SaaS/product marketing sites | HTML + Tailwind + Flowbite | MIT | Default | Low-Medium | https://github.com/themesberg/landwind |
| HooBank Business Website Template | Fintech, startup, service business landing pages | React + Tailwind + Vite | MIT | Advanced | Low | https://github.com/itsDaiton/business-website-template |
| Nextly | Startup and indie business marketing pages | Next.js + Tailwind | MIT | Advanced | Medium | https://github.com/web3templates/nextly-template |
| Next JS Landing Page Starter Template | Startup/SaaS launch pages | Next.js + Tailwind + TypeScript | MIT | Advanced | Medium | https://github.com/ixartz/Next-JS-Landing-Page-Starter-Template |
| Abdullah Agency (chrhi/studio) | Agency/studio multi-page websites | Next.js + Tailwind + Framer Motion | MIT | Advanced | Medium | https://github.com/chrhi/studio |
| shadcn-landing-page | SaaS and business landing pages | React + TypeScript + Tailwind + shadcn | MIT | Advanced | Very Low | https://github.com/leoMirandaa/shadcn-landing-page |
| nextjs-shadcn-landing | SaaS/product business landing pages | Next.js + Tailwind + shadcn | MIT | Advanced | Low-Medium | https://github.com/anibalalpizar/nextjs-shadcn-landing |
| saas-landing-template | SaaS business landing pages | Next.js 15 + Tailwind 4 + shadcn | MIT | Advanced | Low-Medium | https://github.com/gonzalochale/saas-landing-template |
| shadcn-dashboard-landing-template | SaaS with both marketing site and dashboard | Vite + React + Tailwind + shadcn (also Next.js variant) | MIT | Advanced | Very Low (use Vite variant) | https://github.com/shadcnstore/shadcn-dashboard-landing-template |
| Chef's Kitchen | Restaurant, cafe, food businesses | Next.js + React + Tailwind | MIT | Advanced | Medium | https://github.com/GetNextjsTemplates/chef-kitchen-nextjs-landing-page-template |
| Saas UI Next.js Landing Page | SaaS marketing pages | Next.js + Chakra UI + TypeScript | MIT | Advanced | High (UI framework swap) | https://github.com/saas-js/saas-ui-nextjs-landing-page |
| AstroWind | Startup/agency/marketing sites with blog content | Astro 5 + Tailwind | MIT | Default or Advanced | Medium | https://github.com/arthelokyo/astrowind |
| Astroship | Startup and marketing sites | Astro + Tailwind | GPL-3.0 | Default or Advanced | Medium | https://github.com/surjithctly/astroship |

## Astro deep dive (design-quality first)

| Template | Design quality | Business fit | Source stack | License | Conversion effort | Repo |
|---|---|---|---|---|---|---|
| AstroWind (upstream) | A | Agency, startup, consulting, SaaS marketing | Astro + Tailwind | MIT | Low-Medium | https://github.com/onwidget/astrowind |
| Astroplate | A | SaaS, startup, product marketing websites | Astro + Tailwind | MIT | Low-Medium | https://github.com/zeon-studio/astroplate |
| Odyssey Theme | A | Creative studios, agencies, premium service brands | Astro + Tailwind + MDX | MIT | Medium | https://github.com/treefarmstudio/odyssey-theme |
| Pinwheel Astro | A | SaaS and business landing sites (multi-page) | Astro + Tailwind | MIT (images excluded) | Medium | https://github.com/themefisher/pinwheel-astro |
| ScrewFast | A- | SaaS and directory-style business pages | Astro + Tailwind + Preline + GSAP | MIT | Medium | https://github.com/mearashadowfax/ScrewFast |
| Tailwind Astro Starter | A- | Modern startup/business pages using Flowbite system | Astro + Tailwind + Flowbite | MIT | Low-Medium | https://github.com/themesberg/tailwind-astro-starter |
| Mobile App Landing Template | A- | App businesses, product launches, startup pages | Astro + Tailwind | MIT | Low-Medium | https://github.com/sofiyevsr/mobile-app-landing-template |
| Astro Theme Stone | B+ | Personal brand, consultant, freelancer businesses | Astro + Tailwind + Alpine.js | MIT | Low-Medium | https://github.com/MIM0SA/astro-theme-stone |
| Astro + shadcn UI Template | B+ | Product teams that want shadcn-style visual language | Astro + Tailwind + shadcn-ui | MIT | Low | https://github.com/area44/astro-shadcn-ui-template |
| Folex Lite Astro | B+ | General agency and startup showcase pages | Astro + Tailwind | Getastrothemes Free Theme License | Low-Medium | https://github.com/getastrothemes/folex-lite-astro |

## Astro shortlist for template library v1

| Priority | Template | Why this is a strong default |
|---|---|---|
| P1 | AstroWind | Strong all-around business design system; flexible for many niches. |
| P1 | Astroplate | Startup/SaaS focus with clean structure that maps well to ProductVibe sections. |
| P1 | Odyssey Theme | Best premium visual direction for high-end agency/service templates. |
| P2 | Pinwheel Astro | Good multi-page business coverage; verify image asset licensing during import. |
| P2 | Tailwind Astro Starter | Fast conversion path if you want Flowbite-style components in source imports. |

## Notes for library curation

| Recommendation | Why |
|---|---|
| Prefer MIT templates first | Lowest legal friction for commercial reuse in generated projects. |
| Prioritize templates already on `Vite + React + Tailwind (+ shadcn)` | Fastest path to your advanced stack with minimal refactor work. |
| Keep 2-3 plain HTML/Tailwind templates in the starter library | Easiest to map into the default `HTML + Tailwind + DaisyUI` output. |
| Treat GPL templates (like Astroship) as optional-only | GPL obligations may not fit all downstream user projects. |
