# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Document analysis application that uses Anthropic's Claude API to analyze uploaded documents (PDFs, images, text files) and answer questions about them. The application consists of a TypeScript/Express backend API and a React frontend with a user-friendly drag-and-drop interface.

## Technology Stack

### Backend
- Node.js 24.13.1+ (specified in `.nvmrc`)
- TypeScript 5.3+ targeting ES2024
- Express.js with comprehensive middleware
- Anthropic SDK for Claude API integration
- Multer for file upload handling

### Frontend
- React 19.2+ with TypeScript
- Vite 7.3+ for build tooling and dev server
- Tailwind CSS 4.1+ with PostCSS
- React Dropzone for file uploads
- React Markdown for formatted responses
- Axios for API communication

## Project Structure

```
Code/
├── API/                          # Backend Express server
│   ├── src/
│   │   ├── routes/              # API route handlers
│   │   │   ├── index.ts         # Main router
│   │   │   ├── claudeRoute.ts   # Document analysis endpoint
│   │   │   └── uploadRoute.ts   # File upload endpoint
│   │   ├── middleware/          # Express middleware
│   │   │   ├── errorHandler.ts  # Centralized error handling
│   │   │   ├── asyncHandler.ts  # Async error wrapper
│   │   │   └── notFound.ts      # 404 handler
│   │   ├── utils/               # Utilities
│   │   │   ├── documentProcessor.ts  # Claude API integration
│   │   │   ├── validateEnv.ts   # Environment validation
│   │   │   └── responses.ts     # Standard response helpers
│   │   ├── types/               # TypeScript type definitions
│   │   └── server.ts            # Express server setup
│   ├── uploads/                 # Temporary file storage
│   ├── .env                     # Environment variables (not in git)
│   └── package.json
│
└── Frontend/                    # React + Vite frontend
    ├── src/
    │   ├── components/          # React components
    │   │   ├── FileUpload.tsx   # Drag-drop file upload
    │   │   ├── QuestionInput.tsx # Question text input
    │   │   ├── ResponseDisplay.tsx # Markdown response viewer
    │   │   ├── ErrorMessage.tsx  # Error display
    │   │   └── LoadingSpinner.tsx # Loading state
    │   ├── api/                 # API client utilities
    │   │   ├── client.ts        # Axios client setup
    │   │   ├── endpoints.ts     # API endpoint functions
    │   │   └── types.ts         # API type definitions
    │   ├── utils/               # Frontend utilities
    │   │   ├── fileValidation.ts # File type/size validation
    │   │   └── constants.ts     # App constants
    │   ├── App.tsx              # Main application component
    │   └── main.tsx             # Application entry point
    ├── .env.development         # Development environment config
    ├── .nvmrc                   # Node version specification
    ├── postcss.config.js        # PostCSS configuration
    ├── tailwind.config.js       # Tailwind CSS configuration
    ├── vite.config.ts           # Vite configuration
    └── package.json
```

## Development Commands

### Backend (Code/API)

- **Start development server**: `npm run dev` (ts-node-dev with auto-restart)
- **Build**: `npm run build` (compiles TypeScript to dist/)
- **Start production**: `npm start` (runs compiled code from dist/)
- **Lint**: `npm run lint` or `npm run lint:fix`
- **Run tests**: `npm test`

### Frontend (Code/Frontend)

- **Start development server**: `npm run dev` (Vite dev server at http://localhost:5173)
- **Build**: `npm run build` (TypeScript check + Vite production build)
- **Preview production build**: `npm run preview`
- **Lint**: `npm run lint`

## Environment Setup

### Node.js Version

This project requires Node.js 24.13.1 or higher. The version is specified in:
- `Code/Frontend/.nvmrc` - For nvm users
- `Code/Frontend/package.json` - Engine requirement in package.json

### Backend Environment Variables

Create `.env` file at `Code/API/` (see `.env.example`):

```env
NODE_ENV=development
PORT=3000
CLAUDE_VERSION=claude-sonnet-4-20250514
ANTHROPIC_API_KEY=<your-api-key>
MAX_TOKENS=1024
ALLOWED_ORIGINS=http://localhost:5173

# Persistence (auth + analysis result storage)
MONGODB_URI=mongodb://localhost:27017/ethicalplans
SESSION_SECRET=<long-random-value>
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-aws-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-access-key>
S3_BUCKET_NAME=<your-s3-bucket-name>
```

**Important**: Use `ANTHROPIC_API_KEY` (not `ANTHROPIC_KEY_TOKEN`). This is the standard environment variable name. All vars above are validated on startup in `validateEnv.ts`.

**Local MongoDB**: run `docker compose up -d mongo` from `Code/API/` (see `docker-compose.yml`).

### Frontend Environment Variables

The frontend uses `.env.development` at `Code/Frontend/`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_VERSION=v1
```

These are pre-configured for local development. Vite automatically loads these with the `VITE_` prefix.

## Architecture Notes

### Backend API Endpoints

- **Health check**: `GET /health` - Returns server status and uptime
- **API info**: `GET /api/v1/` - Lists available endpoints
- **File upload**: `POST /api/v1/users/upload` - Uploads document (max 10MB)
  - Accepts: PDF, TXT, CSV, DOC/DOCX, JPEG, PNG, GIF, WebP
  - Returns: `{ success: true, data: { filePath: string }, message: string }`
- **Document analysis**: `POST /api/v1/users/getanalysis` - Analyzes uploaded document (**requires auth**)
  - Body: `{ filePath: string, question: string }`
  - Returns: `{ success: true, data: ClaudeContentBlock[], timestamp: string }`
  - On success, the result text is persisted for the user (see Result Persistence below)
- **Auth**: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`
  - Email/password with session cookies (sessions stored in MongoDB via `connect-mongo`)
  - `upload` and `getanalysis` require an authenticated session (`requireAuth` middleware)

### Result Persistence (MongoDB + S3)

After a successful analysis, `claudeRoute` calls `ResultStore.save()`
(`src/services/resultStore.ts`):

1. Inserts a minimal `Analysis` outbox doc (`userId`, `status`, `attempts`,
   `resultText`, `s3Key`, `createdAt`) with `status: 'pending'`.
2. Uploads the analysis text to S3 (`analyses/{userId}/{id}.txt`) with exponential
   backoff (`async-retry`), **without blocking the user's response**.
3. On success → `status: 'done'`, sets `s3Key`, clears `resultText`. On failure →
   bumps `attempts`, stays `pending` (or `failed` after `MAX_ATTEMPTS`).

A background sweeper (`startSweeper`, started in `server.ts`) periodically retries any
`pending` docs, making persistence durable across crashes. Persistence is best-effort:
it never fails or blocks the analysis request.

### Document Processing Flow

1. User drags/drops file in frontend (validated client-side)
2. Frontend uploads file to `/api/v1/users/upload` → receives `filePath`
3. Frontend sends `filePath` + `question` to `/api/v1/users/getanalysis`
4. Backend `DocumentProcessor`:
   - **Text files (.txt, .csv)**: Reads as UTF-8 text, sends directly to Claude
   - **PDFs/Images**: Converts to base64, sends as document/image type
5. Claude API analyzes content and returns response
6. Frontend displays response with markdown formatting

### DocumentProcessor Implementation

**Important**: The processor handles different file types differently:

```typescript
// Text files - sent as plain text content
if (mediaType === 'text/plain' || mediaType === 'text/csv') {
  content = [{
    type: 'text',
    text: `Here is the document content:\n\n${textContent}\n\nQuestion: ${question}`
  }];
}

// PDFs and images - sent as base64 encoded
else {
  content = [{
    type: contentType, // 'document' or 'image'
    source: {
      type: 'base64',
      media_type: mediaType,
      data: base64Data
    }
  }, {
    type: 'text',
    text: question
  }];
}
```

This approach:
- Reduces token usage for text files
- Avoids API errors (Claude expects PDFs for document type, not text)
- Handles images and PDFs using base64 encoding

### Key Middleware & Security

- **Rate limiting**: 100 requests per 15 minutes per IP (express-rate-limit)
- **Security headers**: Helmet middleware for common security headers
- **CORS**: Enabled for cross-origin requests
- **Request compression**: Gzip compression for responses
- **Request logging**: Morgan for HTTP request logging
- **Error handling**: Centralized error handler with custom `AppError` class
- **Async wrapper**: `asyncHandler` wraps routes to catch async errors
- **File validation**: Type and size validation on both client and server

### File Upload Details

- **Storage location**: `Code/API/uploads/` directory
- **Filename format**: `{timestamp}-{random}-{originalname}`
- **Max file size**: 10MB (enforced by multer and frontend)
- **Path normalization**: Converts backslashes to forward slashes for cross-platform compatibility
- **Allowed types**:
  - Documents: PDF, TXT, CSV, DOC, DOCX
  - Images: JPEG, PNG, GIF, WebP

### TypeScript Configuration

#### Backend (ES2024, CommonJS output)
- Target: ES2024 (leverages Node.js 24 features)
- Module: CommonJS (for Node.js compatibility)
- Strict mode enabled with full type checking
- Output: `dist/` directory

#### Frontend (ES2024, ES modules)
- Target: ES2024 (modern browser features)
- Module: ESNext
- `verbatimModuleSyntax: true` - Requires type-only imports
- Two configs: `tsconfig.app.json` (app code) and `tsconfig.node.json` (Vite config)

**Important**: When importing types, use `import type { ... }` syntax due to `verbatimModuleSyntax`.

### Frontend Architecture

#### Component Structure
- **App.tsx**: Main component managing state and orchestrating uploads/analysis
- **FileUpload.tsx**: React Dropzone integration with drag-and-drop
- **QuestionInput.tsx**: Textarea for user questions
- **ResponseDisplay.tsx**: Renders Claude's response with markdown support
- **ErrorMessage.tsx**: Dismissible error alerts
- **LoadingSpinner.tsx**: Loading state indicator

#### API Client
- **client.ts**: Axios instance with base URL, timeout, and interceptors
- **endpoints.ts**: Type-safe API endpoint functions
- **types.ts**: TypeScript interfaces for API requests/responses

#### Styling
- **Tailwind CSS 4.1+** with `@tailwindcss/postcss` plugin
- Responsive design with mobile-first approach
- Prose classes for markdown content styling
- Custom color scheme: blue primary, gray neutrals

#### Markdown Support
- **react-markdown** renders Claude's responses
- Supports: bold, italic, lists, code blocks, links, headings
- Styled with Tailwind's `prose` classes

## Testing

### Backend API Testing

Upload a file and analyze it:

```bash
# 1. Upload file
curl -X POST -F "file=@sample.txt" http://localhost:3000/api/v1/users/upload

# 2. Analyze (replace filePath with value from step 1)
curl -X POST http://localhost:3000/api/v1/users/getanalysis \
  -H "Content-Type: application/json" \
  -d '{"filePath":"C:/path/to/uploads/file.txt","question":"Summarize this document"}'
```

### Frontend Testing

1. Start both backend and frontend servers
2. Navigate to http://localhost:5173
3. Drag and drop a file (or click to select)
4. Enter a question about the document
5. Click "Analyze Document"
6. View the markdown-formatted response

## Common Development Tasks

### Adding a New API Endpoint

1. Create route handler in `Code/API/src/routes/`
2. Import and register in `Code/API/src/routes/index.ts`
3. Add types to `Code/API/src/types/`
4. Create frontend endpoint function in `Code/Frontend/src/api/endpoints.ts`
5. Add TypeScript interfaces in `Code/Frontend/src/api/types.ts`

### Adding a New File Type

1. Update allowed types in `Code/API/src/routes/uploadRoute.ts` (multer config)
2. Update `Code/Frontend/src/utils/constants.ts` (ALLOWED_TYPES and ALLOWED_EXTENSIONS)
3. Update `Code/Frontend/src/components/FileUpload.tsx` (accept prop)
4. Update `Code/API/src/utils/documentProcessor.ts` (media type mapping and handling)

### Modifying Styles

- Global styles: `Code/Frontend/src/index.css`
- Component styles: Use Tailwind classes in component files
- Tailwind config: `Code/Frontend/tailwind.config.js`
- PostCSS plugins: `Code/Frontend/postcss.config.js`

## Known Issues & TODOs

1. ✅ ~~Environment variable inconsistency~~ - Fixed: Uses `ANTHROPIC_API_KEY` consistently
2. ✅ ~~Frontend integration~~ - Completed with full React UI
3. Missing error handling for file cleanup after processing
4. ✅ ~~No database for user management~~ - MongoDB added (users + analysis metadata). Prompt history UI still planned.
5. System prompts for guiding analysis not yet implemented
6. No streaming support for large documents (responses come all at once)
7. Uploaded files are not automatically deleted (accumulate in uploads/)
8. ✅ ~~No user authentication/authorization~~ - Email/password + session cookies added
9. No support for multiple document analysis in single request
10. No history-browsing UI yet (results are persisted to S3 but not surfaced back to users)
11. Result-persistence sweeper assumes a single server instance (no multi-instance locking)

## Best Practices When Modifying

1. **TypeScript**: Always use proper types, avoid `any` except where necessary (e.g., Anthropic SDK types)
2. **Error Handling**: Use `AppError` for operational errors, include status codes
3. **Environment Variables**: Never commit `.env` files, always validate in `validateEnv.ts`
4. **File Validation**: Validate on both frontend and backend for security
5. **API Responses**: Use `sendSuccess` helper for consistent response format
6. **React State**: Keep state in App.tsx, pass down as props
7. **Imports**: Use type-only imports for types: `import type { Type } from '...'`
8. **Unused Parameters**: Prefix with underscore: `_req`, `_res` for ESLint compliance
9. **Node Version**: Ensure compatibility with Node.js 24+ features (ES2024)

## Deployment Considerations

1. Set `NODE_ENV=production` in production environment
2. Use production-grade process manager (PM2, systemd)
3. Set up proper logging (consider replacing console.log)
4. Configure proper CORS origins (don't use wildcard in production)
5. Set up file cleanup cron job for uploads directory
6. Consider CDN for frontend static assets
7. Set appropriate rate limits for production traffic
8. Enable HTTPS/TLS for API and frontend
9. Store Anthropic API key securely (environment variable, secrets manager)

## Documentation
- Write or update main scenarios in .claude/docs/business-scenarios.md
- Write or update technological design decisions and why they were made in .claude/docs/technological-design.md
