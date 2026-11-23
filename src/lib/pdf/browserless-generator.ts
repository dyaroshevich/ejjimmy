export class BrowserlessGenerator {
  static async generateFromHtml(html: string): Promise<Buffer | null> {
    const apiKey = process.env.BROWSERLESS_API_KEY;
    if (!apiKey) {
      console.error('[Browserless] Missing BROWSERLESS_API_KEY');
      return null;
    }

    try {
      const response = await fetch(
        `https://chrome.browserless.io/pdf?token=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            html,
            options: {
              format: 'A4',
              printBackground: true,
              margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
            },
          }),
          signal: AbortSignal.timeout(30000),
        }
      );

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.error(`[Browserless] ${response.status}: ${errText.slice(0, 200)}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err: any) {
      console.error('[Browserless] Error:', err.message);
      return null;
    }
  }
}
