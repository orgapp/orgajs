import orgaRollup from '@orgajs/rollup';
import react from '@vitejs/plugin-react';
import { promises as fs } from 'fs';
import { globby } from 'globby';
import path from 'path';
import { build as viteBuild } from 'vite';

/**
 * @param {import('../config.js').Config} options
 * this function is used to iterate through all files in the current directory
 * and its subdirectories, and generate a static site using Vite.
 * each .org/.tsx/.jsx file is treated as a page.
 * use vite to build individual html files for each page.
 * use the file path to determine the route.
 * also, for each page, generate a [page_name].[hash].js file that hydrates the page, and attach it to the html file.
 * use @orgajs/rollup as a plugin to handle the .org files.
 * also add necessary plugins to handle .tsx/.jsx files.
 * the preBuild and postBuild hooks are used to run custom scripts before and after the build process.
 * they are commands in string form
 */
export async function build({ outDir = 'out', preBuild = [], postBuild = [] }) {
  // Execute pre-build hooks
  // for (const hook of preBuild) {
  //   await hook();
  // }

  // Find all page files (.org, .tsx, .jsx)
  // Ignore files starting with . or _, also ignore node_modules and out directory
  const files = await globby([
    '**/*.{org,tsx,jsx}',
    '!**/_*/**',
    '!**/_*',
    '!**/.*/**',
    '!**/.*',
    '!node_modules/**',
    '!out/**'
  ]);

  // Check for _components.tsx or _components.jsx file
  const componentFiles = await globby(['_components.tsx', '_components.jsx']);
  const hasComponentsFile = componentFiles.length > 0;
  const componentsFilePath = hasComponentsFile ? path.resolve(componentFiles[0]) : null;

  console.log(hasComponentsFile ? `Found components file: ${componentsFilePath}` : 'No components file found');

  // Create directory if it doesn't exist
  await fs.mkdir(outDir, { recursive: true });

  // Create temp directories for SSR
  const ssrDir = path.join(outDir, '_temp_ssr');
  const entriesDir = path.join(outDir, '_temp_entries');
  await fs.mkdir(ssrDir, { recursive: true });
  await fs.mkdir(entriesDir, { recursive: true });

  // First, build the client-side bundle
  console.log('Building client bundle...');
  /** @type {Object.<string, string>} - Map of entry point names to file paths */
  const clientEntries = {};

  for (const file of files) {
    const fileBaseName = path.basename(file, path.extname(file));
    const relativePath = file.replace(/\.(org|tsx|jsx)$/, '');

    // Generate entry file for client hydration
    const clientEntry = path.join(entriesDir, `${relativePath}.client.jsx`);
    await fs.mkdir(path.dirname(clientEntry), { recursive: true });

    const clientEntryContent = hasComponentsFile
      ? `
        import React from 'react';
        import ReactDOM from 'react-dom/client';
        import Page from '${path.resolve(file)}';
        import * as components from '${componentsFilePath}';

        // Client-side hydration
        window.addEventListener('DOMContentLoaded', () => {
          const root = ReactDOM.hydrateRoot(
            document.getElementById('app'),
            React.createElement(Page, { components })
          );
        });
      `
      : `
        import React from 'react';
        import ReactDOM from 'react-dom/client';
        import Page from '${path.resolve(file)}';

        // Client-side hydration
        window.addEventListener('DOMContentLoaded', () => {
          const root = ReactDOM.hydrateRoot(document.getElementById('app'), React.createElement(Page));
        });
      `;

    await fs.writeFile(clientEntry, clientEntryContent);
    clientEntries[relativePath] = clientEntry;
  }

  // Client build config
  const clientBuildConfig = {
    plugins: [orgaRollup(), react()],
    build: {
      outDir: path.join(outDir, 'assets'),
      emptyOutDir: true,
      rollupOptions: {
        input: clientEntries, // Rollup will handle this object format
        output: {
          entryFileNames: '[name].[hash].js',
          chunkFileNames: 'chunks/[name].[hash].js',
        },
      },
      cssCodeSplit: true,
      minify: true,
      manifest: true, // Generate manifest.json for asset mapping
    },
  };

  // Build client bundle
  await viteBuild(clientBuildConfig);

  // Read the manifest to map routes to assets
  const manifest = JSON.parse(
    await fs.readFile(path.join(outDir, 'assets', '.vite', 'manifest.json'), 'utf-8')
  );

	console.log('Manifest:', manifest);

  // Now build SSR bundle for HTML generation
  console.log('Building SSR bundle...');
  /** @type {Object.<string, string>} - Map of SSR entry point names to file paths */
  const ssrEntries = {};

  for (const file of files) {
    const relativePath = file.replace(/\.(org|tsx|jsx)$/, '');

    // Generate entry file for SSR
    const ssrEntry = path.join(entriesDir, `${relativePath}.server.jsx`);
    await fs.mkdir(path.dirname(ssrEntry), { recursive: true });

    const ssrEntryContent = hasComponentsFile
      ? `
        import React from 'react';
        import { renderToString } from 'react-dom/server';
        import Page from '${path.resolve(file)}';
        import * as components from '${componentsFilePath}';

        export function render() {
          return renderToString(React.createElement(Page, { components }));
        }
      `
      : `
        import React from 'react';
        import { renderToString } from 'react-dom/server';
        import Page from '${path.resolve(file)}';

        export function render() {
          return renderToString(React.createElement(Page));
        }
      `;

    await fs.writeFile(ssrEntry, ssrEntryContent);
    ssrEntries[relativePath] = ssrEntry;
  }

  // SSR build config
  const ssrBuildConfig = {
    plugins: [orgaRollup(), react()],
    build: {
      outDir: ssrDir,
      ssr: true,
      rollupOptions: {
        input: ssrEntries, // Rollup will handle this object format
        output: {
          format: 'esm',
          entryFileNames: '[name].js'
        },
      },
    },
  };

  // Build SSR bundle
  await viteBuild(ssrBuildConfig);

  // Generate HTML files using SSR output
  console.log('Generating static HTML...');
  for (const file of files) {
    const fileBaseName = path.basename(file, path.extname(file));
    const relativePath = file.replace(/\.(org|tsx|jsx)$/, '');

    // Determine output HTML path
    const htmlOutput = path.join(outDir, relativePath === 'index' ? 'index.html' : `${relativePath}/index.html`);
    await fs.mkdir(path.dirname(htmlOutput), { recursive: true });

    // Import the SSR module
    const ssrModule = await import(`file://${path.resolve(ssrDir, `${relativePath}.js`)}?t=${Date.now()}`);
    const renderedContent = ssrModule.render();

    // Find the right entry in the manifest
    const entryKey = `${outDir}/_temp_entries/${relativePath}.client.jsx`;
    const entryAsset = manifest[entryKey];

    console.log(`Looking for manifest entry with key: ${entryKey}`);

    let entryScript = '';
    let cssAssets = [];

    if (entryAsset) {
      console.log(`Found entry asset: ${JSON.stringify(entryAsset)}`);
      entryScript = entryAsset.file;
      cssAssets = entryAsset.css || [];
    } else {
      // Try to find by matching the relative path
      console.warn(`No direct match for ${entryKey}, searching...`);

      const possibleKey = Object.keys(manifest).find(key =>
        key.includes(`/${relativePath}.client.jsx`)
      );

      if (possibleKey) {
        console.log(`Found alternative key: ${possibleKey}`);
        entryScript = manifest[possibleKey].file;
        cssAssets = manifest[possibleKey].css || [];
      } else {
        console.warn(`Could not find entry for ${relativePath} in manifest`);
      }
    }

    // Generate HTML with SSR content and hydration scripts
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileBaseName}</title>
  ${cssAssets.map(css => `<link rel="stylesheet" href="/assets/${css}">`).join('\n  ')}
</head>
<body>
  <div id="app">${renderedContent}</div>
  ${entryScript ? `<script type="module" src="/assets/${entryScript}"></script>` : '<!-- No script found -->'}
</body>
</html>`;

    await fs.writeFile(htmlOutput, htmlContent);
  }

  // Clean up temp directories
  await fs.rm(ssrDir, { recursive: true, force: true });
  await fs.rm(entriesDir, { recursive: true, force: true });

  // Execute post-build hooks
  // for (const hook of postBuild) {
  //   await hook();
  // }

  console.log(`Build completed. Output directory: ${outDir}`);
}

/**
 * @param {import("fs").PathLike} dir
 */
export async function clean(dir) {
	await fs.rm(dir, { recursive: true })
}
