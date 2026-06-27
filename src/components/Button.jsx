import React from 'react'

export default function Button({
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  variant = 'white', // 'primary', 'secondary', 'tertiary', 'outline', 'danger', 'white', 'primary-container'
  className = '',
  children,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-headline font-semibold text-sm brutalist-border brutalist-shadow brutalist-button px-6 py-2.5 transition-all select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
  
  const variantStyles = {
    white: 'bg-white hover:bg-surface-container text-on-background',
    primary: 'bg-primary hover:bg-[#1a4f3e] text-white',
    'primary-container': 'bg-primary-container hover:bg-[#91dec0] text-on-primary-container',
    secondary: 'bg-secondary hover:bg-[#484956] text-white',
    'secondary-container': 'bg-secondary-container hover:bg-[#ced0eb] text-on-secondary-container',
    tertiary: 'bg-tertiary hover:bg-[#5f4832] text-white',
    'tertiary-container': 'bg-tertiary-container hover:bg-[#f6cdab] text-on-tertiary-container',
    danger: 'bg-error hover:bg-[#9f1616] text-white',
    'danger-container': 'bg-error-container hover:bg-[#ffc3bd] text-on-error-container',
    outline: 'bg-transparent hover:bg-surface-container text-on-background',
  }

  const selectedVariant = variantStyles[variant] || variantStyles.white

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${selectedVariant} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
}
