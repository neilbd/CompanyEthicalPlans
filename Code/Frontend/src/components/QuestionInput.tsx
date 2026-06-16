interface QuestionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const QuestionInput = ({ value, onChange, disabled }: QuestionInputProps) => {
  return (
    <div className="w-full">
      <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
        Your Question
      </label>
      <textarea
        id="question"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Enter your question about the document..."
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <p className="text-sm text-gray-500 mt-1">{value.length} characters</p>
    </div>
  );
};
