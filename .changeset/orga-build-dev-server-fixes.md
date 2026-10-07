---
'orga-build': patch
---

Fix two dev server issues: only reload when files in the content root change (unrelated writes in the project caused endless reloads), and pre-bundle `react-dom/client` and wouter's `use-sync-external-store` shim so the client no longer fails with "does not provide an export named" errors.
