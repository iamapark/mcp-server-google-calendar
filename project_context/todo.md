# MCP Google Calendar Agent - TODO List

This checklist tracks the development progress for the stdio-based MCP server that connects to Google Calendar, using OAuth 2.0 Device Flow for authentication.

## Phase 1: Setup & Core Modules

### 1. Project Setup & Basic Structure

- [ ] Initialize Node.js project (`npm init -y`)
- [ ] Install core dependencies:
  - [ ] `@modelcontextprotocol/sdk`
  - [ ] `googleapis`
  - [ ] `zod`
  - [ ] `date-fns` (or `dayjs`)
  - [ ] `dotenv`
  - [ ] `pino`
  - [ ] `axios`
- [ ] Install dev dependencies:
  - [ ] `@types/node`
  - [ ] `typescript`
  - [ ] `ts-node`
  - [ ] `nodemon`
  - [ ] `pino-pretty`
  - [ ] Testing framework (`jest`, `@types/jest` recommended)
- [ ] Configure `tsconfig.json` (target, module: CommonJS, outDir, rootDir, strict, etc.)
- [ ] Configure `package.json` scripts (build, start, dev)
- [ ] Create `src/logger.ts` and configure `pino` logger (dev/prod distinction)
- [ ] Set up `.gitignore` (add `node_modules/`, `dist/`, `.env`, `token.json`)
- [ ] (Optional) Write basic test for logger setup

### 2. Google Authentication Module (`src/googleAuth.ts`)

- [ ] Create `src/googleAuth.ts` file
- [ ] Import necessary modules (`googleapis`, `dotenv`, `fs/promises`, `axios`, logger)
- [ ] Load environment variables using `dotenv.config()`
- [ ] Define and configure module-level `OAuth2Client` instance (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` from `.env`)
- [ ] Define `TOKEN_PATH` constant (`'token.json'`)
- [ ] Implement `saveCredentialsToFile(creds)` async function (using `fs.writeFile`)
- [ ] Implement `loadCredentialsFromFile()` async function (using `fs.readFile`, JSON parsing, error handling for file not found/invalid JSON)
- [ ] Implement `startDeviceFlow(logger)` async function:
  - [ ] Makes POST request to `https://oauth2.googleapis.com/device/code` using `axios`
  - [ ] Passes `client_id` and `scope`
  - [ ] Returns `{ device_code, user_code, verification_url, interval, expires_in }` on success
  - [ ] Handles and logs errors appropriately
- [ ] Implement `pollForTokens(device_code, interval, expires_in, logger)` async function:
  - [ ] Polls `https://oauth2.googleapis.com/token` endpoint at `interval`
  - [ ] Passes `client_id`, `client_secret`, `device_code`, `grant_type`
  - [ ] Handles `authorization_pending` response (continue polling)
  - [ ] Handles `slow_down` response (increase interval and continue)
  - [ ] Handles `access_denied`, `expired_token`, other errors (stop polling, throw error)
  - [ ] Handles success (returns token object)
  - [ ] Implements timeout logic based on `expires_in`
  - [ ] Calls `saveCredentialsToFile(tokens)` on successful token retrieval
- [ ] Implement `initializeAuthClient(logger)` async function:
  - [ ] Calls `loadCredentialsFromFile()`
  - [ ] If tokens loaded, calls `oAuth2Client.setCredentials(tokens)`
  - [ ] Sets up `oAuth2Client.on('tokens', ...)` listener to automatically save refreshed tokens (using `saveCredentialsToFile`)
- [ ] Implement `getAuthenticatedClient()` function:
  - [ ] Checks if `oAuth2Client.credentials.access_token` is valid/present
  - [ ] Returns `oAuth2Client` if valid, `null` otherwise
- [ ] Write Unit Tests for `googleAuth.ts`:
  - [ ] Test `saveCredentialsToFile` (mock fs)
  - [ ] Test `loadCredentialsFromFile` (mock fs, test file exists/not exists/invalid cases)
  - [ ] Test `startDeviceFlow` (mock axios)
  - [ ] Test `pollForTokens` (mock axios, test pending, slow_down, success, denied, expired scenarios, test timing logic)
  - [ ] Test `initializeAuthClient` (mock load/save, test listener setup)
  - [ ] Test `getAuthenticatedClient` (test token present/absent cases)

### 3. Google Calendar Service Module (`src/calendarService.ts`)

- [ ] Create `src/calendarService.ts` file
- [ ] Implement `createGoogleCalendarEvent(authClient, eventDetails, logger)` async function:
  - [ ] Parse `eventDetails.startTime` (string 'YYYY-MM-DD HH:mm') into Date object
  - [ ] Parse `eventDetails.duration` (string minutes) into number
  - [ ] Calculate `endTime` Date object
  - [ ] Format `startTime` and `endTime` into RFC3339 strings with timezone (e.g., 'Asia/Seoul', '+09:00')
  - [ ] Construct the event resource object for the API call
  - [ ] Initialize `google.calendar('v3')` API client
  - [ ] Call `calendar.events.insert({ calendarId: 'primary', resource: event })` within a try/catch block
  - [ ] Log success/failure
  - [ ] Return relevant event data (e.g., `{ id, htmlLink }`) on success
  - [ ] Throw specific error on failure
- [ ] Write Unit Tests for `calendarService.ts`:
  - [ ] Test date/time parsing and calculation logic
  - [ ] Test RFC3339 formatting with timezone
  - [ ] Test `events.insert` call with mocked `googleapis` (verify arguments)
  - [ ] Test success path (return value)
  - [ ] Test error path (thrown error)

## Phase 2: MCP Server & Tool Implementation

### 4. Main Application (`src/main.ts`)

- [ ] Create `src/main.ts` file
- [ ] Import necessary modules (`McpServer`, `StdioServerTransport`, `z`, logger, auth functions, calendar functions)
- [ ] Define `addCalendarEventParamsSchema` using `zod` (with `.describe()` for LLM hints)
- [ ] Define main `async function run()`
- [ ] Inside `run()`: Get logger instance
- [ ] Inside `run()`: Call `await initializeAuthClient(logger)` **before** creating `McpServer`
- [ ] Inside `run()`: Create `McpServer` instance (provide `name`, `version`)
- [ ] Inside `run()`: Define `googleAuthLogin` tool using `server.tool()`:
  - [ ] Use `z.object({})` for empty parameters
  - [ ] Handler calls `startDeviceFlow`
  - [ ] Handler formats and prints user instructions (URL, code) directly to `process.stdout`
  - [ ] Handler calls `pollForTokens`
  - [ ] Handler calls `getAuthenticatedClient()?.setCredentials(tokens)` upon success
  - [ ] Handler returns success MCP response (`{ content: [...] }`)
  - [ ] Handler throws `Error` on failure, logging details
- [ ] Inside `run()`: Define `addCalendarEvent` tool using `server.tool()`:
  - [ ] Use `addCalendarEventParamsSchema`
  - [ ] Handler calls `getAuthenticatedClient()`
  - [ ] Handler checks `authClient`: throws descriptive `Error` if null (mentioning `googleAuthLogin` tool)
  - [ ] Handler calls `createGoogleCalendarEvent` in a try/catch block
  - [ ] Handler returns success MCP response (`{ content: [...] }` including event link/details)
  - [ ] Handler throws `Error` on failure, logging details
- [ ] Inside `run()`: Create `StdioServerTransport` instance
- [ ] Inside `run()`: Log "Server starting..." message
- [ ] Inside `run()`: Call `await server.connect(transport)`
- [ ] Add global error handler: Call `run().catch(error => { logger.fatal({ err: error }, 'Unhandled error') })` at the end of the file
- [ ] Write Unit Tests for Tool Handlers:
  - [ ] Test `googleAuthLogin` handler logic (mock auth functions, check stdout output if possible, check success/error paths)
  - [ ] Test `addCalendarEvent` handler logic (mock auth and calendar functions, test authenticated/unauthenticated paths, test success/error paths)
- [ ] (Stretch Goal) Implement Integration Tests:
  - [ ] Create test script to run `main.ts` as child process
  - [ ] Send MCP JSON requests via stdin
  - [ ] Assert MCP JSON responses/errors via stdout
  - [ ] Simulate `token.json` presence/absence for auth checks

## Phase 3: Documentation & Final Polish

### 5. Documentation (README.md)

- [ ] Write clear project purpose and features
- [ ] Provide installation steps (`npm install`)
- [ ] Detail prerequisite Google Cloud Console setup (link to guide recommended)
- [ ] Explain `.env` file creation and required variables (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- [ ] **Crucially:** Explain the two-step usage:
  - [ ] Step 1: Running the `googleAuthLogin` tool first
  - [ ] Describe the Device Flow process from the user's perspective (opening URL, entering code)
  - [ ] Step 2: Running the `addCalendarEvent` tool afterwards
- [ ] Provide clear execution instructions (`npm run build && npm start`, `npm run dev`)
- [ ] Include example LLM prompts for both `googleAuthLogin` and `addCalendarEvent`

### 6. Final Code Review & Cleanup

- [ ] Review all source code for clarity, consistency, and best practices
- [ ] Ensure all `console.log` statements are replaced with `pino` logger calls
- [ ] Verify log messages are informative and structured
- [ ] Check error handling robustness and user-friendliness of error messages (especially those potentially surfaced by the LLM)
- [ ] Confirm Device Flow instructions printed to stdout are clear and accurate
- [ ] Double-check `.gitignore` to prevent committing sensitive files (`.env`, `token.json`)
- [ ] Remove any commented-out code or unused variables/imports
- [ ] Consider adding basic JSDoc comments to public functions/modules
