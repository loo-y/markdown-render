import { Hono, Context } from 'hono';
import { ImageRenderer } from './services/ImageRenderer';

// Define the environment binding interface for Hono
type Bindings = {
	MYBROWSER: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

interface RenderRequest {
    markdown?: string | null;
    cardBackground?: string | null;
    outerBackground?: string | null;
    width?: string | number | null; // Width can come from query (string) or JSON (number)
}

/**
 * Handles the core logic of rendering markdown to an image.
 * @param c Hono context.
 * @param options The rendering options from the request.
 */
const handleRenderRequest = async (c: Context<{ Bindings: Bindings }>, options: RenderRequest) => {
	const { markdown, cardBackground, outerBackground, width } = options;

	if (!markdown) {
		return c.json({ error: 'Markdown content is missing or invalid.' }, 400);
	}

	try {
        const rendererOptions = {
            markdown,
			cardBackground: cardBackground || undefined,
			outerBackground: outerBackground || undefined,
            width: width ? parseInt(String(width), 10) : undefined
        };

		const imageRenderer = new ImageRenderer(c.env);
		const imageBuffer = await imageRenderer.render(rendererOptions);

		// Return the image as a response
		c.header('Content-Type', 'image/png');
		c.header('Content-Disposition', 'inline; filename="render.png"');
		return c.body(imageBuffer);

	} catch (error: any) {
		console.error('Failed to render markdown:', error);
        // Return the specific error message if available
		return c.json({ error: error.message || 'An unexpected error occurred during rendering.' }, 500);
	}
};

// Route for health check
app.get('/', (c) => {
	return c.text('Markdown Renderer is running!');
});

// POST route for rendering markdown from JSON body
app.post('/render', async (c) => {
	const body = await c.req.json<RenderRequest>();
	return handleRenderRequest(c, body);
});

// GET route for rendering markdown from query parameter
app.get('/render', async (c) => {
	const { markdown, cardBackground, outerBackground, width } = c.req.query();
	return handleRenderRequest(c, { markdown, cardBackground, outerBackground, width });
});

export default app;
