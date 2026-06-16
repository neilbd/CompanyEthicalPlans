import { useEffect, useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { QuestionInput } from './components/QuestionInput';
import { ResponseDisplay } from './components/ResponseDisplay';
import { ErrorMessage } from './components/ErrorMessage';
import { AuthForm } from './components/AuthForm';
import { uploadFile, getAnalysis, getMe, logout } from './api/endpoints';
import type { ClaudeContentBlock, AuthUser } from './api/types';

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ClaudeContentBlock[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Restore the session on load.
  useEffect(() => {
    getMe()
      .then(setUser)
      .finally(() => setAuthChecked(true));
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setResponse(null);
    setSelectedFile(null);
    setQuestion('');
  };

  const handleSubmit = async () => {
    if (!selectedFile || !question.trim()) {
      setError('Please select a file and enter a question');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Step 1: Upload the file
      const filePath = await uploadFile(selectedFile);

      // Step 2: Get analysis
      const analysisResponse = await getAnalysis(filePath, question);

      setResponse(analysisResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = !selectedFile || !question.trim() || isLoading;

  // Wait for the initial session check before deciding what to render.
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthenticated={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-end mb-2">
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out ({user.email})
            </button>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Document Analysis
            </h1>
            <p className="text-gray-600">
              Upload a document and ask questions to get AI-powered insights
            </p>
          </div>

          <div className="space-y-6">
            <FileUpload
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              error={error || undefined}
              onError={setError}
            />

            <QuestionInput
              value={question}
              onChange={setQuestion}
              disabled={isLoading}
            />

            {error && (
              <ErrorMessage message={error} onDismiss={() => setError(null)} />
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors
                ${isSubmitDisabled
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Document'}
            </button>

            {(response || isLoading) && (
              <ResponseDisplay response={response} isLoading={isLoading} />
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Powered by Claude AI • Supports PDF, DOC, TXT, CSV, and images</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
