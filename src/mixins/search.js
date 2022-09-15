import { i18n } from '@/plugins/i18n.js'

const operators = {
  and: {
    text: () => i18n.t('operatorsAnd'),
    value: 'and'
  },
  or: {
    text: () => i18n.t('operatorsOr'),
    value: 'or'
  }
}

const comparators = {
  contains: {
    text: () => i18n.t('comparatorsContains'),
    values: 1
  },
  equals: {
    text: () => i18n.t('comparatorsEqual'),
    values: 1
  },
  isNull: {
    text: () => i18n.t('comparatorsIsNull'),
    value: 0
  },
  between: {
    text: () => i18n.t('comparatorsBetween'),
    values: 2
  },
  greaterThan: {
    text: () => i18n.t('comparatorsGreaterThan'),
    values: 1
  },
  greaterOrEquals: {
    text: () => i18n.t('comparatorsGreaterThanOrEquals'),
    values: 1
  },
  lessThan: {
    text: () => i18n.t('comparatorsLessThan'),
    values: 1
  },
  lessOrEquals: {
    text: () => i18n.t('comparatorsLessThanOrEquals'),
    values: 1
  },
  inSet: {
    text: () => i18n.t('comparatorsInSet'),
    values: 1
  },
  jsonSearch: {
    text: () => i18n.t('comparatorsJsonSearch'),
    values: 1
  }
}

export {
  comparators,
  operators
}
