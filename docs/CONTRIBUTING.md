# Contribution and upstream integration

The supplied ZIP was imported unchanged as a separate baseline commit in
`NikiPah/nhcaforg`. Milestone 1 lives on `feature/milestone-1-foundations`.
The ZIP contains no Git history, so this repository is not a GitHub fork and its
baseline cannot be presumed to match the latest upstream commit.

Review the feature branch against this repository's `main`. Do not deploy the
informational portal as an operational service.

## Integrating with `nhcafoundation/nhcaf-platform`

Upstream access must first be granted. An unrelated repository normally cannot
open a cross-repository pull request directly into upstream. A maintainer should
use a branch based on the actual upstream default branch and apply only the
contribution commits, not the ZIP import commit:

```bash
# In an authenticated checkout of the real upstream repository, after checking
# for local work. Substitute its actual default branch if different.
git fetch origin
git switch -c feature/milestone-1-foundations origin/main
git remote add contribution https://github.com/NikiPah/nhcaforg.git
git fetch contribution main feature/milestone-1-foundations
# Inspect the contribution and its import boundary before applying:
git log --oneline contribution/feature/milestone-1-foundations
git diff contribution/main...contribution/feature/milestone-1-foundations
# Cherry-pick the milestone commit(s) only, using their exact SHAs.
# Resolve conflicts against the current upstream site and re-run all checks.
```

Open an upstream PR after validation.
Merge through the upstream project's review process; never force unrelated
histories together or overwrite upstream files wholesale. Production deployment
and merges to upstream `main` require the project's approval.
