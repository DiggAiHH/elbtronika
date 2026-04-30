/**
 * CDP Bridge — Chrome DevTools Protocol wrapper.
 * Playwright is fully lazy-loaded to prevent bundling issues.
 */

export interface CDPSessionOptions {
  headless?: boolean;
  slowMo?: number;
  viewport?: { width: number; height: number };
  userAgent?: string;
}

// Local type stubs to avoid importing Playwright at module level
type Browser = unknown;
type BrowserContext = unknown;
type Page = {
  goto(url: string, opts?: unknown): Promise<unknown>;
  title(): Promise<string>;
  url(): string;
  $$eval(selector: string, fn: (els: Element[]) => unknown[]): Promise<unknown[]>;
  locator(selector: string): { all(): Promise<Array<{ click(): Promise<void>; fill(text: string): Promise<void> }>> };
  waitForLoadState(state?: string): Promise<void>;
  screenshot(opts?: unknown): Promise<Buffer>;
  evaluate<T>(script: string | (() => T)): Promise<T>;
  waitForSelector(selector: string, opts?: unknown): Promise<void>;
};

export class CDPBridge {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private options: CDPSessionOptions;

  constructor(opts: CDPSessionOptions = {}) {
    this.options = {
      headless: true,
      slowMo: 0,
      viewport: { width: 1280, height: 720 },
      ...opts,
    };
  }

  async connect(): Promise<void> {
    const { chromium } = await import("playwright");

    const launchOpts: { headless: boolean; slowMo?: number } = { headless: this.options.headless ?? true };
    if (this.options.slowMo) launchOpts.slowMo = this.options.slowMo;
    this.browser = await chromium.launch(launchOpts);

    const contextOpts: { viewport: { width: number; height: number }; userAgent?: string } = {
      viewport: this.options.viewport ?? { width: 1280, height: 720 },
    };
    if (this.options.userAgent) contextOpts.userAgent = this.options.userAgent;
    this.context = await (this.browser as any).newContext(contextOpts);
    this.page = await (this.context as any).newPage();
  }

  async disconnect(): Promise<void> {
    if (this.browser) {
      await (this.browser as any).close();
      this.browser = null;
      this.context = null;
      this.page = null;
    }
  }

  getPage(): Page {
    if (!this.page) throw new Error("Browser not connected. Call connect() first.");
    return this.page;
  }

  async navigate(url: string): Promise<{ title: string; url: string }> {
    const page = this.getPage();
    await page.goto(url, { waitUntil: "networkidle" });
    return { title: await page.title(), url: page.url() };
  }

  async snapshot(full = false): Promise<string> {
    const page = this.getPage();
    if (full) {
      const text = await page.evaluate(() => document.body.innerText);
      return text.slice(0, 8000);
    }
    const elements = await page.$$eval("a, button, input, select, textarea, [role='button']", (els) =>
      els.map((el, i) => {
        const tag = el.tagName.toLowerCase();
        const text = el.textContent?.slice(0, 50) ?? "";
        const type = (el as HTMLInputElement).type ?? "";
        const name = (el as HTMLInputElement).name ?? "";
        return `@e${i}: <${tag}${type ? ` type="${type}"` : ""}${name ? ` name="${name}"` : ""}> ${text}`;
      })
    );
    return (elements as string[]).join("\n").slice(0, 8000);
  }

  async click(ref: string): Promise<void> {
    const page = this.getPage();
    const index = Number.parseInt(ref.replace("@e", ""), 10);
    const elements = await page.locator("a, button, input, select, textarea, [role='button']").all();
    if (index < 0 || index >= elements.length) {
      throw new Error(`Element ref ${ref} not found. Only ${elements.length} elements available.`);
    }
    await elements[index]!.click();
    await page.waitForLoadState("networkidle");
  }

  async type(ref: string, text: string): Promise<void> {
    const page = this.getPage();
    const index = Number.parseInt(ref.replace("@e", ""), 10);
    const elements = await page.locator("input, textarea").all();
    if (index < 0 || index >= elements.length) {
      throw new Error(`Input ref ${ref} not found.`);
    }
    await elements[index]!.fill(text);
  }

  async screenshot(path?: string): Promise<Buffer> {
    const page = this.getPage();
    const opts: { fullPage: boolean; path?: string } = { fullPage: true };
    if (path) opts.path = path;
    return page.screenshot(opts);
  }

  async getAccessibilityTree(): Promise<unknown> {
    const page = this.getPage();
    const tree = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      const nodes: Array<{ tag: string; text: string; role?: string }> = [];
      while (walker.nextNode()) {
        const el = walker.currentNode as Element;
        const node: { tag: string; text: string; role?: string } = {
          tag: el.tagName.toLowerCase(),
          text: el.textContent?.slice(0, 50) ?? "",
        };
        const role = el.getAttribute("role");
        if (role) node.role = role;
        nodes.push(node);
      }
      return nodes;
    });
    return tree;
  }

  async executeJavaScript<T>(script: string): Promise<T> {
    const page = this.getPage();
    return page.evaluate(script);
  }

  async scrollToBottom(): Promise<void> {
    const page = this.getPage();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async waitForSelector(selector: string, timeout = 5000): Promise<void> {
    const page = this.getPage();
    await page.waitForSelector(selector, { timeout });
  }
}
