# ft_transcendence — Security & Quality Audit (2025-11-17)

## Executive overview
- **Scope**: full-stack repo (`backend/` NestJS API + Prisma, `frontend/` Vue 3 + PrimeVue)
- **Method**: static review of controllers, services, gateways, store/router, and websocket utilities. No dynamic scanning performed.
- **Summary**: multiple critical authorization flaws allow any authenticated client (and in some cases anonymous users) to escalate room privileges, impersonate other users, or exfiltrate chats/historic game logs. WebSocket authentication is broken, 2FA rate-limiting is ineffective, and several modules cannot compile. Frontend stores JWTs insecurely and misconfigures sockets/cookies, preventing reliable auth and exposing tokens to XSS.

## Critical findings

| # | Title | Location |
|---|-------|----------|
| C1 | Room privilege escalation via client-controlled `userId` | `backend/src/room/room.controller.ts`, `backend/src/room/room.service.ts`
| C2 | Chat message spoofing & persistence trust client payload | `backend/src/chat/chat.gateway.ts`, `backend/src/chat/chat.service.ts`
| C3 | Historic and chat APIs expose private data without authentication | `backend/src/historic/historic.controller.ts`, `backend/src/chat/chat.controller.ts`
| C4 | WebSocket guard unusable; tokens never validated and crashes on connect | `backend/src/common/guards/ws.guard.ts`, `backend/src/chat/chat.gateway.ts`, `backend/src/utils/socket.ts`

### C1 — Room privilege escalation
- **Issue**: every protected room endpoint (`addAdmin`, `delAdmin`, `addBan`, `addMute`, `addUser`, `removeUser`, etc.) trusts the `userId` and `otherId` values coming from the request body (e.g. `addAdmin(@Body() dto: any)` -> `this.roomService.addAdmin(dto.roomId, dto.userId, dto.otherId)`). The service then calls helpers such as `isOwner(room, userId)` based on that untrusted `userId`. Attackers can send `{ userId: <roomOwnerId> }` to impersonate the owner and grant themselves admin/mod rights.
- **Impact**: full takeover of any chat room (add/remove admins, ban/mute anyone, invite themselves into private rooms). Data integrity and access control collapse.
- **Fix**: derive acting user ID from the JWT (`@GetCurrentUserId`) and never trust client-provided IDs for authorization decisions. Use DTOs with validation to ensure only target identifiers travel in the payload.

### C2 — Chat message spoofing & persistence trust client payload
- **Issue**: `ChatGateway.onMessage` accepts payload `{ user: User; room: Room; text }` from the client, then: `const user = await this.userService.findById(body.user.id); ... this.chatService.createMessage(body);`. There is no verification that `body.user.id` matches the authenticated socket. The Prisma `message` row is created using user/room IDs straight from the client.
- **Impact**: malicious clients can forge messages as any user, inject messages into rooms they do not belong to, or spam database with fabricated history. Combined with C1 this allows total impersonation.
- **Fix**: rely on the socket context (JWT claims) to resolve the user, ignore client-provided `user`, and verify the user actually belongs to the room before persisting.

### C3 — Historic & chat APIs publicly expose private data
- **Issue**: `HistoricController` has no guards. Any anonymous caller can hit `/api/historic`, `/api/historic/leaderboard`, `/api/historic/:id`, `/api/historic/ID` and fetch or create historic records. `ChatController.getUserMessages` is annotated `@Public()` and returns every message sent by `userId` with no checks.
- **Impact**: PII leakage (emails, match history, chat logs) to the public internet plus unauthenticated creation of history entries.
- **Fix**: protect every historic/chat endpoint with the JWT guard, and authorize per-user access (only self, friends, or admins should fetch data). Drop the public decorator.

### C4 — WebSocket guard unusable / authentication bypass
- **Issues**:
  1. `WsGuard` reads `context.args[0].handshake.auth.token.split(" ")[1]` without checking for undefined. The frontend never sends `handshake.auth.token`, so every connection throws and `return false`, breaking chat/game sockets.
  2. Even if a token arrived, it tries to fetch `decoded.id`, but the JWT payload only carries `sub`, so `findById(decoded.id)` resolves `undefined`, silently rejecting legitimate users.
  3. Because chat/game clients cannot pass the guard, most WebSocket handlers run without any user bound, forcing the gateways to trust arbitrary payloads (see C2).
- **Impact**: Chat/game sockets either fail entirely or run without auth, enabling session hijacking and DoS.
- **Fix**: send the JWT in the Socket.IO handshake (e.g. `io(url, { auth: { token: 'Bearer ...' } })`), null-check handshake data, read `decoded.sub`, and set `context.switchToWs().getClient().user` for downstream use.

## High findings

| # | Title | Location |
|---|-------|----------|
| H1 | `GameGateway` code is syntactically broken | `backend/src/game/game.gateway.ts`
| H2 | OAuth callback and JWT issuance store tokens in non-HTTP-only cookies | `backend/src/auth/auth.controller.ts`
| H3 | Plaintext credentials logged in auth service | `backend/src/auth/auth.service.ts`
| H4 | 2FA throttling logic never executes | `backend/src/tfa/twoFA.service.ts`
| H5 | Frontend websocket URLs lack protocol; HTTPS mixed-content failures | `frontend/src/utils/helper.ts`, `frontend/src/utils/socket.ts`, `frontend/src/utils/gameSocket.ts`

### H1 — `GameGateway` cannot compile
- Typo `import { WsG~uard }` plus a stray `import { Logger, UseGuards } ...` inside `handleDisconnecting`. TypeScript fails to transpile, so the entire Nest app crashes before boot.

### H2 — Tokens set via JavaScript-accessible cookies
- OAuth callback stores `access_token`, `refresh_token`, `userId` cookies without `httpOnly`, `secure`, or `sameSite` flags. Any XSS steals long-lived JWTs.

### H3 — Credentials logged
- `AuthService.signupLocal` and `signinLocal` call `this.logger.debug` with email and password arguments, emitting secrets to stdout/log aggregation.

### H4 — 2FA throttling ineffective
- `authenticateApi` comments out the limit enforcement, so unlimited guesses are allowed. Additionally, `removeAttempts` divides by 1000/60 due to missing parentheses and never purges attempts, and the endpoint is only callable **after** a successful JWT login, defeating the purpose of 2FA.

### H5 — Websocket helpers build invalid URLs
- `server.chatUrl = new URL(location.href).hostname + ":8082"` (no scheme). The Socket.IO client falls back to relative URLs, which break behind HTTPS/CDN and prevent secure websockets from establishing.

## Medium findings

| # | Title | Location |
|---|-------|----------|
| M1 | Numerous controllers expose CORS-wide headers and skip DTO validation | multiple controllers
| M2 | `router.beforeEach` mutates auth state using blocking prompts and leaks tokens into Vuex | `frontend/src/router/index.ts`, `frontend/src/store/index.ts`
| M3 | Vuex store mutations contain logic bugs (blocked list, room deletion) | `frontend/src/store/index.ts`
| M4 | `server.nestUrl` hardcodes `http://` even when app served via HTTPS | `frontend/src/utils/helper.ts`
| M5 | Axios POSTs claim form encoding but send JSON | e.g. `frontend/src/components/SignIn.vue`

## Low / informational
- Excessive `console.log`/`console.error` statements leak user data in production (`backend/src/historic/historic.service.ts`, `frontend` components).
- Missing DTO validation across controllers invites malformed payloads.
- `UserModule` does not export `UserService`, so other modules re-provide it (risking duplicate instances).
- `SignIn`/`SignUp` responses are never persisted (no refresh flow), so reloads drop session.

## Recommendations & next steps
1. **Lock down authorization**: refactor every controller/service to trust the authenticated principal (JWT) instead of body fields. Introduce DTOs + class-validator to enforce allowed properties.
2. **Fix WebSockets**: repair `GameGateway` syntax, send tokens during Socket.IO handshake, and use the decoded subject for user lookups. After the guard runs, pull the user from the context instead of the client payload.
3. **Secure REST endpoints**: remove `@Public` from chat/historic routes, add `@UseGuards(AtGuard)` everywhere, and implement per-user authorization filters.
4. **Harden credential handling**: drop debug logging of credentials, issue `httpOnly; Secure; SameSite=Strict` cookies, and avoid storing tokens in plain Vuex state.
5. **Restore 2FA enforcement**: re-enable attempt counting, fix the interval math, and demand 2FA before granting JWTs (e.g., staged login).
6. **Front-end reliability**: build websocket URLs with `window.location.protocol`, persist tokens securely (e.g., httpOnly cookies only), and correct Vuex mutation bugs.
7. **Testing**: add regression tests for authorization boundaries, websocket auth, and store mutations to avoid future regressions.

## Remediation log
- **2025-11-17** — Room controller/service endpoints now derive the acting user from `@GetCurrentUserId`, reject mismatched private-room lookups, and ignore client-supplied `userId`. DTOs were hardened to validate payloads before reaching the service layer, mitigating the privilege-escalation vector described in C1.
- **2025-11-17** — Added Jest regression tests (`backend/src/room/room.controller.spec.ts`) asserting that privileged room endpoints honor the authenticated principal and enforce the new validation paths.
- **2025-11-18** — Chat gateway/service now resolve the sender from the authenticated Socket.IO context, validate room membership/mute state, and persist messages through hardened DTOs. This closes the spoofing/persistence risk noted in C2.
- **2025-11-18** — Historic and chat REST controllers are back under `AtGuard`, enforce per-user access, and use typed DTOs (`CreateHistoricDto`) so unauthenticated callers can no longer read/write PII (C3). Companion Jest specs cover the new authorization paths.
- **2025-11-18** — WebSocket guard, gateways, and Vue socket helpers were refactored to pass JWTs via the handshake, verify `sub`, and stash the resolved user on `client.data.user`. Chat/game gateways now consume that server-side identity, and automated tests (`ws.guard.spec.ts`, `chat.gateway.spec.ts`) prevent regressions in C4.
