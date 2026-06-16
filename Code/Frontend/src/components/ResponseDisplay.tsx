import type { ClaudeContentBlock } from '../api/types';
import ReactMarkdown from 'react-markdown';

interface ResponseDisplayProps {
  response: ClaudeContentBlock[] | null;
  isLoading: boolean;
}

export const ResponseDisplay = ({ response, isLoading }: ResponseDisplayProps) => {
  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-3">Analyzing document...</p>
      </div>
    );
  }

  if (!response) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Analysis Result</h3>
      <div className="space-y-4">
        {response.map((block, index) => {
          if (block.type === 'text') {
            return (
              <div key={index} className="prose prose-slate max-w-none">
                <ReactMarkdown>{block.text}</ReactMarkdown>
              </div>
            );
          }
          if (block.type === 'image') {
            return (
              <div key={index} className="flex justify-center">
                <img
                  src={`data:${block.source.media_type};base64,${block.source.data}`}
                  alt={`Response image ${index + 1}`}
                  className="max-w-full h-auto rounded-lg shadow-md"
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};
