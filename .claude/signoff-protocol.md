# Signoff protocol (per-repo copy)

Generic checklist for Claude sessions to run before ending. This file is the canonical per-repo copy; `CLAUDE.md` points to it via repo-relative path so it travels with the repo across devices via git.

Originally derived from `~/.claude/signoff-protocol.md` (per-machine central copy from another session, 2026-05-24); enhanced with multi-machine safety, blocker scan, and QA5 carve-out lifted from the prior inlined CLAUDE.md content. Sync to peer repos by copying this file; divergence between repos is acceptable per-product if intentional.

Each repo's `CLAUDE.md` should reference this file via:

```markdown
## Signoff
See `.claude/signoff-protocol.md`.
```

---

## 0. Session-start sync (run on session start, not sign-off)

Before doing substantive work, pull other-machine commits and check the rolling handoff:

```bash
git pull --rebase
git log --oneline -10              # what other machines have done
cat docs/HANDOFF.md 2>/dev/null    # current state of play
```

If `git pull` finds local changes you forgot to commit, decide: commit / stash / discard before proceeding. **Multi-device repo + uncommitted local changes = merge conflict pain at sign-off.**

This step is OPTIONAL but strongly recommended. Skip only if you know no other session has touched the repo since your last sync.

---

## 1. Blocker scan

Before committing anything, enumerate any blockers Jim needs to see or decide:

- Uncommitted file changes that should ship
- Drafts pending Jim's review (not yet committed)
- Open questions / pending decisions Jim hasn't answered
- In-flight Plan / Explore / background agent runs
- Mid-deploy work (commits pushed but CI / Pages still building) — note in handoff, don't block on it
- Significant decisions or new patterns not yet captured in memory or `docs/HANDOFF.md`
- Production-deploying code that hasn't run through QA5+10% (see carve-out below)

If blockers exist, list them with proposed resolution paths; resolve with Jim before proceeding to Step 2.

**QA5+10% carve-out.** QA5+10% verification is a blocker only for **production-deploying code**. Docs / memory / scoping changes and code that auto-deploys to staging only are safe to defer — note "QA5 pending" in the handoff and resolve on next resurface. Don't tag-and-go to prod without QA5.

---

## 2. Memory sync

Claude's per-project memory lives at `~/.claude/projects/<encoded-path>/memory/` and is **per-machine** by default. Without syncing, a session on one Mac can't see specs created on another. Mirror to the repo so all machines share state.

**Preferred: symlink (auto-setup on first sign-off per machine).**

Verify the local memory dir is a symlink pointing into the repo:

```bash
REPO="$(git rev-parse --show-toplevel)"
ENC="$(echo "$REPO" | tr / -)"
ls -la "$HOME/.claude/projects/$ENC/memory"
# Should show: memory -> <repo>/memory
```

If it's a real directory (not a symlink), set it up — preserves anything new in local memory by rsyncing it into the repo first:

```bash
REPO="$(git rev-parse --show-toplevel)"
ENC="$(echo "$REPO" | tr / -)"
LOCAL="$HOME/.claude/projects/$ENC"
mkdir -p "$LOCAL" "$REPO/memory"

if [ -d "$LOCAL/memory" ] && [ ! -L "$LOCAL/memory" ]; then
  rsync -av "$LOCAL/memory/" "$REPO/memory/"
  mv "$LOCAL/memory" "$LOCAL/memory.backup-$(date +%s)"
fi

ln -snf "$REPO/memory" "$LOCAL/memory"
```

**Fallback: additive rsync each signoff (use only when symlink can't be set up):**

```bash
REPO="$(git rev-parse --show-toplevel)"
ENC="$(echo "$REPO" | tr / -)"
rsync -av "$HOME/.claude/projects/$ENC/memory/" "$REPO/memory/"
```

**Note:** `--delete` is intentionally OMITTED from the fallback. In multi-machine usage, a `--delete` rsync from a partial local memory dir would wipe contributions from other machines on push. Accept some stale-file accumulation as the cost of safety. If you need to remove a memory file, delete it explicitly + commit the delete.

**Memory in git is not memory in public** — but it's still in git. See `memory/README.md` for the no-secrets rule and `memory/.gitignore` for excluded patterns.

---

## 3. HANDOFF.md update

Update `docs/HANDOFF.md` to reflect what this session learned, built, or deferred. This is THE pickup state for the next session on this or any machine.

Keep edits tight — the handoff should be a fresh snapshot, not a log. The append-only build-decisions log lives in commit history (and for this repo, the `PROPOSAL.md` "Decisions" section).

Recommended structure (YAML front matter + sections):

```markdown
---
repo: <repo-name>
session: <session number or name>
session_date: <YYYY-MM-DD>
last_updated: <YYYY-MM-DDTHH:MM:SSZ>
status: in_progress | done | abandoned
branch: <git branch>
originSessionId: <this Claude session UUID>
---

## Goal
One sentence.

## State
- Done:
- In progress:
- Broken / unverified:

## Decisions
- ...

## Blockers / open questions
- ...

## Touched
- files:
- workers / pages:
- tables / RPCs:
- external:

## Next step
The single next action.
```

Overwrite, don't append. Set `status: done` or `status: abandoned` when work is closed out. **Convert relative dates to absolute** (e.g., "Thursday" → `2026-05-28`). **No secrets** — reference env-var names, not values.

---

## 4. Always commit intentional work

No good reason to leave intentional work uncommitted at sign-off:

- Intentional, ready-for-main code/docs → commit + push to `main`
- WIP not ready for main → commit to `wip-*` or feature branch, push, note in handoff
- Draft awaiting Jim's review → commit to review branch, push, flag "needs ship-it"
- Spike/scratch being discarded → `git restore` explicitly before sign-off
- Secrets / env files → gitignored (never in commit; if accidentally staged, rotate the secret + `git reset` before push)

---

## 5. Git status + commit + push

```bash
git status
```

If `memory/`, `docs/HANDOFF.md`, or any other intended files changed, commit + push using conventional-commits with Claude co-author:

```bash
git add memory/ docs/HANDOFF.md   # plus any code files this session touched
git commit -m "$(cat <<'EOF'
type(scope): brief one-liner

Why and what.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

Types: `feat`, `fix`, `chore`, `docs`, `perf`, `refactor`, `test`. Single scope per commit.

In the signoff message, note **which branch** carries the new commits and **whether they need merging to main**.

**Don't** force-push, hard-reset, or do other destructive ops unless explicitly asked. If the repo isn't in git or the session made no changes, skip this step.

---

## 6. Spin-off task review

Quick scan before closing: did the session notice any out-of-scope issues worth flagging — dead code, stale docs, missing test coverage, confirmed TODOs, security smells? If so, spin them off (via `mcp__ccd_session__spawn_task`, GitHub issues, or TaskCreate) rather than mentioning as "by the way" footnotes that get lost.

Skip if nothing came up.

---

## 7. Final signoff message

Brief — three to five bullets covering:

- What shipped this session (commit IDs + one-line summaries)
- What's still open
- Which branch carries any new commits
- Caveats the next session should know (e.g., "symlink dangles until X branch merges to main")
- Anything explicitly deferred

That's it. No long retrospective.

---

## Cross-device storage layers (reference)

| Layer | What lives there | Who reads |
|---|---|---|
| Git (`origin/main` after push) | Code + tracked docs + `memory/` + `docs/HANDOFF.md` | Any device after `git pull` |
| `<repo>/memory/` (symlinked from `~/.claude/projects/<enc>/memory/`) | Claude per-project memory | This-machine sessions; other machines via git pull |
| `~/.claude/` (per-machine) | Claude Code per-machine config (settings, etc.) | This machine's sessions only |

Anything load-bearing for cross-device pickup MUST live in git by sign-off time. **Never assume the next device has your local memory files unless the symlink is set up and the repo is current.**
