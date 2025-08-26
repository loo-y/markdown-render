import playwright from '@cloudflare/playwright';
import { createHtmlDocument } from '../utils/htmlTemplate';
import { parseMarkdown } from '../utils/markdownParser';

// Define the environment interface for type safety
interface Env {
    MYBROWSER: Fetcher;
}

interface RenderOptions {
    markdown: string;
    cardBackground?: string;
    outerBackground?: string;
    width?: number;
}

const defaultWidth = 680;
const padding = 100; // 50px on each side

export class ImageRenderer {
    private env: Env;

    constructor(env: Env) {
        this.env = env;
    }

    /**
     * Renders a Markdown string into an image.
     * @param options The rendering options, including markdown and an optional background.
     * @returns A Promise that resolves to the image buffer (PNG).
     * @throws Will throw an error if the browser fails to launch or the page fails to render.
     */
    public async render(options: RenderOptions): Promise<ArrayBuffer> {
        if (!this.env.MYBROWSER) {
            throw new Error(
                'Playwright browser binding "MYBROWSER" not found. ' +
                'This is expected when running in a local dev server that is not `wrangler dev`. ' +
                'Please use `wrangler dev` for local development to test this functionality.'
            );
        }
        const browser = await playwright.launch(this.env.MYBROWSER);

        const finalWidth = options.width || defaultWidth;

        const page = await browser.newPage({
            // Set a viewport that is large enough to contain the target element
            viewport: { width: finalWidth + padding, height: 1024 }, // Height is arbitrary, will be cropped by screenshot
            deviceScaleFactor: 1, // For higher resolution screenshots: 2x for retina
        });

        try {
            const htmlContent = await parseMarkdown(options.markdown);
            const fullHtml = createHtmlDocument({ 
                htmlContent, 
                cardBackground: options.cardBackground,
                outerBackground: options.outerBackground,
                width: finalWidth
            });

            await page.setContent(fullHtml, {
                waitUntil: 'domcontentloaded', // Wait for the DOM to be ready first
            });

            // Explicitly wait for all images inside the card to load
            await page.evaluate(async () => {
                const imagePromises = Array.from(document.querySelectorAll<HTMLImageElement>('#card img')).map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise((resolve, _reject) => {
                        img.addEventListener('load', resolve);
                        img.addEventListener('error', resolve); // Also resolve on error so we don't hang forever
                    });
                });
                await Promise.all(imagePromises);
            });

            // Find the screenshot target element and take a screenshot of it
            const targetElement = await page.$('.screenshot-target');
            if (!targetElement) {
                throw new Error('Screenshot target element not found in the HTML template.');
            }

            const imageBuffer = await targetElement.screenshot({
                type: 'png',
                // Make the area outside the element transparent
                omitBackground: true,
            });

            return imageBuffer;
        } finally {
            // Ensure the browser is closed even if errors occur
            await browser.close();
        }
    }
}
