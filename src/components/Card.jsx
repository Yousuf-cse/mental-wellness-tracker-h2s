import React from 'react'

export default function Card({
  variant = 'white', // 'white', 'primary-container', 'secondary-container', 'tertiary-container', 'error-container', 'gray'
  hoverable = false,
  className = '',
  children,
  onClick,
  ...props
}) {
  const baseStyles = 'brutalist-border brutalist-shadow rounded-2xl p-6 transition-all'
  
  const hoverStyles = hoverable ? 'brutalist-card-hover cursor-pointer' : ''

  const variantStyles = {
    white: 'bg-white text-on-background',
    'primary-container': 'bg-primary-container text-on-primary-container',
    'secondary-container': 'bg-secondary-container text-on-secondary-container',
    'tertiary-container': 'bg-tertiary-container text-on-tertiary-container',
    'error-container': 'bg-error-container text-on-error-container',
    gray: 'bg-surface-container-low text-on-background',
  }

  const selectedVariant = variantStyles[variant] || variantStyles.white

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${selectedVariant} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
