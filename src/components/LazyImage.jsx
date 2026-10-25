import { useState } from 'react';
import placeholder from '../assets/placeholder.svg';

function LazyImageInner({ src, alt, className = '', imgClassName = '', ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const finalSrc = !src || failed ? placeholder : src;

  return (
    <div className={`relative overflow-hidden bg-surface-card ${className}`}>
      {!loaded && <div className="skeleton absolute inset-0 rounded-none" aria-hidden="true" />}
      <img
        src={finalSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
        {...rest}
      />
    </div>
  );
}

// Re-mount when the source changes so the loaded/failed state always starts fresh.
export default function LazyImage(props) {
  return <LazyImageInner key={props.src || 'no-image'} {...props} />;
}
