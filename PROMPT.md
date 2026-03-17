# MISSION

Write some tests for this serverside rendered app template.

# EXECUTION RULES

1. READ: Always check `specs/prd.json` and `progress.log` at the start of
   every session.
2. SCOPE: Pick the highest priority task where `passes: false`. Work ONLY on
   that task.
3. VERIFY: You must run `npm run lint` and `npm test` after any code change.
4. DOCUMENT: Update `progress.log` with what was changed and any new
   patterns discovered.
5. COMMIT: If tests pass, commit with a descriptive message
   like `FEATURE: [TaskID] - [Description]`.

# STOP CONDITION

Once ALL tasks in `specs/prd.json` have `passes: true`, you must output the 
exact string: <promise>COMPLETE</promise>
Do not perform any further work after all tasks are verified.
