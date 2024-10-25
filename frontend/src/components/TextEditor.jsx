import React, { useEffect, useRef } from 'react';

const TextEditor = React.forwardRef(({ InputOnChange, value, InputKeyDown }, ref) => {
  const textareaRef = ref || useRef(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 320);
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <div className="w-full">
      <textarea
        ref={textareaRef}
        onKeyDown={InputKeyDown}
        autoFocus={true}
        value={value}
        onChange={InputOnChange}
        placeholder="Type here..."
        className="border-2 border-gray-300 rounded-md w-full px-3 py-2 text-gray-800 bg-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
        style={{ minHeight: '60px', maxHeight: '300px' }}
      />
    </div>
  );
});

export default TextEditor;
