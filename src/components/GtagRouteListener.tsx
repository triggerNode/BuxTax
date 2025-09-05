import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { pushDataLayer } from "@/lib/gtm";

export default function GtagRouteListener() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    pushDataLayer({ event: "pageview", page_path: pathname + search + hash });
  }, [pathname, search, hash]);

  return null;
}
