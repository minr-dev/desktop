import dotenv from 'dotenv';

const envPath = '.env';
dotenv.config({ path: envPath, debug: true });

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN_FOR_DEVELOP;

module.exports = {
  schema: {
    'https://api.github.com/graphql': {
      headers: {
        Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
        'User-Agent': 'minr-desktop',
      },
    },
  },
  documents: './src/main/graphql/**/*.graphql',
  extensions: {
    codegen: {
      overwrite: true,
      generates: {
        './src/main/dto/generated/graphql/types.ts': {
          plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
          config: {
            scalars: {
              Date: 'string',
              DateTime: 'string',
              URI: 'string',
            },
            skipTypename: true,
            onlyOperationTypes: true,
          },
        },
      },
    },
  },
};
