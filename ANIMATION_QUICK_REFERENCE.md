# Quick Animation Reference Guide

## Using Animations in Components

### 1. Simple Animations

```jsx
// Fade in on page load
<div className="animate-fade-in">
  Your content here
</div>

// Slide in from left
<div className="animate-slide-in-left">
  Page content
</div>

// Bounce entrance
<div className="animate-bounce-in">
  Welcome message
</div>
```

### 2. Hover Effects

```jsx
// Glow effect on card hover
<div className="group hover:animate-glow">
  <h3>Channel Name</h3>
  <button className="group-hover:animate-pop">Play</button>
</div>

// Scale effect on button hover
<button className="hover:scale-110 transition-transform">
  Click me
</button>

// Pop animation on hover
<div className="hover:animate-pop cursor-pointer">
  Interactive element
</div>
```

### 3. Active States

```jsx
// Heartbeat for favorite button
<button className={isFavorite ? 'animate-heartbeat' : ''}>
  ❤️ Add to Favorites
</button>

// Scale down on click
<button className="active:scale-95">
  Press me
</button>
```

### 4. Loading States

```jsx
// Slow spinner for professional look
<Loader2 className="animate-spin-slow w-8 h-8" />

// Ring pulse loading indicator
<div className="animate-pulse-ring w-16 h-16" />

// Shimmer loading effect
<div className="animate-shimmer-pulse bg-muted p-4 rounded" />
```

### 5. Page Transitions

```jsx
// Based on transition direction
<div className={
  transitionDir === 'left' ? 'animate-slide-in-left' :
  transitionDir === 'right' ? 'animate-slide-in-right' :
  ''
}>
  Page content
</div>
```

### 6. Modal/Overlay Animations

```jsx
// Modal entrance
<div className="animate-scale-in">
  <div className="animate-fade-in bg-black/50">
    Backdrop
  </div>
  <div className="bg-white rounded-lg shadow-lg">
    Modal content
  </div>
</div>

// Exit animation
{isClosing && <div className="animate-scale-out">Modal</div>}
```

### 7. Staggered Animations

```jsx
// Stagger cards on load
{items.map((item, index) => (
  <div
    key={item.id}
    className="animate-pop"
    style={{ transitionDelay: `${index * 50}ms` }}
  >
    {item.content}
  </div>
))}
```

### 8. Scroll Reveal Animations

```jsx
// Using useScrollReveal hook
import { useScrollReveal } from '../hooks/useScrollReveal';

function ScrollRevealCard() {
  const { ref, isVisible } = useScrollReveal();
  
  return (
    <div ref={ref} className={isVisible ? 'animate-pop' : 'opacity-0'}>
      This animates when scrolled into view
    </div>
  );
}
```

### 9. Combining Animations

```jsx
// Multiple animations with different timings
<div>
  <div className="animate-slide-in-down">Header</div>
  <div className="animate-slide-in-left" style={{ transitionDelay: '100ms' }}>
    Sidebar
  </div>
  <div className="animate-fade-in" style={{ transitionDelay: '200ms' }}>
    Main content
  </div>
</div>
```

## Animation Classes Reference

### Entrance (Single Use)
```
animate-fade-in          (0.3s)
animate-slide-in-left    (0.5s bounce)
animate-slide-in-right   (0.5s bounce)
animate-slide-in-down    (0.5s bounce)
animate-scale-in         (0.4s bounce)
animate-bounce-in        (0.6s bounce)
animate-blur-in          (0.5s)
animate-pop              (0.5s bounce)
```

### Exit (Single Use)
```
animate-slide-out-left   (0.4s)
animate-slide-out-right  (0.4s)
animate-scale-out        (0.3s)
animate-blur-out         (0.3s)
```

### Attention (Infinite Loop)
```
animate-heartbeat        (1.3s infinite)
animate-glow             (2s infinite)
animate-wiggle           (0.5s infinite)
animate-pulse-glow       (2s infinite)
```

### Special Effects (Infinite or Single)
```
animate-spin-slow        (3s infinite)
animate-flip             (0.6s)
animate-gradient-shift   (3s infinite)
animate-pulse-ring       (2s infinite)
animate-infinite-scroll  (20s infinite)
animate-shimmer-pulse    (2s infinite)
```

## Performance Tips

### ✅ DO:
- Use transform and opacity for animations (GPU accelerated)
- Add animations to interactive elements for feedback
- Use 'forwards' fill-mode to prevent reset
- Test animations on mobile devices
- Keep animations under 1 second for UI feedback

### ❌ DON'T:
- Animate width/height (causes reflow/repaint)
- Use background-color animations for every element
- Add animations to elements that aren't interactive
- Use excessive blur filters (performance hit)
- Animate too many elements simultaneously

## Browser Compatibility

All animations work in:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Mobile Chrome (all modern versions)

## Disabling Animations for Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Common Use Cases

### Card Gallery
```jsx
{channels.map((channel, index) => (
  <div
    key={channel.id}
    className="group hover:animate-glow animate-bounce-in"
    style={{ transitionDelay: `${index * 30}ms` }}
  >
    <img src={channel.logo} alt={channel.name} />
    <button className="group-hover:animate-pop">Play</button>
  </div>
))}
```

### Loading Skeleton
```jsx
<div className="animate-shimmer-pulse bg-muted rounded">
  <div className="h-8 w-full bg-muted-foreground/20 rounded" />
</div>
```

### Page Transition
```jsx
{showContent && (
  <div className="animate-fade-in">
    <h1 className="animate-slide-in-down">Welcome</h1>
    <p className="animate-slide-in-left" style={{ transitionDelay: '100ms' }}>
      Your content here
    </p>
  </div>
)}
```

### Button States
```jsx
<button className="hover:animate-pop active:scale-95 transition-transform">
  Click me
</button>
```

### Favorite Toggle
```jsx
<button
  onClick={toggleFavorite}
  className={isFavorite ? 'animate-heartbeat text-red-400' : 'text-gray-400'}
>
  ❤️ {isFavorite ? 'Favorited' : 'Favorite'}
</button>
```

## Troubleshooting

**Animation not showing?**
- Check if Tailwind CSS is properly configured
- Verify animation class name is correct
- Check for conflicting CSS rules
- Ensure element is visible (not hidden/collapsed)

**Animation stuttering?**
- Avoid animating width/height (use scale instead)
- Reduce number of simultaneous animations
- Check DevTools Performance tab for jank
- Use will-change sparingly

**Animation too fast/slow?**
- Adjust duration in tailwind.config.ts
- Use transition-delay for staggering
- Test on target devices

**Animation not working on mobile?**
- Test in actual mobile browser (not just DevTools)
- Check for tap/touch state overrides
- Verify animation triggers (hover vs active)
- Consider using Intersection Observer for scroll animations
