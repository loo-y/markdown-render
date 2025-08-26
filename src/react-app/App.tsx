import { useState, useEffect } from 'react';
import { marked } from 'marked';
import './App.css';

const defaultMarkdown = `
# Hello, World! 👋

This is a simple Markdown to image renderer.

- Type your markdown on the left.
- Click the **Render Image** button.
- See the result on the right!

## Example with an image
![Cloudflare Logo](https://upload.wikimedia.org/wikipedia/commons/9/94/Cloudflare_Logo.png)
`;

// --- Helper functions for client-side background generation (copied from htmlTemplate.ts) ---
const defaultCardBackground = '#ffffff';
const defaultOuterBackground = 'linear-gradient(to bottom right, #a8b5c1, #8d9aa8)';
const defaultWidth = 680;

function darkenHexColor(hex: string, amount: number): string {
    let [r, g, b] = (hex.match(/\w\w/g) || []).map(h => parseInt(h, 16));
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);
    return "#" + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

function getOuterBackgroundStyle(input?: string): string {
    if (!input) {
        return defaultOuterBackground;
    }
    if (/^#[0-9a-f]{3,6}$/i.test(input)) {
        const endColor = darkenHexColor(input, 40);
        return `linear-gradient(to bottom right, ${input}, ${endColor})`;
    }
    return input;
}
// --- End Helper functions ---

function App() {
    const [markdown, setMarkdown] = useState(defaultMarkdown);
    const [cardBackground, setCardBackground] = useState('');
    const [outerBackground, setOuterBackground] = useState('');
    const [width, setWidth] = useState(680);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState('light');
    const [htmlPreview, setHtmlPreview] = useState('');
    const [livePreviewOptionsEnabled, setLivePreviewOptionsEnabled] = useState(true); // New state

    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    useEffect(() => {
        const renderMarkdown = async () => {
            const html = await marked.parse(markdown);
            setHtmlPreview(html);
        };
        renderMarkdown();
    }, [markdown]);

    const toggleTheme = () => {
        setTheme(currentTheme => currentTheme === 'light' ? 'dark' : 'light');
    };

    const toggleLivePreviewOptions = () => {
        setLivePreviewOptionsEnabled(prev => !prev);
    };

    const handleRender = async () => {
        setIsLoading(true);
        setError(null);
        setImageUrl(null);

        try {
            const requestBody: { 
                markdown: string; 
                cardBackground?: string; 
                outerBackground?: string;
                width?: number; 
            } = { markdown };

            if (cardBackground) requestBody.cardBackground = cardBackground;
            if (outerBackground) requestBody.outerBackground = outerBackground;
            if (width) requestBody.width = Number(width);

            const response = await fetch('/render', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to render image.');
            }

            const imageBlob = await response.blob();
            const url = URL.createObjectURL(imageBlob);
            setImageUrl(url);

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    // Styles for live preview based on options
    const previewCardStyle: React.CSSProperties = {};
    const previewOuterStyle: React.CSSProperties = {};
    const previewCardWidth = width || defaultWidth;

    if (livePreviewOptionsEnabled) {
        previewCardStyle.background = cardBackground || defaultCardBackground;
        previewCardStyle.width = `${previewCardWidth}px`;
        previewCardStyle.borderRadius = '12px';
        previewCardStyle.boxShadow = '0px 2.8px 2.2px rgba(0, 0, 0, 0.02), 0px 6.7px 5.3px rgba(0, 0, 0, 0.028), 0px 12.5px 10px rgba(0, 0, 0, 0.035), 0px 22.3px 17.9px rgba(0, 0, 0, 0.042), 0px 41.8px 33.4px rgba(0, 0, 0, 0.05), 0px 100px 80px rgba(0, 0, 0, 0.07);';

        previewOuterStyle.background = getOuterBackgroundStyle(outerBackground);
        previewOuterStyle.padding = '60px';
    }

    return (
        <div className={`App ${theme}`}>
            <header className="App-header">
                <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <h1>Markdown to Image Renderer</h1>
                <p>Powered by Hono, React, and Cloudflare Workers with Playwright</p>
            </header>
            <main className="container">
                <div className="editor-pane">
                    <h2>Markdown Input</h2>
                    <textarea
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        placeholder="Enter your Markdown here..."
                        className="markdown-input"
                    />
                    <div className="options-grid">
                        <div>
                            <h2>Card Background</h2>
                            <input
                                type="text"
                                value={cardBackground}
                                onChange={(e) => setCardBackground(e.target.value)}
                                placeholder="Default: #ffffff"
                                className="background-input"
                            />
                        </div>
                        <div>
                            <h2>Outer Background</h2>
                            <input
                                type="text"
                                value={outerBackground}
                                onChange={(e) => setOuterBackground(e.target.value)}
                                placeholder="Default: Gradient"
                                className="background-input"
                            />
                        </div>
                        <div>
                            <h2>Width (px)</h2>
                            <input
                                type="number"
                                value={width}
                                onChange={(e) => setWidth(Number(e.target.value))}
                                placeholder="Default: 680"
                                className="background-input"
                            />
                        </div>
                    </div>
                    <button onClick={handleRender} disabled={isLoading}>
                        {isLoading ? 'Rendering...' : 'Render Image'}
                    </button>
                </div>
                <div className="viewer-pane">
                    <div className="live-preview-header">
                        <h2>Live Preview</h2>
                        <button onClick={toggleLivePreviewOptions} className="toggle-preview-options-button">
                            {livePreviewOptionsEnabled ? 'Disable Effects' : 'Enable Effects'}
                        </button>
                    </div>
                    <div className="live-preview-outer" style={livePreviewOptionsEnabled ? previewOuterStyle : {}}>
                        <div className="live-preview-card" style={livePreviewOptionsEnabled ? previewCardStyle : {}}>
                            <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
                        </div>
                    </div>
                </div>
                <div className="viewer-pane">
                    <h2>Image Output</h2>
                    <div className="image-container">
                        {isLoading && <div className="loading-spinner"></div>}
                        {error && <div className="error-message">Error: {error}</div>}
                        {imageUrl && !isLoading && !error && (
                            <img src={imageUrl} alt="Rendered Markdown" />
                        )}
                        {!imageUrl && !isLoading && !error && (
                            <div className="placeholder">Your rendered image will appear here.</div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;