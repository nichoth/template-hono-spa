# Research: Square Home Cards

## Decision 1: Keep the home cards in a single three-column row and allow horizontal scroll when needed

- Decision: Use an explicit three-column home grid that can overflow horizontally instead of relying on `auto-fit` wrapping.
- Rationale: The user clarified that the layout should fit three square cards at the supplied resolution and scroll if necessary. The current `repeat(auto-fit, minmax(...))` grid chooses flexible column counts and, combined with `grid-auto-rows: minmax(28rem, auto)`, produces the tall cards shown in the screenshot. A fixed three-column track definition is the simplest way to guarantee the row shape.
- Alternatives considered:
  - Keep `auto-fit` and only reduce `grid-auto-rows`: rejected because it does not guarantee three visible columns at the reference resolution.
  - Force smaller cards with `auto-fit`: rejected because shrinking columns aggressively would hurt readability and button spacing before overflow becomes available.

## Decision 2: Use `aspect-ratio: 1 / 1` on cards as a preferred size, not a hard clip

- Decision: Apply a square preferred aspect ratio to home cards while allowing natural vertical growth when card content exceeds the square height.
- Rationale: CSS `aspect-ratio` gives the requested square footprint without introducing JS measurement or clipping. Because the card height can still expand when content needs more room, it satisfies the existing readability requirement and works for the dynamic JSON response panel.
- Alternatives considered:
  - Hard-code equal width and height values: rejected because it would clip or hide content as response data grows.
  - Use JavaScript resize observers to calculate heights: rejected as unnecessary runtime complexity for a CSS layout problem.

## Decision 3: Scope the change to the home route and verify with source-level tests

- Decision: Limit implementation to `/src/client/routes/home.css`, optionally `/src/client/components/card.css`, and targeted Vitest assertions that inspect route/card source and CSS expectations.
- Rationale: The request is localized to the home card grid, and the repository already uses source-oriented Vitest checks. That keeps the feature low risk and aligned with the current test strategy.
- Alternatives considered:
  - Change global grid tokens in `/src/style.css`: rejected because those variables may affect unrelated routes and make the change broader than requested.
  - Add browser E2E tooling: rejected because the repo does not currently use it and the layout adjustment does not justify new infrastructure.
