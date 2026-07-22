# Animation System

## Principle

Motion should explain change, preserve orientation, and add a sense of care. It must never delay reading, obscure state, or become the primary reason a screen feels premium.

## Approved motion purposes

- Showing that an action was accepted.
- Explaining entry, exit, expansion, sorting, or hierarchy changes.
- Directing attention to a meaningful new state.
- Providing subtle continuity between related screens or controls.

Do not animate static decoration simply because space is available.

## Timing and easing

- Micro-feedback: 100-180ms.
- Local state transitions: 180-280ms.
- Section entrance or layout change: 300-500ms.
- Use easing that decelerates naturally. Avoid elastic or exaggerated spring motion in professional workflows unless it communicates a physical relationship.
- Stagger only elements that have a meaningful reading order; keep stagger intervals small.

## Interaction rules

- A control must respond immediately, even if a longer follow-up transition occurs.
- Hover transitions should be subtle and must not move content enough to cause pointer errors.
- Loading states should communicate progress or uncertainty; do not use indefinite decorative spinners where a skeleton, status message, or retry path is clearer.
- Success, error, and saved states need non-motion cues such as text, color, and accessible live feedback where appropriate.

## Reduced motion

Respect `prefers-reduced-motion: reduce` for every new transition. In reduced-motion mode, remove nonessential transforms, parallax, looping effects, and delayed entrances. State changes must remain legible without animation.

## Performance

Animate `transform` and `opacity` where possible. Avoid layout-triggering animation of dimensions, large blur filters, and long-running effects on scroll. Test animation on lower-power mobile hardware and while content is loading.

## Review checklist

- What user question does this motion answer?
- Does it work at reduced motion?
- Does it preserve focus and keyboard usability?
- Does it maintain 60fps under realistic page load?
- Does removing it make the interaction unclear? If not, it is probably optional.
