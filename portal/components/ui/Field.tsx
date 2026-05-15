import * as React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
};

const Field = React.forwardRef<HTMLInputElement, Props>(function Field(
  { label, hint, error, containerClassName = '', className = '', id, ...rest },
  ref,
) {
  const inputId = id || rest.name;
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      <label htmlFor={inputId} className="text-[12.5px] font-extrabold tracking-tight text-ink-2">
        {label}
      </label>
      <input
        id={inputId}
        ref={ref}
        className={`input ${error ? 'border-red-400 focus:border-red-500' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={hint || error ? `${inputId}-help` : undefined}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-help`} className="text-[12px] font-semibold text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-help`} className="text-[11.5px] font-semibold text-ink-2/60">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Field;
