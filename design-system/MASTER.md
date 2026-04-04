# Made in Heaven Design System

Source of truth for the active web app.

## Tokens

```ts
colors: {
  heaven: {
    'bg-dark':  '#12121f',
    'bg-card':  '#1c1c30',
    'bg-light': '#f0eefa',
    'lilac':    '#c9b8e8',
    'mint':     '#b8e8d4',
    'rose':     '#f0c4d4',
    'cream':    '#f5e6c8',
    'sky':      '#b8d4f0',
    'text':     '#f5f5f0',
    'muted':    '#9b99b0',
    'divider':  '#2e2e4a',
  }
}
```

## Typography

- Display: Bebas Neue
- Body: DM Sans
- Use uppercase display treatment for section heads and product titles
- Keep body copy readable, sentence case, and compact

## Surfaces

- Primary surface: bg-heaven-bg-dark
- Elevated cards: bg-heaven-bg-card with border-heaven-divider
- Light sections: bg-heaven-bg-light only when a strong contrast break is needed

## Motion

- Prefer short, purposeful transitions
- Animate hero entry and major reveal states once
- Respect prefers-reduced-motion

## Component rules

- Buttons and links must show a visible pointer cursor
- CTA primary: lilac to mint emphasis
- CTA outline: bordered, low-noise, high-contrast
- WhatsApp CTA: reserved for contact and quoting
- Cards should lift slightly on hover, not float aggressively
- Avoid arbitrary brand hex values unless required by a third-party brand surface

## Current rollout

- Shared primitives: SectionWrapper, Badge, GlowDivider, CTAButton, ProductCard
- First surfaces: Navbar, HeroSection, CategoriasGrid, ProductosDestacados, PersonalizacionSection
- Next surfaces: catalog filters, product detail pages, checkout/carrito, footer polish