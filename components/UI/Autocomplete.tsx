import React, { useState, useEffect, useRef } from 'react';

interface AutocompleteProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  icon,
  required
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Filter options based on input value
    if (value) {
      const lower = value.toLowerCase();
      // Simple fuzzy match: contains
      const filtered = options.filter(opt => opt.toLowerCase().includes(lower));
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [value, options]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleFocus = () => {
    setIsOpen(true);
    // Reset filter on focus if empty or just show all
    if (!value) setFilteredOptions(options);
  };

  return (
    <div className="group relative" ref={wrapperRef}>
      <label className={`block text-sm font-bold mb-2 transition-colors flex items-center gap-2 ${error ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300 group-focus-within:text-indigo-500'}`}>
        {icon && <span className="opacity-70 group-focus-within:opacity-100 transition-opacity shrink-0">{icon}</span>}
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
              onChange(e.target.value);
              setIsOpen(true);
          }}
          onFocus={handleFocus}
          className={`
            w-full p-3 md:p-4 bg-slate-50 dark:bg-surface-800/50 border rounded-xl 
            focus:bg-white dark:focus:bg-surface-800 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-400 
            transition-all outline-none shadow-sm text-sm md:text-base text-slate-700 dark:text-slate-100 placeholder-slate-400
            ${error ? 'border-red-300 ring-4 ring-red-50 dark:ring-red-900/20 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-surface-600'}
          `}
          placeholder={placeholder}
          autoComplete="off"
        />
        
        {/* Dropdown Arrow Indicator */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
           <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
           </svg>
        </div>

        {/* Dropdown List */}
        {isOpen && filteredOptions.length > 0 && (
          <ul className="absolute z-50 w-full bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-600 rounded-xl mt-1 max-h-60 overflow-y-auto shadow-xl animate-fade-in scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
            {filteredOptions.map((option, idx) => (
              <li 
                key={idx}
                onMouseDown={(e) => {
                    // Prevent input blur before click is registered
                    e.preventDefault(); 
                    handleSelect(option);
                }}
                className="px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer text-slate-700 dark:text-slate-200 text-sm border-b border-slate-50 dark:border-surface-700 last:border-none transition-colors flex items-center justify-between group/item"
              >
                <span>{option}</span>
                {value === option && (
                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                )}
              </li>
            ))}
          </ul>
        )}
        
        {isOpen && value && filteredOptions.length === 0 && (
             <div className="absolute z-50 w-full bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-600 rounded-xl mt-1 p-3 shadow-xl text-center text-xs text-slate-400 animate-fade-in">
                لا توجد نتائج مطابقة، سيتم استخدام القيمة المدخلة.
             </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1 mt-2 text-xs font-bold text-red-500 dark:text-red-400 animate-fade-in-up">
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default Autocomplete;