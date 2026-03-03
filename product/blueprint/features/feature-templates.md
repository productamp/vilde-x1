# Feature — Templates

Add a templates feature for each individual project.

This is a simple product feature:
- A new `Templates` view gives users ready-to-use website inspirations.
- Users can browse template options quickly.
- Users can clone a template and start immediately.
- A `Template Generator` wizard is also available for users who prefer guided setup.
- The goal is fast project kickoff with less blank-page friction.

## User flow

1. User starts a new project (or opens Templates from an existing project flow).
2. User browses template options.
3. User previews a template.
4. User clicks `Use Template` / `Clone Template`.
5. Project is created from that template and opened for editing/chat.

## Template Generator (wizard)

- Simple guided wizard with a few questions.
- Users fill answers quickly (business type, style preference, pages needed, tone, etc.).
- Product generates a starter template from those answers.
- User starts from generated template without needing prompt-writing skills.

## View structure

- Template gallery (cards with thumbnail, name, short description)
- Filters/categories (for example: services, local business, portfolio, blog, ecommerce-lite)
- Quick preview mode
- Primary action to clone/start
- Entry point for `Template Generator` wizard

## Behavior

- Templates are inspiration-first and starter-ready.
- Cloning a template should create a fully editable project.
- Generator wizard output should also create a fully editable project.
- Chat can immediately continue editing the cloned result.
- Keeps onboarding simple for non-technical users who do not want to start from scratch.

## Goal

Help users get to a good first version faster by starting from proven templates instead of an empty project.
