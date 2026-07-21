"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    // Manual pageview capture: App Router client-side navigation doesn't
    // trigger a real page load, so autocapture's pageview would miss them.
    capture_pageview: false,
    person_profiles: "identified_only",
  });
}

function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const qs = searchParams.toString();
    posthog.capture("$pageview", {
      $current_url: window.origin + pathname + (qs ? `?${qs}` : ""),
    });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      {children}
    </PHProvider>
  );
}
