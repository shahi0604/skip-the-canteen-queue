import { useEffect, useState } from 'react';
import { Utensils } from 'lucide-react';

// Shows the photo, or a green placeholder with the dish name if the URL fails.
export default function FoodImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(!src);
  useEffect(() => setFailed(!src), [src]);

  if (failed) {
    return (
      <div className={`food-img food-img-fallback ${className}`} role="img" aria-label={alt}>
        <Utensils size={26} />
        <span>{alt}</span>
      </div>
    );
  }
  return <img className={`food-img ${className}`} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
