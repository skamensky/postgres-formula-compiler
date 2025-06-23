# Deployment Documentation

## GitHub Pages Automated Deployment

This project uses GitHub Actions to automatically deploy to GitHub Pages whenever code is pushed to the `main` branch.

### Setup Instructions

1. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set "Source" to "GitHub Actions"

2. **Workflow Configuration**
   - The workflow file is located at `.github/workflows/deploy-pages.yml`
   - Triggers on push to `main` branch
   - Can also be triggered manually from Actions tab

3. **Build Process**
   - Installs Node.js dependencies with `npm ci`
   - Runs `npm run build` to compile frontend modules
   - Deploys `web/public/` directory to GitHub Pages

### Workflow Features

- **Automatic Deployment**: No manual intervention needed
- **Build Optimization**: Uses npm cache for faster builds
- **Concurrent Deployment Protection**: Prevents conflicts
- **Manual Trigger**: Can be run manually if needed

### Accessing the Live Demo

Once deployed, the application will be available at:
```
https://skamensky.github.io/js-to-sql/
```

### Local Development

For local development and testing:

```bash
# Install dependencies
npm install

# Build frontend modules
npm run build

# Start development server
npm run dev

# Open http://localhost:3000
```

### Troubleshooting

**Common Issues:**

1. **Build Failures**
   - Check that all dependencies are listed in `package.json`
   - Ensure `npm run build` works locally

2. **Pages Not Loading**
   - Verify GitHub Pages is enabled in repository settings
   - Check that the workflow completed successfully
   - Ensure the repository is public (or you have GitHub Pro)

3. **Asset Loading Issues**
   - Check that relative paths are correct in the built files
   - Verify that the build process copies all necessary files

### Build Process Details

The build script (`scripts/build-frontend.js`) performs:

1. **Module Copying**: Copies `src/` files to `web/public/modules/compiler/`
2. **Tooling Integration**: Copies `tooling/` files to `web/public/modules/tooling/`
3. **Import Path Transformation**: Updates import paths for browser compatibility
4. **Example Extraction**: Processes `.formula` files from `examples/` directory
5. **Module Generation**: Creates browser-compatible ES6 modules

### Deployment Architecture

```
Repository Root
├── .github/workflows/
│   └── deploy-pages.yml       # GitHub Actions workflow
├── web/public/                # Static files for deployment
│   ├── index.html            # Main application
│   ├── styles.css            # Styling
│   ├── browser-script.js     # Main application script
│   └── modules/              # Generated modules (from build)
│       ├── compiler/         # Core compiler modules
│       ├── tooling/          # Developer tooling
│       └── shared/           # Shared utilities
```

The deployment process ensures that all necessary files are built and copied to the `web/public/` directory, which is then served by GitHub Pages as a static website.