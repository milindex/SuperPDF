## What changed

<!-- A short summary of the change and the problem it solves. -->

Fixes #

## Type of change

- [ ] Bug fix
- [ ] New tool or feature
- [ ] UI, layout, or copy change
- [ ] Performance, accessibility, or security
- [ ] Documentation, tests, or maintenance

## Checklist

- [ ] I tested this locally with a real PDF or file.
- [ ] `npm run build` passes.
- [ ] `npm test` passes.
- [ ] `npx playwright test` passes for UI or tool changes.
- [ ] `npm run check` passes (service worker, docs, and `sendToSw` checks).
- [ ] I ran `npm run build:sw` if anything under the service-worker source changed.
- [ ] Processing still happens in the browser. No PDF or user file is uploaded, stored, or sent to a server.
- [ ] Existing tools, routes, and downloads still work.
- [ ] I checked desktop and mobile, plus light and dark themes where relevant.
- [ ] Keyboard focus, focus order, and screen-reader labels still work.
- [ ] I added or updated tests for the behaviour I changed.
- [ ] I updated the changelog or docs when public behaviour changed.
- [ ] No secrets, tokens, personal data, or unnecessary generated files are included.

### For new or changed PDF tools

- [ ] The tool works with a normal file, an invalid file, and a password-protected file where relevant.
- [ ] Loading, empty, success, and error states are covered.
- [ ] The output downloads with the expected name, type, and contents.
- [ ] The tool is registered in `src/registry/tools.ts` and appears on `/tools`.
- [ ] A new service-worker message type is added to the shared contract if needed.

## Reviewer notes

<!-- Anything the reviewer should know, including known limitations. -->

## Screenshots or recordings

<!-- Required for visual changes. -->
