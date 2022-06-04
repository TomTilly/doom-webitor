module.exports = {
   root: true,
   parser: '@typescript-eslint/parser',
   parserOptions: {
      tsconfigRootDir: __dirname,
      project: ['./tsconfig.json'],
   },
   plugins: ['@typescript-eslint', 'prettier'],
   extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'prettier',
   ],
   rules: {
      'prettier/prettier': [
         'error',
         {
            trailingComma: 'es5',
            singleQuote: true,
            printWidth: 80,
            tabWidth: 3,
         },
      ],
   },
};
