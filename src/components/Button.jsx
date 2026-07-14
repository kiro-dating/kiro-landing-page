import React from 'react';
import './Button.css';

export const Button = ({ variant = 'primary', as = 'button', className = '', children, ...props }) => {
  const Tag = as;
  return (
    <Tag className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </Tag>
  );
};
