interface Liff {
  init(config: { liffId: string; withTokenForBrowserAccess?: boolean }): Promise<void>;
  getAccessToken(): string | null;
  isInClient(): boolean;
  getProfile(): Promise<{ userId: string; displayName: string; pictureUrl?: string; statusMessage?: string; email?: string }>;
  closeWindow(): void;
  openWindow(params: { url: string; external?: boolean }): Promise<void>;
  login(config?: { redirectUri?: string }): void;
  logout(): Promise<void>;
  isLoggedIn(): boolean;
}

interface Window {
  liff?: Liff;
}

export {};