import { ContentBlock } from '@anthropic-ai/sdk/resources/messages';

// Join the text blocks of a Claude response into a single string for storage.
export const extractText = (content: ContentBlock[]): string =>
  content
    .filter((block): block is Extract<ContentBlock, { type: 'text' }> => block.type === 'text')
    .map((block) => block.text)
    .join('\n\n');
