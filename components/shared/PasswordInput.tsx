'use client';

import React, { useState, forwardRef } from 'react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showLeftIcon?: boolean;
  leftIcon?: React.ReactNode;
  wrapperClassName?: string;
  iconClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      showLeftIcon = true,
      leftIcon,
      className = '',
      wrapperClassName = '',
      iconClassName = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsVisible((prev) => !prev);
    };

    return (
      <div className={`relative ${wrapperClassName}`}>
        {showLeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none flex items-center justify-center">
            {leftIcon || <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />}
          </div>
        )}
        <input
          ref={ref}
          type={isVisible ? 'text' : 'password'}
          disabled={disabled}
          className={`${showLeftIcon ? 'pl-10' : 'pl-3.5'} pr-10 ${className}`}
          {...props}
        />
        <button
          type="button"
          tabIndex={0}
          disabled={disabled}
          onClick={toggleVisibility}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          title={isVisible ? 'Hide password' : 'Show password'}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink transition-colors rounded focus:outline-none focus:ring-2 focus:ring-brand-forest disabled:opacity-50 cursor-pointer ${iconClassName}`}
        >
          {isVisible ? (
            <EyeOff className="w-4 h-4 shrink-0" aria-hidden="true" />
          ) : (
            <Eye className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
