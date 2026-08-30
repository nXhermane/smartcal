import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid({
  title: 'SmartCal',
  description: 'Ultra High-Performance Mathematical & Logical Expression Engine for TypeScript / JavaScript',
  lang: 'fr-FR',
  base: '/smartcal/',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/smartcal-favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
    ['meta', { name: 'description', content: 'Ultra-high-performance mathematical expression engine with JIT compilation (~2.5M+ ops/s), CSP-safe VM mode, Pratt parser, and zero dependencies.' }],
    ['meta', { name: 'keywords', content: 'expression engine, math parser, formula evaluator, JIT compiler, CSP-safe, TypeScript, zero dependencies, Pratt parser, no-eval' }],
    ['meta', { property: 'og:title', content: 'SmartCal — Ultra-High Performance Expression Engine' }],
    ['meta', { property: 'og:description', content: 'Evaluate mathematical expressions at ~2.5M+ ops/s. JIT compilation + CSP-safe VM. Zero dependencies.' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ],

  themeConfig: {
    logo: {
      light: '/smartcal-logo-light.svg',
      dark: '/smartcal-logo-dark.svg',
      alt: 'SmartCal Logo',
    },
    siteTitle: 'SmartCal',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/smartcal' },
      { text: 'Architecture & Théorie', link: '/internals/architecture' },
      { text: 'Benchmarks', link: '/internals/benchmarks' },
      {
        text: 'v1.1.0',
        items: [
          { text: 'Changelog', link: 'https://github.com/nXhermane/smartcal/blob/master/CHANGELOG.md' },
          { text: 'GitHub Repository', link: 'https://github.com/nXhermane/smartcal' },
        ],
      },
      {
        text: 'Français',
        items: [
          { text: 'Français', link: '/' },
          { text: 'English', link: '/en/' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction & Guide',
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Prise en main rapide', link: '/guide/getting-started' },
            { text: 'Syntaxe & Opérateurs', link: '/guide/syntax-and-operators' },
            { text: 'Sous-Formules & DAG (f_*)', link: '/guide/sub-formulas-and-dag' },
            { text: 'Fonctions Mathématiques', link: '/guide/custom-functions' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'Référence API',
          collapsed: false,
          items: [
            { text: 'SmartCal()', link: '/api/smartcal' },
            { text: 'compile() & JIT/VM', link: '/api/compile' },
            { text: 'isValidExpression()', link: '/api/is-valid-expression' },
            { text: 'FunctionRegistry', link: '/api/function-registry' },
            { text: 'Gestion des Erreurs', link: '/api/errors' },
          ],
        },
      ],
      '/internals/': [
        {
          text: 'Architecture & Compilateur',
          collapsed: false,
          items: [
            { text: 'Architecture du Moteur', link: '/internals/architecture' },
            { text: 'Scanner & Pratt Parser', link: '/internals/pratt-parser' },
            { text: 'Compilateur JIT vs Fast VM', link: '/internals/jit-and-vm' },
            { text: 'Mesures & Benchmarks', link: '/internals/benchmarks' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nXhermane/smartcal' },
    ],

    footer: {
      message: 'Distribué sous licence MIT / ISC.',
      copyright: `Copyright © ${new Date().getFullYear()}-présent nXhermane`,
    },

    search: {
      provider: 'local',
    },
  },

  locales: {
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'SmartCal',
      description: 'Ultra High-Performance Mathematical & Logical Expression Engine for TypeScript / JavaScript',
      themeConfig: {
        siteTitle: 'SmartCal',

        nav: [
          { text: 'Guide', link: '/en/guide/getting-started' },
          { text: 'API Reference', link: '/en/api/smartcal' },
          { text: 'Architecture & Theory', link: '/en/internals/architecture' },
          { text: 'Benchmarks', link: '/en/internals/benchmarks' },
          {
            text: 'v1.1.0',
            items: [
              { text: 'Changelog', link: 'https://github.com/nXhermane/smartcal/blob/master/CHANGELOG.md' },
              { text: 'GitHub Repository', link: 'https://github.com/nXhermane/smartcal' },
            ],
          },
          {
            text: 'English',
            items: [
              { text: 'Français', link: '/' },
              { text: 'English', link: '/en/' },
            ],
          },
        ],

        sidebar: {
          '/en/guide/': [
            {
              text: 'Introduction & Guide',
              collapsed: false,
              items: [
                { text: 'Introduction', link: '/en/guide/introduction' },
                { text: 'Getting Started', link: '/en/guide/getting-started' },
                { text: 'Syntax & Operators', link: '/en/guide/syntax-and-operators' },
                { text: 'Sub-Formulas & DAG (f_*)', link: '/en/guide/sub-formulas-and-dag' },
                { text: 'Math Functions', link: '/en/guide/custom-functions' },
              ],
            },
          ],
          '/en/api/': [
            {
              text: 'API Reference',
              collapsed: false,
              items: [
                { text: 'SmartCal()', link: '/en/api/smartcal' },
                { text: 'compile() & JIT/VM', link: '/en/api/compile' },
                { text: 'isValidExpression()', link: '/en/api/is-valid-expression' },
                { text: 'FunctionRegistry', link: '/en/api/function-registry' },
                { text: 'Error Handling', link: '/en/api/errors' },
              ],
            },
          ],
          '/en/internals/': [
            {
              text: 'Architecture & Compiler',
              collapsed: false,
              items: [
                { text: 'Engine Architecture', link: '/en/internals/architecture' },
                { text: 'Scanner & Pratt Parser', link: '/en/internals/pratt-parser' },
                { text: 'JIT Compiler vs Fast VM', link: '/en/internals/jit-and-vm' },
                { text: 'Metrics & Benchmarks', link: '/en/internals/benchmarks' },
              ],
            },
          ],
        },

        socialLinks: [
          { icon: 'github', link: 'https://github.com/nXhermane/smartcal' },
        ],

        footer: {
          message: 'Released under MIT / ISC License.',
          copyright: `Copyright © ${new Date().getFullYear()}-present nXhermane & Contributors`,
        },

        search: {
          provider: 'local',
        },
      },
    },
  },

  mermaid: {
    theme: 'base',
    themeVariables: {
      primaryColor: '#eef2ff',
      primaryTextColor: '#312e81',
      primaryBorderColor: '#6366f1',
      lineColor: '#6366f1',
      secondaryColor: '#f0fdf4',
      tertiaryColor: '#faf5ff',
      tertiaryBorderColor: '#a855f7',
      tertiaryTextColor: '#581c87',
      edgeLabelBackground: '#ffffff',
    },
    themeCSS: `
      .dark .mermaid {
        --primary-color: #1e1b4b;
        --primary-text-color: #e0e7ff;
        --primary-border-color: #818cf8;
        --line-color: #818cf8;
        --secondary-color: #064e3b;
        --tertiary-color: #3b0764;
        --tertiary-border-color: #c084fc;
        --tertiary-text-color: #f3e8ff;
        --edge-label-background: #1e293b;
      }
    `,
  },

  vite: {
    optimizeDeps: {
      include: ['mermaid', 'fastdom', 'dayjs'],
    },
    ssr: {
      noExternal: ['mermaid', 'vitepress-plugin-mermaid'],
    },
  },
});
