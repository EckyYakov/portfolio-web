/**
 * Analytics service for Google Analytics 4 event tracking
 * Handles all custom events for the command-line portfolio
 */

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export type CommandType = 'navigation' | 'utility' | 'easter_egg' | 'game';
export type GameName = 'pong' | 'golf' | 'hacker';
export type EntryMethod = 'command' | 'easter_egg' | 'direct' | 'autocomplete';

export class Analytics {
  private static instance: Analytics;
  private isEnabled: boolean = false;

  private constructor() {
    // Check if gtag is available (production environment)
    this.isEnabled = typeof window !== 'undefined' && typeof window.gtag === 'function';
    
    if (this.isEnabled) {
      // Track initial page load
      this.trackPageView('/', 'Home - Portfolio');
    }
  }

  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  /**
   * Track command executions
   */
  public trackCommand(commandName: string, type: CommandType = 'navigation', hasArguments: boolean = false, success: boolean = true): void {
    if (!this.isEnabled) return;

    window.gtag!('event', 'command_execute', {
      command_name: commandName,
      command_type: type,
      has_arguments: hasArguments,
      success: success,
      custom_parameter_1: `${commandName}_${type}`
    });

    // Also track as a virtual page view for better navigation tracking
    if (success && type === 'navigation') {
      this.trackPageView(`/${commandName}`, `${this.capitalizeFirst(commandName)} - Evan Steitz`);
    }
  }

  /**
   * Track easter egg discoveries
   */
  public trackEasterEgg(easterEggName: string, triggerText: string): void {
    if (!this.isEnabled) return;

    window.gtag!('event', 'easter_egg_discovered', {
      easter_egg_name: easterEggName,
      trigger_text: triggerText,
      custom_parameter_1: `easter_${easterEggName}`
    });
  }

  /**
   * Track game events
   */
  public trackGameStart(gameName: GameName, entryMethod: EntryMethod): void {
    if (!this.isEnabled) return;

    window.gtag!('event', 'game_start', {
      game_name: gameName,
      entry_method: entryMethod,
      custom_parameter_1: `game_${gameName}_start`
    });

    // Track as virtual page view
    this.trackPageView(`/games/${gameName}`, `${this.capitalizeFirst(gameName)} Game - Evan Steitz`);
  }

  public trackGameEnd(gameName: GameName, duration: number, score?: number, completed: boolean = true): void {
    if (!this.isEnabled) return;

    window.gtag!('event', 'game_end', {
      game_name: gameName,
      duration_seconds: Math.round(duration / 1000),
      score: score,
      completed: completed,
      custom_parameter_1: `game_${gameName}_end`
    });
  }

  public trackGameAction(gameName: GameName, action: string, value?: number): void {
    if (!this.isEnabled) return;

    window.gtag!('event', 'game_action', {
      game_name: gameName,
      action: action,
      value: value,
      custom_parameter_1: `game_${gameName}_${action}`
    });
  }

  /**
   * Track UI interactions
   */
  public trackAutocompleteUsage(commandSelected: string, position: number): void {
    if (!this.isEnabled) return;

    window.gtag!('event', 'autocomplete_select', {
      command_selected: commandSelected,
      position: position,
      custom_parameter_1: `autocomplete_${commandSelected}`
    });
  }

  public trackThemeChange(newTheme: string): void {
    if (!this.isEnabled) return;

    window.gtag!('event', 'theme_change', {
      new_theme: newTheme,
      custom_parameter_1: `theme_${newTheme}`
    });
  }

  public trackExternalLink(url: string, linkText: string): void {
    if (!this.isEnabled) return;

    window.gtag!('event', 'click', {
      link_url: url,
      link_text: linkText,
      outbound: true,
      custom_parameter_1: `external_${this.getDomain(url)}`
    });
  }

  /**
   * Track virtual page views for SPA navigation
   */
  public trackPageView(path: string, title: string): void {
    if (!this.isEnabled) return;

    window.gtag!('event', 'page_view', {
      page_path: path,
      page_title: title,
      page_location: `${window.location.origin}${path}`
    });
  }

  /**
   * Track user engagement events
   */
  public trackEngagement(action: string, value?: string | number): void {
    if (!this.isEnabled) return;

    window.gtag!('event', 'engagement', {
      engagement_type: action,
      value: value,
      custom_parameter_1: `engagement_${action}`
    });
  }

  /**
   * Track session events
   */
  public trackSessionStart(): void {
    if (!this.isEnabled) return;

    window.gtag!('event', 'session_start', {
      custom_parameter_1: 'session_start'
    });
  }

  /**
   * Track errors
   */
  public trackError(errorType: string, errorMessage: string, commandName?: string): void {
    if (!this.isEnabled) return;

    window.gtag!('event', 'exception', {
      description: errorMessage,
      fatal: false,
      error_type: errorType,
      command_name: commandName,
      custom_parameter_1: `error_${errorType}`
    });
  }

  /**
   * Utility methods
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Check if analytics is enabled (mainly for debugging)
   */
  public isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const analytics = Analytics.getInstance();