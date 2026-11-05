"use client";

import { useEffect } from "react";
import {
  ANALYTICS_EVENT_CHANNEL,
  analyticsEventNames,
  type AnalyticsEventDetail,
  type AnalyticsEventName,
  type AnalyticsSurface,
} from "@/lib/analytics";

const allowedEvents = new Set<string>(analyticsEventNames);

function eventDetail(
  element: HTMLElement,
  interaction: AnalyticsEventDetail["interaction"],
): AnalyticsEventDetail | undefined {
  const name = element.dataset.analyticsEvent;
  const surface = element.dataset.analyticsSurface;

  if (!name || !surface || !allowedEvents.has(name)) return undefined;

  return {
    name: name as AnalyticsEventName,
    surface: surface as AnalyticsSurface,
    target: element.dataset.analyticsTarget,
    interaction,
  };
}

function dispatchMeasurement(element: HTMLElement, interaction: AnalyticsEventDetail["interaction"]) {
  const detail = eventDetail(element, interaction);
  if (!detail) return;
  window.dispatchEvent(new CustomEvent<AnalyticsEventDetail>(ANALYTICS_EVENT_CHANNEL, { detail }));
  const w = window as Window & { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") {
    w.gtag("event", detail.name, {
      event_category: detail.surface,
      event_label: detail.target ?? "",
      interaction_type: detail.interaction,
    });
  }
}

/**
 * Emits a local CustomEvent for explicitly instrumented interactions and
 * forwards to Google Analytics 4 (`window.gtag`) when configured.
 */
export function AnalyticsEventBridge() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const measuredElement = target.closest<HTMLElement>("[data-analytics-event]");
      if (!measuredElement || measuredElement.tagName === "FORM" || measuredElement.tagName === "SELECT") return;
      dispatchMeasurement(measuredElement, "click");
    }

    function handleSubmit(event: SubmitEvent) {
      if (!(event.target instanceof HTMLElement)) return;
      dispatchMeasurement(event.target, "submit");
    }

    function handleChange(event: Event) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const measuredElement = target.closest<HTMLElement>("[data-analytics-event]");
      if (!measuredElement) return;
      dispatchMeasurement(measuredElement, "change");
    }

    document.addEventListener("click", handleClick, { capture: true });
    document.addEventListener("submit", handleSubmit, { capture: true });
    document.addEventListener("change", handleChange, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      document.removeEventListener("submit", handleSubmit, { capture: true });
      document.removeEventListener("change", handleChange, { capture: true });
    };
  }, []);

  return null;
}
