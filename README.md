## Information

This codebase will analyze documents and a question from a user using the Anthropic API. The response is an output of Anthropic's description of the document. This was written with Claude.

## Run Application

1. Obtain an Anthropic API Key (you will need to pay $5 so start usin the key).
2. Save the key in a secure location
3. Set up a `.env` file at `Code/API` to add additional environment variables.
```
NODE_ENV=development
PORT=3000
CLAUDE_VERSION=claude-sonnet-4-20250514
ANTHROPIC_API_KEY=<API key>
MAX_TOKENS=1024
```
4. Run the application by selecting `npm run dev`. Make API calls on `http://localhost:3000/api/v1/users/getanalysis`. Use a sample payload under `SampleRequests`.


## Next Steps
- Add additional error handling
- Add code for the frontend
- Add system prompts to guide the anaylsis from Anthropic's API
- Add database management for multiple users and their respective prompt history