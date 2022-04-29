module.exports = {
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
        releaseRules: [
          {
            type: 'patch',
            release: 'patch',
          },
          {
            type: 'fix',
            release: 'patch',
          },
          {
            type: 'feat',
            release: 'minor',
          },
          {
            type: 'breaking',
            release: 'major',
          },
        ],
      },
    ],
  ],
};
