import React from 'react';

export const Link: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  href = '#',
  children,
  className,
  onClick,
  ...props
}) => {
  return (
    <a href={href} className={className} onClick={onClick} {...props}>
      {children}
    </a>
  );
};

export default Link;
