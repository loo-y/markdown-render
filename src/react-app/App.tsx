import { useState, useEffect } from 'react';
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

function App() {
    const [markdown, setMarkdown] = useState(defaultMarkdown);
    const [cardBackground, setCardBackground] = useState('');
    const [outerBackground, setOuterBackground] = useState('');
    const [width, setWidth] = useState(680);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    const toggleTheme = () => {
        setTheme(currentTheme => currentTheme === 'light' ? 'dark' : 'light');
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