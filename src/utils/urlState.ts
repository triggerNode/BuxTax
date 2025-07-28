// URL state management utilities for BuxTax

export interface UrlState {
  userType?: 'gameDev' | 'ugcCreator';
  tab?: 'profit' | 'goal' | 'pulse';
  grossRobux?: number;
  targetUSD?: number;
  [key: string]: any;
}

export function getUrlState(): UrlState {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const state: UrlState = {};
    
    // Parse known parameters
    if (urlParams.has('userType')) {
      const userType = urlParams.get('userType');
      if (userType === 'gameDev' || userType === 'ugcCreator') {
        state.userType = userType;
      }
    }
    
    if (urlParams.has('tab')) {
      const tab = urlParams.get('tab');
      if (tab === 'profit' || tab === 'goal' || tab === 'pulse') {
        state.tab = tab;
      }
    }
    
    if (urlParams.has('grossRobux')) {
      const grossRobux = parseFloat(urlParams.get('grossRobux') || '0');
      if (!isNaN(grossRobux) && grossRobux > 0) {
        state.grossRobux = grossRobux;
      }
    }
    
    if (urlParams.has('targetUSD')) {
      const targetUSD = parseFloat(urlParams.get('targetUSD') || '0');
      if (!isNaN(targetUSD) && targetUSD > 0) {
        state.targetUSD = targetUSD;
      }
    }
    
    return state;
  } catch (error) {
    console.warn('Error parsing URL state:', error);
    return {};
  }
}

export function setUrlState(newState: Partial<UrlState>, replace = true): void {
  try {
    const url = new URL(window.location.href);
    
    // Update URL parameters
    Object.entries(newState).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      } else {
        url.searchParams.delete(key);
      }
    });
    
    // Update browser history
    if (replace) {
      window.history.replaceState({}, '', url.toString());
    } else {
      window.history.pushState({}, '', url.toString());
    }
  } catch (error) {
    console.warn('Error setting URL state:', error);
  }
}

export function generateShareableUrl(data: any, baseUrl = window.location.origin): string {
  try {
    const url = new URL(baseUrl);
    
    // Add state parameters for sharing
    if (data.userType) {
      url.searchParams.set('userType', data.userType);
    }
    
    if (data.grossRobux) {
      url.searchParams.set('grossRobux', String(data.grossRobux));
    }
    
    if (data.targetUSD) {
      url.searchParams.set('targetUSD', String(data.targetUSD));
    }
    
    if (data.tab) {
      url.searchParams.set('tab', data.tab);
    }
    
    // Add UTM parameters for tracking
    url.searchParams.set('utm_source', 'buxtax');
    url.searchParams.set('utm_medium', 'share');
    url.searchParams.set('utm_campaign', 'calculator');
    
    return url.toString();
  } catch (error) {
    console.warn('Error generating shareable URL:', error);
    return baseUrl;
  }
}