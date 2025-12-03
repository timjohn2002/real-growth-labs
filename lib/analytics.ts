// Analytics utility functions
// Placeholder for analytics tracking

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== "undefined") {
    // Add your analytics tracking here (e.g., Google Analytics, Mixpanel, etc.)
    console.log("Event tracked:", eventName, properties)
  }
}

export const trackPageView = (path: string) => {
  if (typeof window !== "undefined") {
    // Add your page view tracking here
    console.log("Page view:", path)
  }
}

export const trackConversion = (conversionType: string, value?: number) => {
  if (typeof window !== "undefined") {
    // Add your conversion tracking here
    console.log("Conversion:", conversionType, value)
  }
}

