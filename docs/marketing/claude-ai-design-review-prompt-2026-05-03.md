# Claude.ai Design Review Prompt (ELBTRONIKA)

## Goal
Create a high-signal design and UX review for the current ELBTRONIKA website state, focused on investor readiness and conversion confidence for Lee Hoops.

## Context
- Product: ELBTRONIKA immersive art platform (techno + digital art).
- Audience for this review: founder team and investor-facing stakeholders.
- Current mode: demo-first experience with a visible demo banner.
- Key routes to evaluate:
  - /de
  - /de/gallery
  - /de/shop
  - /de/press
  - /de/checkout

## What to Analyze
1. Visual direction
- Is the brand language distinct, premium, and coherent?
- Is typography hierarchy clear on mobile and desktop?
- Are color contrasts and accent usage consistent and intentional?

2. Investor pitch credibility
- Does the first 20 seconds communicate product maturity?
- Which elements increase trust? Which elements reduce trust?
- Is the demo banner placement and wording investor-friendly?

3. Conversion flow quality
- Evaluate the path Landing -> Gallery -> Shop -> Checkout -> Success.
- Identify friction points, dead ends, and unclear CTA transitions.
- Recommend CTA copy improvements (German and English where relevant).

4. Error-state design quality
- Assess visual quality and recovery UX of error states (example: shop data failure).
- Propose fallback behavior that preserves confidence during demos.

5. Footer and legal trust surface
- Evaluate clarity of legal/privacy/contact links for a pre-launch German company.
- Suggest wording that is transparent but confidence-preserving.

## Output Format (strict)
Return your answer in this structure:

1. Executive Summary (max 8 bullets)
2. Top 10 Design/UX Issues (severity: Critical/High/Medium/Low)
3. Quick Wins (can be done in 1 day)
4. Investor Confidence Improvements (specific copy + placement)
5. Mobile-specific improvements
6. Accessibility and readability concerns
7. Suggested visual direction refresh (fonts, spacing, motion, art direction)
8. Final score (0-100) and rationale

## Constraints
- Do not suggest a full redesign from scratch.
- Keep current ELBTRONIKA brand mood (dark, immersive, electronic) but improve clarity and trust.
- Favor practical, implementable recommendations over abstract design theory.
- Assume engineering capacity for 1-2 sprint weeks.

## Optional Evidence Inputs
If screenshots are available, include route-specific comments per screenshot and rank by business impact.

## Tone
Direct, specific, and execution-focused. Avoid vague statements like "make it cleaner" without concrete fixes.
