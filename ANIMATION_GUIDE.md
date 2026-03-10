// Premium Animation Guide
// ======================
// This file documents all available animations configured in tailwind.config.ts

// ENTRANCE ANIMATIONS
// fade-in: Simple opacity fade in - 0.3s ease-out
// slide-in-left: Slides in from left with bounce easing - 0.5s cubic-bezier
// slide-in-right: Slides in from right with bounce easing - 0.5s cubic-bezier  
// slide-in-down: Slides in from top with bounce easing - 0.5s cubic-bezier
// scale-in: Scales up from 0.95 with fade - 0.4s cubic-bezier
// bounce-in: Bouncy entrance with scale - 0.6s cubic-bezier
// blur-in: Blurs away while fading in - 0.5s ease-out
// pop: Playful scale animation - 0.5s cubic-bezier

// EXIT ANIMATIONS
// slide-out-left: Slides out to left - 0.4s ease-in
// slide-out-right: Slides out to right - 0.4s ease-in
// scale-out: Scales down with fade - 0.3s ease-in
// blur-out: Blurs while fading out - 0.3s ease-in

// ATTENTION ANIMATIONS
// heartbeat: Pulsing scale effect - 1.3s infinite
// glow: Blue box shadow glow - 2s infinite
// wiggle: Small rotation wiggle - 0.5s infinite
// pulse-glow: Red glow pulse - 2s infinite

// SPECIAL EFFECTS
// spin-slow: Slower rotation - 3s infinite
// flip: 3D flip animation - 0.6s ease-in-out
// gradient-shift: Animates gradient position - 3s infinite
// pulse-ring: Expanding ring pulse - 2s infinite
// infinite-scroll: Continuous scroll - 20s infinite
// shimmer-pulse: Opacity pulse - 2s infinite

// USAGE EXAMPLES
// ===== Buttons and Links =====
// hover:animate-pop -> Bouncy pop on hover
// hover:animate-scale-in -> Scale up on hover
// active:animate-scale-out -> Scale out on click

// ===== Cards and Content =====
// animate-slide-in-left -> Entrance animation for cards
// group-hover:animate-glow -> Glow effect on card hover
// animate-bounce-in -> Bouncy card entrance

// ===== Loading States =====
// animate-spin-slow -> Slow loader spinner
// animate-pulse-ring -> Ring pulse loading indicator
// animate-shimmer-pulse -> Shimmer loading effect

// ===== Interactive Elements =====
// animate-heartbeat -> Active favorite button
// hover:animate-pop -> Button hover effect
// group-hover:animate-pop -> Play button on card hover

// ===== Page Transitions =====
// animate-fade-in -> Page fade in entrance
// animate-slide-in-down -> Header slide down
// animate-slide-in-left -> Sidebar slide in

// ===== Modals and Overlays =====
// animate-scale-in -> Modal entrance
// animate-fade-in -> Overlay entrance
// group-hover:animate-scale-out -> Close animation

// STAGGERING ANIMATIONS
// Use animation-delay or transition-delay in milliseconds:
// <div style={{ transitionDelay: '0ms' }}>
// <div style={{ transitionDelay: '50ms' }}>
// <div style={{ transitionDelay: '100ms' }}>

// PRACTICAL EXAMPLES
// ------- Component: ChannelCard -------
// animate-slide-in-left - Card entrance
// hover:animate-glow - Highlight on hover
// group-hover:animate-pop - Play button entrance
// animate-heartbeat - Favorite button when active

// ------- Component: Sidebar -------
// animate-slide-in-left - Sidebar entrance
// animate-fade-in - Mobile overlay entrance
// hover:animate-scale-in - Menu item hover

// ------- Component: Modal -------
// animate-scale-in - Modal entrance
// animate-fade-in - Backdrop entrance

// ------- Component: Button -------
// hover:animate-pop - Hover effect
// active:scale-95 - Click feedback
// group-hover:animate-scale-in - Group hover

// PERFORMANCE NOTES
// - All animations use CSS (no JavaScript overhead)
// - Use 'forwards' fill-mode to prevent animation reset
// - Disable animations on low-end devices if needed
// - Use will-change sparingly (can have performance cost)
// - Animations are GPU-accelerated (transform, opacity)

// CUSTOMIZATION
// Edit tailwind.config.ts keyframes section to:
// - Adjust timing
// - Modify easing functions (ease-in, ease-out, cubic-bezier)
// - Change animation property values

// BROWSER SUPPORT
// All animations work in:
// - Chrome/Edge 90+
// - Firefox 88+
// - Safari 14+
// - Mobile browsers (iOS Safari 14+, Chrome Android)

