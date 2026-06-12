# Frontend Design Guide

**Status:** Shared standard
**Version:** 1.0.0
**Last updated:** 2026-06-12

---

## 1. Purpose

This guide defines the shared frontend baseline for Retailpulses repositories. It is intended to keep UI work consistent across repos without forcing every project into the same component structure.

Use this as the organization-level default. Repo-level guidance may add stricter rules for a specific product or workflow.

---

## 2. Scope Boundary

This guide covers shared design and interaction principles.

This guide does not replace:

- repo-specific business rules
- product-specific UX decisions
- local architecture constraints
- task-specific acceptance criteria

---

## 3. Core Principles

### 3.1 Mobile-First

- Start from the smallest practical viewport.
- Make core actions usable on phones before expanding to desktop.
- Avoid layouts that only work once there is abundant horizontal space.

### 3.2 Clarity Over Decoration

- Make the primary task obvious.
- Use visual emphasis to support action priority, not to create noise.
- Reduce ambiguity in labels, empty states, and success or failure messages.

### 3.3 Operational Safety

- Operator-facing flows must make the current state easy to understand.
- Risky actions should be clearly distinguishable from safe actions.
- Confirmation should be used for destructive or production-sensitive actions.

### 3.4 Consistency

- Similar actions should look and behave similarly within the same repo.
- Repeated UI patterns should not be reinvented screen by screen.
- Shared labels should keep the same wording for the same concept.

---

## 4. Layout Rules

- Prefer simple vertical flow over dense multi-column layouts on small screens.
- Keep primary actions close to the content they act on.
- Avoid placing critical actions below large decorative sections.
- Use spacing to group related controls and separate unrelated ones.
- Make tables and dense data views degrade gracefully on smaller screens.

---

## 5. State Design

Every meaningful UI flow should account for:

- loading
- empty
- success
- error
- disabled or unavailable states where relevant

State messaging should tell the user:

- what is happening
- what succeeded or failed
- what they can do next

---

## 6. Buttons and Actions

- One primary action per area where possible.
- Secondary actions should remain visually subordinate.
- Dangerous actions should look clearly dangerous.
- Button labels should use concrete verbs such as `Save`, `Publish`, `Retry`, or `Generate CSV`.
- Avoid vague labels such as `Submit` when a more specific verb is possible.

---

## 7. Forms

- Keep required inputs obvious.
- Validate as early as practical without creating noisy interruption.
- Error messages should say what is wrong and how to fix it.
- Related fields should be grouped logically.
- Do not hide critical validation behind a final submit if earlier feedback is possible.

---

## 8. Responsive Behavior

- Check the default mobile layout first.
- Verify medium-width tablet or laptop layouts next.
- Confirm desktop expansion improves scanability rather than just filling space.
- Prevent overflow, clipped controls, and unreadable tables.

---

## 9. Accessibility Baseline

- Inputs need labels.
- Interactive elements need clear focus states.
- Text and controls need sufficient contrast.
- Important status messages should not rely only on color.
- Keyboard access should remain usable for core flows.

---

## 10. Working With Shared Standards

Repos can reference this guide in their local docs:

```md
## Organization Standards

This repo follows the shared Retailpulses frontend guide:
- `retailpulses/.github/docs/frontend/frontend-design-guide.md`
- `retailpulses/.github/docs/agent-roles/frontend-agent.md`

Agents should follow these shared standards unless this repo defines a stricter local rule.
```

---

## 11. Recommended Review Checklist

Before closing a frontend task, check:

- Is the primary user action obvious?
- Does the flow work on mobile first?
- Are loading, empty, success, and error states covered?
- Is the button hierarchy clear?
- Are form errors understandable?
- Does the layout remain usable at smaller widths?
- Are basic accessibility expectations met?

---

## Version Log

- 2026-06-12: Initial shared frontend baseline created for cross-repo reuse.
