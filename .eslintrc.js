module.exports = {
    'env': {
        'es2021': true,
        'node': true,
    },
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'google',
    ],
    'overrides': [
        {
            'files': [
                '.eslintrc.{js,cjs}',
            ],
            'parserOptions': {
                'sourceType': 'script',
            },
        },
        {
            'files': [
                'test/app/dist/**/*.{js,cjs}',
            ],
            'parserOptions': {
                'sourceType': 'script',
            },
            'rules': {
                '@typescript-eslint/no-var-requires': 0,
            },
        },
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 'latest',
        'sourceType': 'module',
    },
    'plugins': [
        '@typescript-eslint',
    ],
    'rules': {
        'indent': ['error', 4],
        'max-len': ['error', 120],
        'require-jsdoc': 0,
        'linebreak-style': ['error', 'unix'],
    },
    'ignorePatterns': [
        'dist/*',
    ],
};
