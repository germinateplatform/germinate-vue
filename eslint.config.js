import vuetify from 'eslint-config-vuetify'
import vueI18n from '@intlify/eslint-plugin-vue-i18n'

export default [
  ...(await vuetify({
    rules: {
      '@stylistic/quote-props': 'off',
      '@typescript-eslint/member-ordering': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-exports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'unicorn/prefer-native-coercion-functions': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/switch-case-braces': 'off',
      'unicorn/prefer-ternary': 'off',
      'unicorn/prefer-split-limit': 'off',
      'unicorn/prefer-structured-clone': 'off',
      'unicorn/no-negated-condition': 'off',
      'unicorn/no-new-array': 'off',
      'unicorn/no-for-loop': 'off',
      'unicorn/prefer-single-call': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/catch-error-name': 'off',
      'unicorn/prefer-includes-over-repeated-comparisons': 'off',
      'unicorn/no-document-cookie': 'off',
      'unicorn/no-array-sort': 'off',
      'unicorn/prefer-modern-math-apis': 'off',
      'unicorn/prefer-at': 'off',
      'unicorn/no-static-only-class': 'off',
      'unicorn/prefer-dom-node-append': 'off',
      'unicorn/prefer-dom-node-remove': 'off',
      'unicorn/prefer-query-selector': 'off',
      'unicorn/no-this-outside-of-class': 'off',
      'vue/attributes-order': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/order-in-components': 'off',
      'vue/padding-line-between-tags': 'off',
    },
  })),
  ...vueI18n.configs.recommended,
  {
    settings: {
      'vue-i18n': {
        // Adjust to wherever your locale files live
        localeDir: './src/plugins/i18n/*.{json,json5,yaml,yml}',
        messageSyntaxVersion: '^9.0.0', // vue-i18n v9+
      },
    },
  },
  {
    files: ['**/*.{js,ts,vue}'],
    rules: {
      // Key used in code ($t('foo'), t('foo')) but not defined in locale files
      '@intlify/vue-i18n/no-missing-keys': 'error',
      // Key exists in some locales but is missing in others
      '@intlify/vue-i18n/no-missing-keys-in-other-locales': 'error',
      // Optional: keys defined in locale files but never used
      '@intlify/vue-i18n/no-unused-keys': 'warn',
      '@intlify/vue-i18n/no-html-messages': 'off',
      '@intlify/vue-i18n/no-v-html': 'off',
    },
  },
]
