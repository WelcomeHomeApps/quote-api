# Memory directory

This directory holds Claude's per-project memory files. It is symlinked from `~/.claude/projects/<encoded-path>/memory/` per `.claude/signoff-protocol.md` Step 2, so memory travels with the repo across devices via git.

If you're on a machine where this symlink isn't yet set up, the next sign-off will create it automatically (no manual action needed).

## Rules

1. **No secrets.** API keys, tokens, OAuth client_secrets, credentials, env-file contents, etc. never go in here. If a memory file *would* contain a secret, redact and replace with the env-var name (`SUPABASE_SERVICE_ROLE_KEY`, not the actual value).

2. **No PII.** Buyer / bidder / seller / individual personal data does not belong in memory (per CLAUDE.md privacy rules). Auction *house* business names + aggregated transactional data are fine.

3. **No large binaries.** Memory should be text-based notes (Markdown, JSON, YAML). Images, PDFs, datasets, screenshots → put them in `drafts/`, `docs/`, or `assets/` depending on use.

4. **Memory files are git-tracked.** Every change ends up in the public-style git log (even on a private repo, history is shared with anyone who gets read access). Write accordingly.

## What goes here

The patterns established in the AuctiSync repo (`~/.claude/projects/-Users-jimmielke-Documents-GitHub-AuctiSync/memory/`) are a good guide:

- `feedback_*.md` — operating rules Jim wants applied across sessions
- `project_*.md` — durable project state notes (architecture decisions, plan checkpoints, etc.)
- `reference_*.md` — technical reference patterns Jim's other sessions discovered
- `research_*.md` — research synthesis on competitors, market, regulation, etc.
- `audit_*.md` — point-in-time audits (competitive intel, compliance reviews, etc.)
- `user_*.md` — notes about how Jim works / who Jim is

Single-session-only scratch belongs in `docs/HANDOFF.md` (rolling) or commit messages (point-in-time). Don't put short-lived state here.

## .gitignore

The `.gitignore` in this directory excludes common secret-shaped filename patterns as a safety net. It's not a substitute for human judgment — review any new memory file before staging.

For a stronger guarantee, add a pre-commit hook running `gitleaks`, `trufflehog`, or `git-secrets` once this repo has CI. Pending.

## Conflict resolution (multi-machine)

Memory writes from different machines can race. If `git pull` shows conflicting memory file edits:

- **Same content** → take either, doesn't matter
- **Different content, additive** → manual merge; memory files are human-readable Markdown
- **One side wholesale lost the other's edits** → recover from `git reflog`, then merge by hand

When in doubt, defer to Jim and don't commit until resolved.
