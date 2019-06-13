class BackendHost {
  private static instance: BackendHost;
  private _host: string;

  private constructor() {}

  static getInstance() {
    if (!BackendHost.instance) {
      BackendHost.instance = new BackendHost();
      BackendHost.instance._host = "";
    }
    return BackendHost.instance;
  }

  getHost(): string {
    return this._host;
  }

  setHost(host: string) {
    this._host = host;
  }
}

export default BackendHost;
