# Markdown to Image Renderer

This project provides a full-stack solution for rendering Markdown content into high-quality images, leveraging Cloudflare Workers with Playwright for server-side rendering and a React frontend for a user-friendly interface.

## Features

*   **Markdown to Image Conversion**: Convert Markdown text into a PNG image.
*   **Customizable Appearance**:
    *   **Card Background**: Set the background color of the Markdown content card.
    *   **Outer Background**: Apply a custom background (color or gradient) to the area surrounding the card. If a single hex color is provided, it automatically generates a subtle diagonal gradient.
    *   **Custom Width**: Define the width of the rendered Markdown card in pixels.
*   **Elegant UI**: A responsive React application with a clean design.
*   **Dark Mode Toggle**: Switch between light and dark themes in the UI.
*   **API Endpoints**:
    *   `POST /render`: Accepts Markdown, background, and width in a JSON body.
    *   `GET /render`: Accepts Markdown, background, and width as URL query parameters.
*   **Cloudflare Workers**: Utilizes Cloudflare's serverless platform for efficient and scalable image generation.
*   **Playwright Integration**: Renders HTML content using a headless browser for accurate and high-fidelity image output.

## Project Structure

```
.
├───.vscode/
├───node_modules/
├───public/
├───src/
│   ├───react-app/             # React frontend application
│   │   ├───App.css
│   │   ├───App.tsx
│   │   ├───index.css
│   │   └───main.tsx
│   └───worker/                # Cloudflare Worker backend
│       ├───services/
│       │   └───ImageRenderer.ts # Core image rendering logic with Playwright
│       ├───utils/
│       │   ├───htmlTemplate.ts  # HTML template and styling for rendering
│       │   └───markdownParser.ts # Markdown to HTML conversion
│       └───index.ts           # Hono.js API routes for the worker
├───.gitignore
├───eslint.config.js
├───index.html
├───package-lock.json
├───package.json
├───README.md
├───tsconfig.app.json
├───tsconfig.json
├───tsconfig.node.json
├───tsconfig.worker.json
├───vite.config.ts
├───worker-configuration.d.ts
└───wrangler.json
```

## Setup and Local Development

To set up the project and run it locally, follow these steps:

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <your-repo-url>
    cd markdown-render
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run in Development Mode**:
    This command will simultaneously start the React development server (frontend) and the Cloudflare Worker development server (backend) using `wrangler dev`. API requests from the frontend will be automatically proxied to the worker.

    ```bash
    npm run dev
    ```

    Once both servers are running, open your browser to the address provided by the Vite development server (usually `http://localhost:5173/`).

## Usage

### Web Interface

Navigate to `http://localhost:5173/` (or your Vite dev server address). You will see a user interface where you can:

*   Enter your Markdown content in the text area.
*   Specify a custom background color for the Markdown card (e.g., `#f0f0f0`, `rgba(255, 255, 255, 0.9)`).
*   Specify a custom outer background (e.g., `#8a2be2` for a smart gradient, or a full CSS `linear-gradient(...)` value).
*   Set the desired width of the rendered image in pixels.
*   Click "Render Image" to generate and display the PNG.
*   Use the theme toggle button (🌙/☀️) in the header to switch between dark and light modes.

### API Endpoints

You can also interact directly with the worker API. When running locally with `npm run dev`, the worker API is available at `http://127.0.0.1:8787/`.

#### `POST /render`

*   **Method**: `POST`
*   **Content-Type**: `application/json`
*   **Body**:
    ```json
    {
      "markdown": "# Hello World\nThis is some **Markdown**.",
      "cardBackground": "#f0f0f0",
      "outerBackground": "#4CAF50",
      "width": 720
    }
    ```
*   **Response**: `image/png` (binary image data)

#### `GET /render`

*   **Method**: `GET`
*   **Query Parameters**:
    *   `markdown` (required): URL-encoded Markdown string.
    *   `cardBackground` (optional): URL-encoded background color for the card.
    *   `outerBackground` (optional): URL-encoded background for the outer area.
    *   `width` (optional): Width of the image in pixels.
*   **Example**:
    `http://127.0.0.1:8787/render?markdown=%23%20Hello%20World&cardBackground=%23f0f0f0&outerBackground=%238a2be2&width=600`
*   **Response**: `image/png` (binary image data)

## Deployment

To deploy your application to Cloudflare Workers:

1.  **Build the project**: This will compile the React frontend and prepare the worker for deployment.
    ```bash
    npm run build
    ```
2.  **Deploy to Cloudflare**: This command will deploy your worker and its associated static assets (the React app) to Cloudflare.
    ```bash
    npm run deploy
    ```
    Follow the prompts from `wrangler` to authenticate and complete the deployment.

## Handover and Contribution Guide

This section provides more details for developers looking to understand, maintain, or contribute to the project.

### Key Technologies

*   **Cloudflare Workers**: Serverless execution environment.
*   **Hono.js**: Fast, lightweight web framework for Workers.
*   **@cloudflare/playwright**: Headless browser for rendering within Workers.
*   **React**: Frontend JavaScript library for building user interfaces.
*   **Vite**: Fast frontend build tool.
*   **TypeScript**: Superset of JavaScript for type-safe development.
*   **Marked.js**: Markdown parser.
*   **Concurrently**: Utility to run multiple npm scripts in parallel during development.

### Project Configuration

*   **`wrangler.json`**: Main configuration file for the Cloudflare Worker.
    *   `browser` binding: Configures the Playwright browser.
    *   `env.production`: Defines settings specific to the production deployment, including static asset serving.
*   **`vite.config.ts`**: Configuration for the Vite frontend build.
    *   `server.proxy`: Configures local development proxy to forward API requests to the `wrangler dev` server.
    *   `build.outDir`: Specifies the output directory for the frontend build (`dist/client`).
*   **`tsconfig.*.json`**: TypeScript configuration files. `tsconfig.worker.json` is specifically configured to include `dom` types for the `page.evaluate` context.

### Development Workflow

*   **Frontend Development**: Changes in `src/react-app/` are hot-reloaded by Vite.
*   **Backend Development**: Changes in `src/worker/` are hot-reloaded by `wrangler dev`.
*   **Combined Development**: Use `npm run dev` to run both simultaneously.

### Troubleshooting

*   **`Playwright browser binding "MYBROWSER" not found`**: This error indicates that the worker is not running in a Cloudflare Workers environment (or `wrangler dev`). Ensure you are using `npm run dev` for local development.
*   **Build/Deployment Errors**: Check the console output carefully. TypeScript errors will prevent the build. `wrangler` errors often point to configuration issues in `wrangler.json` or missing build artifacts.
*   **Image Loading Issues**: If images in Markdown are not appearing, ensure they are publicly accessible URLs. The `page.evaluate` step explicitly waits for images, but very slow or inaccessible images might still cause issues.

### Contributing

1.  **Fork the repository**.
2.  **Create a new branch** for your feature or bug fix.
3.  **Implement your changes**, adhering to the existing code style and structure.
4.  **Test your changes** thoroughly using `npm run dev`.
5.  **Ensure all `npm run build` checks pass**.
6.  **Submit a Pull Request** with a clear description of your changes.

---

Thank you for using the Markdown to Image Renderer!