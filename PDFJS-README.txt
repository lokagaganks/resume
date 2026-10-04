PDF.js Viewer Conversion
========================
PDF iframe embeds in HTML files were converted to use the shared pdfjs-viewer.html wrapper.
The wrapper loads Mozilla's hosted PDF.js generic viewer, so internet access is required.
Non-PDF iframes were left unchanged.
Remote PDF hosts must allow cross-origin requests (CORS) for PDF.js to fetch their files.
Serve the site over HTTP/HTTPS (such as GitHub Pages); opening HTML directly with file:// may not work reliably.
