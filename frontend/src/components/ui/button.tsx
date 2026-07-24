import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
};

export function Button({ className = '', variant = 'secondary', ...props }: ButtonProps) {
  return <button className={`button button-${variant} ${className}`} type="button" {...props} />;
}
