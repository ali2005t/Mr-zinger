import { useEffect, useState } from "react";
import { resolveDatabaseImage } from "../firebase/data";

export function useDatabaseImage(source?: string) {
  const [resolved, setResolved] = useState(source ?? "");
  useEffect(() => {
    let current = true;
    setResolved(source ?? "");
    if (source?.startsWith("dbimage:")) {
      void resolveDatabaseImage(source).then((value) => { if (current && value) setResolved(value); });
    }
    return () => { current = false; };
  }, [source]);
  return resolved;
}
