export const ANALYTICS_EVENT_CHANNEL = "uretir:analytics";

export const analyticsEventNames = [
  "navigation_select",
  "search_submit",
  "filter_select",
  "discovery_select",
  "ai_intent_select",
  "ai_priority_select",
  "ai_prompt_submit",
  "ai_recommendation_open",
  "ai_reset",
  "contact_select",
  "rss_select",
  "theme_select",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];

export type AnalyticsSurface =
  | "header"
  | "footer"
  | "blog"
  | "global_search"
  | "content_discovery"
  | "puan_ai_browser"
  | "puan_ai_advisor"
  | "contact"
  | "newsletter"
  | "theme";

export type AnalyticsEventDetail = Readonly<{
  name: AnalyticsEventName;
  surface: AnalyticsSurface;
  target?: string;
  interaction: "click" | "submit" | "change";
}>;

type AnalyticsAttributeInput = Readonly<{
  event: AnalyticsEventName;
  surface: AnalyticsSurface;
  target?: string;
}>;

export type AnalyticsAttributes = Readonly<{
  "data-analytics-event": AnalyticsEventName;
  "data-analytics-surface": AnalyticsSurface;
  "data-analytics-target"?: string;
}>;

const safeTargetPattern = /^[a-z0-9][a-z0-9/_-]{0,79}$/;

/**
 * Adds a provider-neutral measurement contract to an interactive element.
 *
 * Targets are deliberately restricted to short, machine-defined identifiers.
 * Never pass search text, email addresses, card data, user IDs, or other
 * user-provided values through this helper.
 */
export function analyticsAttributes({
  event,
  surface,
  target,
}: AnalyticsAttributeInput): AnalyticsAttributes {
  if (target && !safeTargetPattern.test(target)) {
    throw new Error(`Unsafe analytics target: ${target}`);
  }

  return {
    "data-analytics-event": event,
    "data-analytics-surface": surface,
    ...(target ? { "data-analytics-target": target } : {}),
  };
}
