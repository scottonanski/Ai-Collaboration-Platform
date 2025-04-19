import { ButtonHTMLAttributes } from 'react';

declare module 'react' {
  interface ButtonHTMLAttributes<T> extends React.HTMLAttributes<T> {
    popovertarget?: string;
  }
}

export {};