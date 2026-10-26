import 'react';

// React 18's types don't include the `fetchpriority` image attribute yet.
// This "module augmentation" adds it, so <img fetchpriority="high"> type-checks.
declare module 'react' {
  interface ImgHTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
}
