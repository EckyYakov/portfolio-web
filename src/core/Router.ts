export class Router {
  private static instance: Router;

  private constructor() {
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });
  }

  static getInstance(): Router {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  parseCommand(): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get('cmd');
  }

  setCommand(command: string): void {
    const url = new URL(window.location.href);
    if (command) {
      url.searchParams.set('cmd', command);
    } else {
      url.searchParams.delete('cmd');
    }
    window.history.pushState({}, '', url.toString());
  }

  private handleRoute(): void {
    const command = this.parseCommand();
    if (command) {
      window.dispatchEvent(new CustomEvent('route-command', { detail: command }));
    }
  }
}