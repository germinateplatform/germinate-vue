import { i18n } from '@/plugins/vuetify.ts'
import { FilterComparator } from '../types/germinate'

const operators = {
  and: {
    text: () => i18n.global.t('operatorsAnd'),
    value: 'and',
  },
  or: {
    text: () => i18n.global.t('operatorsOr'),
    value: 'or',
  },
}

const getComparatorConfig = (comparator: FilterComparator) => {
  switch (comparator) {
    case FilterComparator.contains:
      return {
        text: () => i18n.global.t('comparatorsContains'),
        values: 1,
      }
    case FilterComparator.equals:
      return {
        text: () => i18n.global.t('comparatorsEqual'),
        values: 1,
      }
    case FilterComparator.isNull:
      return {
        text: () => i18n.global.t('comparatorsIsNull'),
        value: 0,
      }
    case FilterComparator.isNotNull:
      return {
        text: () => i18n.global.t('comparatorsIsNotNull'),
        value: 0,
      }
    case FilterComparator.between:
      return {
        text: () => i18n.global.t('comparatorsBetween'),
        values: 2,
      }
    case FilterComparator.greaterThan:
      return {
        text: () => i18n.global.t('comparatorsGreaterThan'),
        values: 1,
      }
    case FilterComparator.greaterOrEquals:
      return {
        text: () => i18n.global.t('comparatorsGreaterThanOrEquals'),
        values: 1,
      }
    case FilterComparator.lessThan:
      return {
        text: () => i18n.global.t('comparatorsLessThan'),
        values: 1,
      }
    case FilterComparator.lessOrEquals:
      return {
        text: () => i18n.global.t('comparatorsLessThanOrEquals'),
        values: 1,
      }
    case FilterComparator.inSet:
      return {
        text: () => i18n.global.t('comparatorsInSet'),
        values: 1,
      }
    case FilterComparator.jsonSearch:
      return {
        text: () => i18n.global.t('comparatorsJsonSearch'),
        values: 1,
      }
    case FilterComparator.arrayContains:
      return {
        text: () => i18n.global.t('comparatorsArrayContains'),
        values: 1,
      }
  }
}

const comparators = {
  contains: {
    text: () => i18n.global.t('comparatorsContains'),
    values: 1,
  },
  equals: {
    text: () => i18n.global.t('comparatorsEqual'),
    values: 1,
  },
  isNull: {
    text: () => i18n.global.t('comparatorsIsNull'),
    values: 0,
  },
  isNotNull: {
    text: () => i18n.global.t('comparatorsIsNotNull'),
    values: 0,
  },
  between: {
    text: () => i18n.global.t('comparatorsBetween'),
    values: 2,
  },
  greaterThan: {
    text: () => i18n.global.t('comparatorsGreaterThan'),
    values: 1,
  },
  greaterOrEquals: {
    text: () => i18n.global.t('comparatorsGreaterThanOrEquals'),
    values: 1,
  },
  startsWith: {
    text: () => i18n.global.t('comparatorsStartsWith'),
    values: 1,
  },
  endsWith: {
    text: () => i18n.global.t('comparatorsEndsWith'),
    values: 1,
  },
  lessThan: {
    text: () => i18n.global.t('comparatorsLessThan'),
    values: 1,
  },
  lessOrEquals: {
    text: () => i18n.global.t('comparatorsLessThanOrEquals'),
    values: 1,
  },
  inSet: {
    text: () => i18n.global.t('comparatorsInSet'),
    values: 1,
  },
  jsonSearch: {
    text: () => i18n.global.t('comparatorsJsonSearch'),
    values: 1,
  },
  arrayContains: {
    text: () => i18n.global.t('comparatorsArrayContains'),
    values: 1,
  },
}

export {
  getComparatorConfig,
  comparators,
  operators,
}
