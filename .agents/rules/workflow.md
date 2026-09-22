---
trigger: always_on
---

# Supabase Migration Workflow

When modifying the database schema in this workspace, follow these strict rules:

1. **Chronological Migrations**: Always create a new, numbered migration file in `supabase/migrations/` (e.g., `06_auth_roles.sql`) for any incremental changes. Do not edit previous migrations unless explicitly instructed.
2. **Complete Schema**: After adding a new migration, you MUST ALSO update `supabase/migrations/complete_schema.sql`. This file acts as a squashed, single-source-of-truth snapshot of the database. Additions and deletions should be resolved naturally here (e.g., if a column is added in migration 02 and dropped in migration 05, it should not exist in `complete_schema.sql`).
3. **No Demo Data**: Never include mock or demo data inserts in the schema files. No actual data seeding via the UI or a separate script.
4. **Git Commits**: Provide the user with a short 20-30 word git commit message enclosed in quotes after every task major or minor.
5. **Update EXPLAINER.md**: Always update the EXPLAINER.md file for every minor or major changes made with timestamp and proceed with fixing issues or changes yet to be made. Update the details of things done and then remove the item from the issues or yet to be fixed. 
6. **Implementation plan**: Always present a very short but descriptive implementation plan before making any changes.


7. **Skills**: use these skills for development and better UI/UX
npx antigravity skills add emil-kowalski/interactions
npx antigravity skills add pbakaus/impeccable
# 1. Establish the source of truth for your product's voice, target audience, and restrictions
/impeccable init 
# 2. Add deliberate, purposeful motion to what you've built
/impeccable animate
# 3. Clean up the AI text, generic empty states, and error handling edge cases
/impeccable harden
npx antigravity skills add shadcn/taste
npx antigravity skills add Dammyjay93/interface-design
npx antigravity skills add nextlevelbuilder/ui-ux-pro-max