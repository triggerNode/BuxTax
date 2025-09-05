import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { sendPageview } from "@/lib/analytics";
import { pushDataLayer } from "@/lib/gtm";

export default function GtagRouteListener() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    sendPageview(pathname + search + hash);
    pushDataLayer({ event: "pageview", page_path: pathname + search + hash });
  }, [pathname, search, hash]);

  return null;
}
