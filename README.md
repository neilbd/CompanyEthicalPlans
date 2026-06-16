## Information

This codebase will analyze documents and a question from a user using the Anthropic API. The response is an output of Anthropic's description of the document. This was written with Claude.

The application consists of:
- **Backend API** (Express + TypeScript) - Handles file uploads and document analysis via Anthropic's Claude API
- **Frontend** (React + Vite + TypeScript) - User-friendly interface for uploading documents and viewing AI-powered analysis

## Requirements

- **Node.js**: Version 24.13.1 or higher (specified in `.nvmrc`)
- **npm**: Version 10.0.0 or higher
- **Anthropic API Key**: Required for document analysis (Anthropic-only; no other LLM providers)

## AI Model Policy

This project is **Anthropic-only**:

- **Backend**: All document analysis uses the Anthropic Messages API via `@anthropic-ai/sdk`. There is no OpenAI, Google, or other LLM integration.
- **Cursor IDE**: Use Claude models only when working in this repo. See [`.cursor/rules/anthropic-models.mdc`](.cursor/rules/anthropic-models.mdc) for project guidance.

### Supported `CLAUDE_VERSION` values

Set one of these in `Code/API/.env` (check [Anthropic's model docs](https://docs.anthropic.com/en/docs/about-claude/models) for the latest IDs):

| Model | Example `CLAUDE_VERSION` |
|-------|--------------------------|
| Claude Sonnet 4 | `claude-sonnet-4-20250514` |
| Claude Opus 4 | `claude-opus-4-20250514` |
| Claude 3.5 Sonnet | `claude-3-5-sonnet-20241022` |

Restart the API after changing `CLAUDE_VERSION`.

### Cursor setup (Anthropic-only)

1. Open **Cursor Settings → Models**
2. Disable **Composer**, **GPT**, **Gemini**, **Grok**, and any non-Claude models
3. Enable only Claude variants you want (e.g. Claude Sonnet 4.6, Claude Opus 4.x)
4. Avoid **Auto** and **Premium** — they may route to non-Anthropic models
5. In **Models → API Keys**, disable OpenAI and other non-Anthropic keys; enable Anthropic only if using BYOK
6. Restart Cursor after changing API keys

Default Claude models are configured in [`.vscode/settings.json`](.vscode/settings.json) for this workspace.

## Setup

### 1. Install Dependencies

#### Backend
```bash
cd Code/API
npm install
```

#### Frontend
```bash
cd Code/Frontend
npm install
```

### 2. Configure Backend Environment

1. Obtain an Anthropic API Key (you will need to pay $5 to start using the key)
2. Save the key in a secure location
3. Copy `.env.example` to `.env` at `Code/API` and set your values:

```bash
cd Code/API
cp .env.example .env   # Windows: copy .env.example .env
```

```env
NODE_ENV=development
PORT=3000
CLAUDE_VERSION=claude-sonnet-4-20250514
ANTHROPIC_API_KEY=<your-api-key-here>
MAX_TOKENS=1024
```

**Required variables:** `ANTHROPIC_API_KEY` and `CLAUDE_VERSION` must be set or the server will exit at startup. The legacy name `ANTHROPIC_KEY_TOKEN` is still accepted for backward compatibility.

### 3. Configure Frontend Environment (Optional)

The frontend is pre-configured to connect to `http://localhost:3000`. If you need to change this:

1. Check `Code/Frontend/.env.development`:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_VERSION=v1
```

## Run Application

### Start Backend API

```bash
cd Code/API
npm run dev
```

The API server will start at `http://localhost:3000`

**Available API Endpoints:**
- `GET /health` - Health check
- `POST /api/v1/users/upload` - Upload a document
- `POST /api/v1/users/getanalysis` - Analyze a document

### Start Frontend Application

```bash
cd Code/Frontend
npm run dev
```

The frontend will start at `http://localhost:5173`

Open your browser and navigate to `http://localhost:5173` to use the application.

### Build for Production

#### Backend
```bash
cd Code/API
npm run build
npm start
```

#### Frontend
```bash
cd Code/Frontend
npm run build
npm run preview
```

## Using the Application

1. Open `http://localhost:5173` in your browser
2. Drag and drop a document (PDF, TXT, CSV, DOC, DOCX, or images) or click to select a file
3. Enter your question about the document
4. Click "Analyze Document" to get AI-powered insights
5. View the markdown-formatted response from Claude AI

**Supported File Types:**
- PDF documents (.pdf)
- Text files (.txt)
- CSV files (.csv)
- Word documents (.doc, .docx)
- Images (.jpg, .jpeg, .png, .gif, .webp)

**File Size Limit:** 10MB

## Project Structure

```
Code/
├── API/                    # Backend Express API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utilities (document processor)
│   │   └── server.ts      # Main server file
│   └── uploads/           # Temporary file storage
│
└── Frontend/              # React Frontend
    ├── src/
    │   ├── components/    # React components
    │   ├── api/          # API client and types
    │   └── utils/        # Utility functions
    └── dist/             # Production build output
```

## Next Steps

- Add additional error handling and validation
- Add system prompts to guide the analysis from Anthropic's API
- Add support for analyzing multiple documents at once
- Improve response streaming for large documents