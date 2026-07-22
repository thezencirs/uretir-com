# Design System

## Purpose

The Uretir design system makes the product feel calm, precise, and useful across editorial, community, and AI surfaces. It is a shared language, not a collection of one-off page styles.

## Visual character

Uretir combines an editorial serif voice with a pragmatic interface sans-serif. The result should feel considered rather than luxurious, technical rather than cold, and expressive without becoming decorative noise.

## Typography

- Display type uses the project display serif for high-value editorial and identity moments: page titles, feature headings, and concise statements.
- Interface type uses the system sans-serif stack for navigation, controls, body copy, metadata, and dense data.
- Display type is not used for long passages, critical forms, or compact controls.
- Preserve readable line length: generally 45-75 characters for body copy.
- Hierarchy comes from size, weight, line height, and spacing before color.

## Spacing and grid

- Base spacing unit: 4px. Use a consistent rhythm such as 4, 8, 12, 16, 24, 32, 48, 64, and 96.
- Primary content uses the existing `section-wrap` container and adapts within a fluid viewport.
- Align adjacent sections to shared vertical rules whenever possible.
- Cards and panels must have enough internal spacing to be scanned without visual separators doing all the work.

## Color and themes

The palette is neutral-first with a restrained lime-green accent. Accent color communicates selection, progress, positive action, or a meaningful connection; it must not become a generic decoration.

- Light mode is the baseline reading environment.
- Dark mode preserves semantic contrast and hierarchy; it is not an inverted screenshot.
- Text and controls must meet WCAG AA contrast requirements in both modes.
- Do not encode meaning only with color; pair it with text, iconography, or structure.

## Components

### Cards

Cards group a cohesive unit of information or action. A card needs a clear hierarchy and a single primary interaction. Avoid wrapping unrelated links, controls, and status signals in one click target.

### Buttons

- Primary buttons represent the most important action in a local context.
- Secondary buttons offer an alternative without competing visually.
- Text buttons are for low-risk navigation and supporting actions.
- Every button needs a meaningful label, disabled rationale when relevant, and visible keyboard focus.

### Forms

Use labels, concise supporting copy, clear validation, and input-specific autocomplete attributes. Collect only information needed for the current value exchange. Onboarding fields should be optional unless access or safety requires them.

### Navigation

Navigation labels describe destinations, not internal team terminology. Preserve location awareness, keyboard support, and a predictable mobile alternative.

## Component lifecycle

Before adding a component, check whether an existing pattern can serve the use case. A new component needs:

1. A repeatable user problem.
2. A documented API and responsive behavior.
3. Light and dark states.
4. Keyboard and screen-reader behavior.
5. A decision about whether it belongs in the shared system or remains route-specific.

## Design review questions

- Does the interface make the next action obvious?
- Does hierarchy survive without color or animation?
- Is the visual treatment improving comprehension or only adding novelty?
- Can this pattern be reused without copying markup?
- Is the smallest viewport treated as a complete product, not a compressed desktop page?
