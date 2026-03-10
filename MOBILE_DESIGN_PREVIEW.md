# Mobile Design Preview

## Component Hierarchy

```
MobileHome
├── Trending Section
│   ├── Section Header (🔥 Trending Now)
│   ├── Grid Container (expandable)
│   └── MobileChannelCard (x2-6)
│       ├── Image Area (rounded-t-3xl)
│       │   ├── Channel Logo/Image
│       │   ├── Play Overlay
│       │   ├── Live Badge (top-left)
│       │   ├── Trending Badge (top-right, orange)
│       │   └── Favorite Button (bottom-right)
│       └── Info Section
│           ├── Channel Name
│           ├── Group Tag
│           └── Language Tag
│
├── Favorites Section
│   ├── Section Header (❤️ Your Favorites)
│   ├── Empty State or Grid
│   └── MobileChannelCard (x2-6)
│       └── [Same structure as Trending]
│
└── Browse Section
    ├── Section Header (🌐 Browse All)
    ├── Grid Container
    └── MobileChannelCard (x2-12)
        └── [Same structure]

MobileNav (Bottom Navigation)
├── Home Button
├── Trending Button
├── Favorites Button (with badge count)
├── Browse Button
└── Settings Button
```

## UI Layout Examples

### Mobile View (Portrait - 360px)
```
┌─────────────────────────────┐
│  🔥 Trending Now            │
├─────────────────────────────┤
│  ┌────────────┐ ┌────────────┐
│  │   Card 1   │ │   Card 2   │ (2 columns)
│  │ rounded-3xl│ │ rounded-3xl│
│  │            │ │            │
│  └────────────┘ └────────────┘
│
│  ❤️ Your Favorites
├─────────────────────────────┤
│  ┌────────────┐ ┌────────────┐
│  │   Card 3   │ │   Card 4   │
│  └────────────┘ └────────────┘
│
│  🌐 Browse All
├─────────────────────────────┤
│  ┌────────────┐ ┌────────────┐
│  │   Card 5   │ │   Card 6   │
│  └────────────┘ └────────────┘
│
├─────────────────────────────┤ ← Bottom Nav
│ 🏠 📈 ❤️ 🌐 ⚙️               │
└─────────────────────────────┘
```

### Tablet View (Landscape - 768px+)
```
┌─────────────────────────────────────────┐
│  🔥 Trending Now                        │
├─────────────────────────────────────────┤
│  ┌───────┐ ┌───────┐ ┌───────┐        │
│  │Card 1 │ │Card 2 │ │Card 3 │        │ (3 columns)
│  └───────┘ └───────┘ └───────┘        │
│
│  ❤️ Your Favorites
├─────────────────────────────────────────┤
│  ┌───────┐ ┌───────┐ ┌───────┐        │
│  │Card 4 │ │Card 5 │ │Card 6 │        │
│  └───────┘ └───────┘ └───────┘        │
└─────────────────────────────────────────┘
```

## Card Design Details

### Card Structure
```
┌─ rounded-3xl ─────────────────────────┐
│                                       │
│  ┌─ rounded-t-3xl ──────────────────┐ │
│  │                                  │ │  
│  │  ┌─ LIVE ──┐    ┌─ TRENDING ──┐ │ │
│  │  │ Badge   │    │ Badge       │ │ │
│  │  └─────────┘    └─────────────┘ │ │
│  │                                  │ │
│  │       Channel Logo/Image         │ │
│  │      (Smooth Hover Scale)        │ │
│  │                                  │ │
│  │  ┌────────────────────────┐     │ │
│  │  │ Play Button (Overlay)  │     │ │
│  │  └────────────────────────┘     │ │
│  │                                  │ │
│  │           ❤️ (Favorite)  │ │
│  │          (Bottom Right)  │ │
│  └──────────────────────────────────┘ │
│                                       │
│  Channel Name (Bold, Truncated)      │
│  Group Tag  Language Tag              │
│                                       │
└───────────────────────────────────────┘
```

## Badge Styling

### Trending Badge
```
Style: bg-orange-500/90 text-white
Icon: TrendingUp (w-3 h-3)
Size: px-2.5 py-1
Text: "Trending" (uppercase, 9px bold)
```

### Favorite Badge
```
Style: bg-rose-500/90 text-white
Icon: Star (w-3 h-3, filled)
Size: px-2.5 py-1
Text: "Favorite" (uppercase, 9px bold)
```

### New Badge
```
Style: bg-blue-500/90 text-white
Text: "NEW" (uppercase, 9px bold)
Size: px-2.5 py-1
```

### Live Badge
```
Style: bg-destructive/90 text-white
Size: px-2.5 py-1
Text: "LIVE" (9px bold)
Animation: Pulse dot animation
Position: Top-left corner
```

## Responsive Behavior

### Grid Columns
- **Mobile (< 640px)**: 2 columns (grid-cols-2)
- **Tablet (640px - 768px)**: 3 columns (sm:grid-cols-3)
- **Desktop (768px+)**: 4 columns (md:grid-cols-4)
- **Wide (1024px+)**: 5 columns (lg:grid-cols-5)

### Section Expansion
- **Collapsed**: Shows 2 cards with expand indicator
- **Expanded**: Shows all available cards (max 6-12)
- **Animation**: Smooth height transition (duration-300)

## Bottom Navigation

### Mobile Bottom Nav (< 768px)
```
┌─────────────────────────────────┐
│ 🏠   📈    ❤️(3)   🌐    ⚙️     │
│ Home Trending Fav Browse Settings│
│  │    │      │     │      │     │ ← Active indicator
└─────────────────────────────────┘

Height: h-16 (64px)
Min tap target: 44px
Badge: Shows count for Favorites
Active: Color indicator bar at bottom
```

## Color System

### Cards
- Background: `bg-card`
- Border: `border-border/20`
- Hover Border: `hover:border-primary/30`

### Badges
- Trending: Orange (#FF8C00 - 500 opacity)
- Favorite: Rose (#F43F5E - 500 opacity)
- New: Blue (#3B82F6 - 500 opacity)
- Live: Destructive red

### Text
- Title: `text-foreground` (foreground color)
- Meta: `text-muted-foreground` (secondary text)
- Badge Text: `text-white` (high contrast)

## Animations

### Hover Effects
- Card Scale: slight upward movement
- Image Scale: 105% zoom on hover
- Shadow: Enhanced shadow-md
- Transition: duration-300 (smooth)

### Interactions
- Favorite Toggle: Heartbeat animation
- Badge Appearance: Fade-in on section expand
- Button Press: Active scale-95 effect
- Navigation Active: Smooth indicator slide

## Spacing System

- Card Gap: `gap-4` (16px)
- Section Spacing: `space-y-6` (24px)
- Inner Padding: `p-3.5` (14px)
- Badge Padding: `px-2.5 py-1` (10px horizontal, 4px vertical)

## Accessibility Features

- Minimum touch target: 44px × 44px
- Color contrast: WCAG AA compliant
- Semantic HTML: Proper button and section elements
- Badge aria-labels for screen readers
- Keyboard navigation: Tab through all interactive elements
- Focus indicators: Visible focus rings on buttons
