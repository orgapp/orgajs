import orgaRollup from '@orgajs/rollup';
import react from '@vitejs/plugin-react';
import { promises as fs } from 'fs';
import { globby } from 'globby';
import path from 'path';
import { build as viteBuild } from 'vite';

/**
 * Find all layout files and map them to directories they affect
 * @param {string} rootDir - Root directory to search from
 * @returns {Promise<Map<string, string>>} - Map of directory paths to layout file paths
 */
async function findLayoutFiles(rootDir = process.cwd()) {
  const layoutFiles = await globby([
    '**/_layout.{tsx,jsx}',
    '!node_modules/**',
    '!out/**'
  ]);

  // Create a map of directory -> layout file
  const layoutMap = new Map();

  for (const layoutFile of layoutFiles) {
    const layoutDir = path.dirname(layoutFile);
    layoutMap.set(layoutDir, path.resolve(layoutFile));
  }

  return layoutMap;
}

/**
 * Get all layout files that apply to a specific file path
 * @param {string} filePath - Path of the file
 * @param {Map<string, string>} layoutMap - Map of directories to layout files
 * @returns {string[]} - Array of layout file paths that should wrap this file, in order
 */
function getLayoutsForFile(filePath, layoutMap) {
  const fileDir = path.dirname(filePath);
	/**
	 * @type {string[]}
	 */
  const layouts = [];

  // Split the directory into segments
  let currentPath = fileDir;
  let lastPath = null;

  // Traverse up the directory tree to find all applicable layouts
  while (currentPath !== lastPath) {
		const layoutFile = layoutMap.get(currentPath);
		if (layoutFile) {
			layouts.push(layoutFile);
		}

    lastPath = currentPath;
    currentPath = path.dirname(currentPath);
  }

  // Check for root layout
	const rootLayoutFile = layoutMap.get(path.resolve('.'));
	if (rootLayoutFile) {
		layouts.push(rootLayoutFile);
	}

  // Reverse the array to get parent layouts first, then child layouts
  return layouts.reverse();
}

/**
 * Generate entry file content for client or server
 * @param {Object} options - Options for generating entry file
 * @param {string} options.file - Source file path
 * @param {string[]} options.layouts - Layout files to apply
 * @param {string?} [options.componentsFilePath] - Path to components file (if any)
 * @param {boolean} options.isServer - Whether this is a server entry
 * @returns {string} - Generated entry file content
 */
function generateEntryContent({ file, layouts = [], componentsFilePath = null, isServer = false }) {
  const hasComponentsFile = !!componentsFilePath;
  const hasLayouts = layouts.length > 0;

  // Common imports for both client and server
  let imports = `
    import React from 'react';
    import ${isServer ? '{ renderToString }' : 'ReactDOM'} from 'react-dom${isServer ? '/server' : ''}';
    import Page from '${path.resolve(file)}';
    ${hasComponentsFile ? `import * as components from '${componentsFilePath}';` : ''}
  `;

  if (hasLayouts) {
    // Add layout imports
    imports += layouts.map((layoutFile, i) => `import Layout${i} from '${layoutFile}';`).join('\n');
  }

  // Content specific to server or client
  if (isServer) {
    // Server entry (SSR)
    if (hasLayouts) {
      return `${imports}

      export function render() {
        const content = React.createElement(Page, ${hasComponentsFile ? '{ components }' : '{}'});
        return renderToString(
          ${layouts.reduce((acc, _, i) =>
            `React.createElement(Layout${i}, ${hasComponentsFile ? '{ components }' : '{}'}, ${acc})`,
            'content'
          )}
        );
      }`;
    } else {
      return `${imports}

      export function render() {
        return renderToString(React.createElement(Page, ${hasComponentsFile ? '{ components }' : '{}'}));
      }`;
    }
  } else {
    // Client entry (hydration)
    if (hasLayouts) {
      return `${imports}

      // Client-side hydration
      window.addEventListener('DOMContentLoaded', () => {
        const content = React.createElement(Page, ${hasComponentsFile ? '{ components }' : '{}'});

        const root = ReactDOM.hydrateRoot(
          document.getElementById('app'),
          ${layouts.reduce((acc, _, i) =>
            `React.createElement(Layout${i}, ${hasComponentsFile ? '{ components }' : '{}'}, ${acc})`,
            'content'
          )}
        );
      });`;
    } else {
      return `${imports}

      // Client-side hydration
      window.addEventListener('DOMContentLoaded', () => {
        const root = ReactDOM.hydrateRoot(
          document.getElementById('app'),
          React.createElement(Page, ${hasComponentsFile ? '{ components }' : '{}'})
        );
      });`;
    }
  }
}

/**
 * Find CSS assets for a file from the manifest
 * @param {Object} options - Options for collecting CSS
 * @param {string} options.entryKey - Entry key in the manifest
 * @param {Object} options.manifest - The manifest object
 * @param {string} options.relativePath - Relative path to the file
 * @param {string[]} options.layouts - Layout files to apply
 * @returns {Object} - Entry script and CSS assets
 */
function collectAssets({ entryKey, manifest, relativePath, layouts = [] }) {
  let entryScript = '';
  let cssAssets = [];

  // Try to find entry by exact key
  const entryAsset = manifest[entryKey];
  if (entryAsset) {
    entryScript = entryAsset.file;
    cssAssets = entryAsset.css || [];
  } else {
    // Try to find by matching the relative path
    const possibleKey = Object.keys(manifest).find(key =>
      key.includes(`/${relativePath}.client.jsx`)
    );

    if (possibleKey) {
      entryScript = manifest[possibleKey].file;
      cssAssets = manifest[possibleKey].css || [];
    }
  }

  // Collect CSS assets from layout files
  if (layouts.length > 0) {
    for (const layoutFile of layouts) {
      // Find the layout in the manifest
      const layoutRelativePath = path.relative(process.cwd(), layoutFile).replace(/\.(tsx|jsx)$/, '');

      // Look for layout files in the manifest
      for (const key in manifest) {
        const asset = manifest[key];

        // Check if this asset is related to the layout file
        if (key.includes(layoutRelativePath) ||
            (asset.src && asset.src.includes(layoutRelativePath))) {
          // Add any CSS from this layout
          if (asset.css && asset.css.length > 0) {
            cssAssets.push(...asset.css);
          }
        }

        // Also check in imports if the layout might be imported there
        if (asset.imports && asset.imports.length > 0) {
          // Look for imported chunks that might contain our layout's CSS
          const layoutImportedChunks = asset.imports.filter(importName =>
            manifest[importName] && manifest[importName].css && manifest[importName].css.length > 0);

          for (const chunk of layoutImportedChunks) {
            cssAssets.push(...(manifest[chunk].css || []));
          }
        }
      }
    }
  }

  // Remove duplicates from cssAssets
  return {
    entryScript,
    cssAssets: [...new Set(cssAssets)]
  };
}

/**
 * Generate HTML content
 * @param {Object} options - Options for generating HTML
 * @param {string} options.title - Page title
 * @param {string} options.renderedContent - Rendered SSR content
 * @param {string[]} options.cssAssets - CSS assets to include
 * @param {string} options.entryScript - Entry script to include
 * @returns {string} - HTML content
 */
function generateHtml({ title, renderedContent, cssAssets, entryScript }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${cssAssets.map(css => `<link rel="stylesheet" href="/assets/${css}">`).join('\n  ')}
</head>
<body>
  <div id="app">${renderedContent}</div>
  ${entryScript ? `<script type="module" src="/assets/${entryScript}"></script>` : '<!-- No script found -->'}
</body>
</html>`;
}

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

  // Get applicable layouts for each file
  console.log('Finding layout files...');
  const layoutMap = await findLayoutFiles();
  console.log(`Found ${layoutMap.size} layout files`);

  // Create temp directories
  const ssrDir = path.join(outDir, '_temp_ssr');
  const entriesDir = path.join(outDir, '_temp_entries');
  await fs.mkdir(outDir, { recursive: true });
  await fs.mkdir(ssrDir, { recursive: true });
  await fs.mkdir(entriesDir, { recursive: true });

  // First pass: Generate client entries
  console.log('Building client bundle...');
  /** @type {Object.<string, string>} - Map of entry point names to file paths */
  const clientEntries = {};

  for (const file of files) {
    const relativePath = file.replace(/\.(org|tsx|jsx)$/, '');
    const layouts = getLayoutsForFile(file, layoutMap);

    // Generate entry file for client hydration
    const clientEntry = path.join(entriesDir, `${relativePath}.client.jsx`);
    await fs.mkdir(path.dirname(clientEntry), { recursive: true });

    const clientEntryContent = generateEntryContent({
      file,
      layouts,
      componentsFilePath,
      isServer: false
    });

    await fs.writeFile(clientEntry, clientEntryContent);
    clientEntries[relativePath] = clientEntry;
  }

  // Build client bundle
  await viteBuild({
    plugins: [orgaRollup(), react()],
    build: {
      outDir: path.join(outDir, 'assets'),
      emptyOutDir: true,
      rollupOptions: {
        input: clientEntries,
        output: {
          entryFileNames: '[name].[hash].js',
          chunkFileNames: 'chunks/[name].[hash].js',
        },
      },
      cssCodeSplit: true,
      minify: true,
      manifest: true,
    }
  });

  // Second pass: Generate SSR entries
  console.log('Building SSR bundle...');
  /** @type {Object.<string, string>} - Map of SSR entry point names to file paths */
  const ssrEntries = {};

  for (const file of files) {
    const relativePath = file.replace(/\.(org|tsx|jsx)$/, '');
    const layouts = getLayoutsForFile(file, layoutMap);

    // Generate entry file for SSR
    const ssrEntry = path.join(entriesDir, `${relativePath}.server.jsx`);
    await fs.mkdir(path.dirname(ssrEntry), { recursive: true });

    const ssrEntryContent = generateEntryContent({
      file,
      layouts,
      componentsFilePath,
      isServer: true
    });

    await fs.writeFile(ssrEntry, ssrEntryContent);
    ssrEntries[relativePath] = ssrEntry;
  }

  // Build SSR bundle
  await viteBuild({
    plugins: [orgaRollup(), react()],
    build: {
      outDir: ssrDir,
      ssr: true,
      rollupOptions: {
        input: ssrEntries,
        output: {
          format: 'esm',
          entryFileNames: '[name].js'
        },
      },
    }
  });

  // Read the manifest
  const manifest = JSON.parse(
    await fs.readFile(path.join(outDir, 'assets', '.vite', 'manifest.json'), 'utf-8')
  );

  // Third pass: Generate HTML files
  console.log('Generating static HTML...');
  for (const file of files) {
    const fileBaseName = path.basename(file, path.extname(file));
    const relativePath = file.replace(/\.(org|tsx|jsx)$/, '');
    const layouts = getLayoutsForFile(file, layoutMap);

    // Determine output HTML path and ensure directory exists
    const htmlOutput = path.join(outDir, relativePath === 'index' ? 'index.html' : `${relativePath}/index.html`);
    await fs.mkdir(path.dirname(htmlOutput), { recursive: true });

    // Import the SSR module
    const ssrModule = await import(`file://${path.resolve(ssrDir, `${relativePath}.js`)}?t=${Date.now()}`);
    const renderedContent = ssrModule.render();

    // Collect assets (JS and CSS)
    const entryKey = `${outDir}/_temp_entries/${relativePath}.client.jsx`;
    const { entryScript, cssAssets } = collectAssets({
      entryKey,
      manifest,
      relativePath,
      layouts
    });

    // Generate and write HTML
    const htmlContent = generateHtml({
      title: fileBaseName,
      renderedContent,
      cssAssets,
      entryScript
    });

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
