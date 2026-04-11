import { NextResponse } from "next/server";

// GET /api/docs — Serve Swagger UI
export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MoneyExchangeTHGroup Admin API — Swagger</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 30px 0 20px; }
    #json-link-bar {
      position: sticky;
      top: 0;
      z-index: 1000;
      display: flex;
      justify-content: flex-end;
      padding: 8px 16px;
      background: #1b1b1b;
    }
    #json-link-bar a {
      color: #fff;
      font-family: sans-serif;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      background: #49cc90;
      padding: 6px 14px;
      border-radius: 4px;
    }
    #json-link-bar a:hover { background: #3aaf77; }
  </style>
</head>
<body>
  <div id="json-link-bar">
    <a href="/openapi.json" target="_blank" rel="noopener noreferrer">View JSON</a>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/openapi.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ],
      layout: "BaseLayout"
    });
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
