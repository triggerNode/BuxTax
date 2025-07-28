interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

class Analytics {
  private queue: AnalyticsEvent[] = [];
  private isEnabled: boolean = true;

  track(event: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
    };

    this.queue.push(analyticsEvent);
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('Analytics Event:', analyticsEvent);
    }

    // In a real app, you would send this to your analytics service
    this.flush();
  }

  page(name: string, properties?: Record<string, any>) {
    this.track('page_view', {
      page_name: name,
      ...properties,
    });
  }

  identify(userId: string, traits?: Record<string, any>) {
    this.track('identify', {
      user_id: userId,
      traits,
    });
  }

  private flush() {
    // In a real implementation, you would batch send events to your analytics service
    // For now, we'll just clear the queue
    if (this.queue.length > 10) {
      this.queue = this.queue.slice(-5); // Keep only the last 5 events
    }
  }

  disable() {
    this.isEnabled = false;
  }

  enable() {
    this.isEnabled = true;
  }
}

export const analytics = new Analytics();

// Track initial page load
analytics.page('BuxTax Calculator');