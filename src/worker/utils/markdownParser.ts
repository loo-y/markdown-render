import { marked } from 'marked';

/**
 * Parses a Markdown string and converts it to HTML.
 * @param markdown The Markdown string to parse.
 * @returns The resulting HTML string.
 */
export async function parseMarkdown(markdown: string): Promise<string> {
  // The marked library can be async, so we await the result.
  const html = await marked.parse(markdown);
  return html;
}
