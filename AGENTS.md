# Workspace Instructions

## Role
- This workspace is the frontend workspace for `https://github.com/Final-final-team/front-vibe.git`.
- Frontend changes should be made here.

## Backend Reference
- Use `/mnt/c/Users/alswl/Desktop/fianl` as the default backend reference workspace.
- Before changing frontend behavior that depends on APIs, DTOs, auth, response shapes, validation rules, or business logic, inspect the backend code in `/mnt/c/Users/alswl/Desktop/fianl`.
- Keep frontend behavior aligned with the backend implementation unless the user explicitly requests otherwise.

## Working Rule
- For future tasks in this workspace, assume the frontend code is adjusted with the backend code in `/mnt/c/Users/alswl/Desktop/fianl` as the source of truth for integration details.

## Decision Support Rule
- Assume the primary developer in this workspace is a backend developer and may not be comfortable making frontend technical choices alone.
- When a frontend technical decision is needed, do not silently choose by default if the decision is meaningfully ambiguous.
- Present the decision one by one, explain the available options, and describe the pros, cons, and recommendation in plain language before proceeding.
- Ask for confirmation on meaningful frontend architecture or implementation choices such as rendering model, framework conventions, state management, routing structure, data fetching strategy, styling approach, form handling, and component abstraction boundaries.
- Record the reasoning, recommendation, tradeoffs, and final choice for those decisions in Markdown files under a `WHY/` folder inside this workspace.
- Treat the `WHY/` folder as the running decision log for frontend architecture and implementation rationale.
