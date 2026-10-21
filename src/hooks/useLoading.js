import { useEffect, useState } from 'react';

// Short skeleton delay so pages show a loading state like they would with a real API.
export default function useLoading(ms = 350) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
