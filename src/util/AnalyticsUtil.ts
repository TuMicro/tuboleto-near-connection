import { fa } from "./FirebaseInit";
import { getTawkTo } from "./fromjs/tawk.to";
import * as Sentry from "@sentry/react";

export type AnalyticsParamsType = { [key: string]: string | number | null | undefined };

export function trackClick(btnName: string, otherParams?: AnalyticsParamsType) {
  const stuff: AnalyticsParamsType = {
    item_name: btnName,
    ...(otherParams ?? {})
  };
  fa.logEvent('click', stuff);

  try {
    // sending the event to tawk also, so the support people can know about clicks also
    const toTawk: AnalyticsParamsType = {};
    Object.keys(stuff).map(k => {
      const nk = k.replace(/[^a-zA-Z]/g, "-");
      // const nv = stuff[k].replace(/[^a-zA-Z]/g, "-");
      toTawk[nk] = stuff[k];
    });

    getTawkTo().addEvent('click', toTawk, function (error: any) {
      Sentry.captureException(error);
    });
  } catch (e) { // sometimes when tawk has not loaded yet the button 
    // this will throw an exception and prevent the click from going through
    Sentry.captureException(e);
  }
}