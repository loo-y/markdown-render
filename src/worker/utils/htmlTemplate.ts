interface CreateHtmlOptions {
  htmlContent: string;
  cardBackground?: string;
  outerBackground?: string;
  width?: number;
}

const defaultCardBackground = '#ffffff';
const defaultOuterBackground = 'linear-gradient(to bottom right, #a8b5c1, #8d9aa8)';
const defaultWidth = 680;

/**
 * Darkens a hex color by a given amount.
 * @param hex The hex color string (e.g., "#RRGGBB").
 * @param amount The amount to darken each channel (0-255).
 * @returns The new darkened hex color string.
 */
function darkenHexColor(hex: string, amount: number): string {
    let [r, g, b] = (hex.match(/\w\w/g) || []).map(h => parseInt(h, 16));
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);
    return "#" + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

/**
 * Determines the appropriate background style.
 * @param input The user-provided background string.
 * @returns A CSS background value.
 */
function getOuterBackgroundStyle(input?: string): string {
    if (!input) {
        return defaultOuterBackground;
    }
    // If it's a simple hex color, create a gradient.
    if (/^#[0-9a-f]{3,6}$/i.test(input)) {
        const endColor = darkenHexColor(input, 40);
        return `linear-gradient(to bottom right, ${input}, ${endColor})`;
    }
    // Otherwise, assume it's a valid CSS background value (e.g., linear-gradient, url, etc.)
    return input;
}


/**
 * Creates a full HTML document from an HTML string, with added styles for rendering.
 * @param options The options including HTML content and an optional background.
 * @returns A full HTML document as a string.
 */
export function createHtmlDocument(options: CreateHtmlOptions): string {
  const { htmlContent, cardBackground, outerBackground, width } = options;
  const finalCardBackground = cardBackground || defaultCardBackground;
  const finalOuterBackground = getOuterBackgroundStyle(outerBackground);
  const finalWidth = width || defaultWidth;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Markdown Render</title>
        <style>
            body {
                margin: 0;
                background-color: rgba(0,0,0,0);
            }
            .screenshot-target {
                display: inline-block;
                padding: 60px; /* Increased padding for a more diffuse shadow */
                background: ${finalOuterBackground};
            }
            #card {
                width: ${finalWidth}px;
                background: ${finalCardBackground};
                border-radius: 12px;
                /* A simpler, high-quality shadow less prone to rendering artifacts */
                /* box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15); */
                /* filter: drop-shadow(0px 25px 50px rgba(0, 0, 0, 0.15)); */
                padding: 20px 40px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
                line-height: 1.6;
                color: #24292e;
            }
            h1, h2, h3, h4, h5, h6 {
                margin-top: 24px;
                margin-bottom: 16px;
                font-weight: 600;
                line-height: 1.25;
                border-bottom: 1px solid #eaecef;
                padding-bottom: 0.3em;
            }
            code {
                padding: 0.2em 0.4em;
                margin: 0;
                font-size: 85%;
                background-color: rgba(27,31,35,0.05);
                border-radius: 3px;
            }
            pre > code {
                padding: 16px;
                display: block;
                overflow: auto;
                line-height: 1.45;
                background-color: #f6f8fa;
                border-radius: 3px;
            }
            img {
                max-width: 100%;
            }
        </style>
    </head>
    <body>
        <div class="screenshot-target">
            <div id="card">
                ${htmlContent}
            </div>
        </div>
    </body>
    </html>
  `;
}
