import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import compress from 'astro-compress';
import { VitePWA } from 'vite-plugin-pwa';

// Performance-optimized Astro configuration
export default defineConfig({
  integrations: [
    // React integration for islands architecture
    react({
      // Only include essential React features
      include: ['**/islands/**/*', '**/components/**/*'],
      // Optimize React for production
      experimentalReactChildren: true
    }),

    // MDX for optimized content processing
    mdx({
      optimize: true,
      remarkPlugins: [],
      rehypePlugins: [],
      // Enable GFM for GitHub-flavored markdown
      gfm: true,
      // Optimize syntax highlighting
      syntaxHighlight: 'prism'
    }),

    // Aggressive compression for all assets
    compress({
      CSS: {
        csso: {
          restructure: true,
          forceMediaMerge: true,
          comments: false
        }
      },
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
          collapseWhitespace: true,
          conservativeCollapse: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          minifyCSS: true,
          minifyJS: true
        }
      },
      Image: {
        // Enable aggressive image optimization
        webp: { quality: 85 },
        avif: { quality: 80 },
        jpeg: { quality: 85 },
        png: { quality: 90 }
      },
      JavaScript: {
        terser: {
          compress: {
            dead_code: true,
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info'],
            passes: 2
          },
          mangle: {
            safari10: true
          },
          format: {
            comments: false
          }
        }
      },
      SVG: {
        svgo: {
          plugins: [
            'removeDoctype',
            'removeXMLProcInst',
            'removeComments',
            'removeMetadata',
            'removeUselessDefs',
            'removeEditorsNSData',
            'removeEmptyAttrs',
            'removeHiddenElems',
            'removeEmptyText',
            'removeEmptyContainers'
          ]
        }
      }
    })
  ],

  // Output configuration for optimal performance
  output: 'static',

  // Build configuration
  build: {
    // Enable aggressive asset inlining for small files
    inlineStylesheets: 'auto',
    // Split large chunks for better caching
    split: true,
    // Target modern browsers for smaller bundles
    format: 'esm'
  },

  // Vite configuration for performance
  vite: {
    plugins: [
      // PWA for caching and offline support
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,avif}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                }
              }
            },
            {
              urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'cdn-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 90 // 90 days
                }
              }
            }
          ]
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          name: 'Claude Multi-Agent Learning Lab',
          short_name: 'Learning Lab',
          description: 'Interactive web interface for multi-agent orchestration learning',
          theme_color: '#3b82f6',
          background_color: '#f8fafc',
          display: 'standalone',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],

    build: {
      // Optimize for performance
      target: 'esnext',
      minify: 'terser',
      sourcemap: false, // Disable in production for size

      // Split chunks optimally
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate vendor chunks for better caching
            'react-vendor': ['react', 'react-dom'],
            'markdown-vendor': ['marked', 'dompurify'],
            'utils': ['nanoid', 'fuse.js'] // If we add search
          },

          // Optimize chunk names for caching
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      },

      // Enable aggressive tree shaking
      terserOptions: {
        compress: {
          pure_funcs: ['console.log'],
          drop_console: true,
          drop_debugger: true,
          passes: 2
        }
      }
    },

    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'marked', 'dompurify'],
      exclude: ['@astrojs/react']
    },

    // Define production environment variables
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  },

  // Experimental features for performance
  experimental: {
    // Enable content collections for optimized markdown processing
    contentCollections: true,
    // Enable view transitions for SPA-like navigation
    viewTransitions: true
  },

  // Content collections configuration
  content: {
    // Enable content layer caching
    cache: true
  },

  // Image optimization
  image: {
    domains: [],
    remotePatterns: [],
    // Configure image service for optimal formats
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
        formats: ['webp', 'avif', 'jpeg'],
        quality: 85
      }
    }
  },

  // Server configuration for development
  server: {
    port: 3000,
    host: true
  },

  // Preview configuration
  preview: {
    port: 3000,
    host: true
  },

  // Security headers
  security: {
    checkOrigin: true
  },

  // Prefetch configuration for better navigation
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  }
});