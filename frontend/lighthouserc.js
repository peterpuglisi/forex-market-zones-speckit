// Lighthouse CI baseline config (Principle IV — performance MUST be verified via CI benchmark)
// Run against static export: npm run build produces ./out
// TTI threshold is 3000ms for local baseline; tighten to 2000ms in production CI.
module.exports = {
  ci: {
    collect: {
      staticDistDir: './out',
      url: ['http://localhost/index.html'],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'interactive': ['warn', { maxNumericValue: 3000 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
