# Installation Guide - Standalone IoT Dashboard Renderer

This guide will help you extract and run the Standalone IoT Dashboard Renderer as an independent application.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Modern web browser

## Step 1: Extract the Standalone Renderer

The `StandaloneIoTRenderer` folder contains everything needed to run independently.

### Option A: Move Folder

```bash
# From the main project root
cd ..
mv Hyperwisor-v4/src/components/StandaloneIoTRenderer ./standalone-iot-renderer
cd standalone-iot-renderer
```

### Option B: Copy Folder

```bash
# From the main project root
cp -r Hyperwisor-v4/src/components/StandaloneIoTRenderer ../standalone-iot-renderer
cd ../standalone-iot-renderer
```

### On Windows

```powershell
# Move
Move-Item -Path "Hyperwisor-v4\src\components\StandaloneIoTRenderer" -Destination "..\standalone-iot-renderer"
cd ..\standalone-iot-renderer

# Or Copy
Copy-Item -Path "Hyperwisor-v4\src\components\StandaloneIoTRenderer" -Destination "..\standalone-iot-renderer" -Recurse
cd ..\standalone-iot-renderer
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies:
- React & React DOM
- Tailwind CSS
- Radix UI components
- Three.js for 3D widgets
- Leaflet for maps
- Recharts for charts
- And all other widget dependencies

Installation typically takes 2-5 minutes depending on your internet connection.

## Step 3: Run Development Server

```bash
npm run dev
```

The application will start on `http://localhost:8080`

You should see:
```
VITE v5.4.1  ready in XXX ms

➜  Local:   http://localhost:8080/
➜  Network: http://YOUR-IP:8080/
```

## Step 4: Build for Production

To create a production build:

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Serve Production Build

```bash
npm run preview
```

Or use any static file server:

```bash
npx serve dist
```

## Directory Structure After Extraction

```
standalone-iot-renderer/
├── src/                          # Source code
│   ├── components/               # All rendering components
│   │   ├── ui/                  # shadcn/ui components (49 files)
│   │   ├── widget-renderers/    # Widget renderers (47 files)
│   │   ├── property-configs/    # Widget configs (25 files)
│   │   └── widgets/             # Special widgets (5 files)
│   ├── contexts/                # React contexts
│   ├── hooks/                   # Custom hooks
│   ├── types/                   # TypeScript definitions
│   ├── utils/                   # Utilities
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   ├── StandaloneRenderer.tsx   # Main renderer
│   └── index.css                # Global styles
├── package.json                 # Dependencies
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
├── index.html                  # HTML entry
├── .gitignore                  # Git ignore rules
├── README.md                   # Main documentation
├── QUICKSTART.md               # Quick start guide
├── IMPLEMENTATION_SUMMARY.md   # Technical details
└── INSTALLATION.md             # This file
```

## Troubleshooting

### Issue: Port 8080 already in use

Change the port in `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 3000, // Change to any available port
  },
  // ...
});
```

### Issue: Dependencies not installing

Try clearing npm cache:

```bash
npm cache clean --force
npm install
```

### Issue: TypeScript errors

Make sure TypeScript is installed:

```bash
npm install -D typescript
```

### Issue: Module resolution errors

Verify the `@` alias is working. Check `vite.config.ts`:

```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
},
```

## Running in Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run", "dev"]
```

Build and run:

```bash
docker build -t standalone-iot-renderer .
docker run -p 8080:8080 standalone-iot-renderer
```

## Production Deployment

### Option 1: Static Hosting

Build the app:

```bash
npm run build
```

Deploy the `dist/` folder to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Azure Static Web Apps
- Any static file server

### Option 2: Node.js Server

Create `server.js`:

```javascript
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static('dist'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Run:

```bash
npm run build
node server.js
```

### Option 3: Local Network Access

For industrial deployments on local networks:

1. Build the production version
2. Set up a reverse proxy (nginx, Apache)
3. Configure SSL/TLS with internal certificates
4. Set firewall rules for port access

Example nginx config:

```nginx
server {
    listen 80;
    server_name dashboard.local;
    
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Environment Variables

Create a `.env` file for custom configuration:

```env
VITE_WS_DEFAULT_URL=wss://your-local-server.com
VITE_WS_DEFAULT_ID=dashboard-1
```

Access in code:

```typescript
const defaultUrl = import.meta.env.VITE_WS_DEFAULT_URL;
```

## Security Considerations

For production deployments:

1. **Use HTTPS**: Always use TLS in production
2. **Content Security Policy**: Add CSP headers
3. **Network Isolation**: Deploy on isolated network segment
4. **Access Control**: Use firewall rules
5. **Regular Updates**: Keep dependencies updated

## Performance Optimization

### 1. Code Splitting

Already configured in Vite. Widgets load on demand.

### 2. Asset Optimization

Images and icons are optimized during build.

### 3. Caching

Configure cache headers:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 4. Compression

Enable gzip/brotli compression in your web server.

## Updating

To update to a newer version:

1. Replace the entire folder with the new version
2. Run `npm install` to update dependencies
3. Clear browser cache
4. Rebuild: `npm run build`

## Support

For issues:

1. Check console for errors (F12 in browser)
2. Verify all dependencies are installed
3. Check network connectivity to WebSocket server
4. Review configuration files
5. Check the main README.md and QUICKSTART.md

## Next Steps

After installation:

1. Start the development server: `npm run dev`
2. Visit `http://localhost:8080`
3. Follow the QUICKSTART.md guide
4. Upload a dashboard JSON
5. Configure WebSocket settings
6. Start rendering!

## License

MIT License - see main project for details.
