import { FilterComparator, type FilterOperator } from '@/plugins/types/germinate'
import type { TextState, ValueState } from './types'

export interface ValuesState {
  values: number
}

const operators: Record<FilterOperator, TextState & ValueState> = {
  and: {
    text: 'operatorsAnd',
    value: 'and',
  },
  or: {
    text: 'operatorsOr',
    value: 'or',
  },
}

function getComparatorConfig (comparator: FilterComparator): (TextState & ValuesState) | undefined {
  switch (comparator) {
    case FilterComparator.contains:
      return {
        text: 'comparatorsContains',
        values: 1,
      }
    case FilterComparator.equals:
      return {
        text: 'comparatorsEqual',
        values: 1,
      }
    case FilterComparator.isNull:
      return {
        text: 'comparatorsIsNull',
        values: 0,
      }
    case FilterComparator.isNotNull:
      return {
        text: 'comparatorsIsNotNull',
        values: 0,
      }
    case FilterComparator.between:
      return {
        text: 'comparatorsBetween',
        values: 2,
      }
    case FilterComparator.greaterThan:
      return {
        text: 'comparatorsGreaterThan',
        values: 1,
      }
    case FilterComparator.greaterOrEquals:
      return {
        text: 'comparatorsGreaterThanOrEquals',
        values: 1,
      }
    case FilterComparator.lessThan:
      return {
        text: 'comparatorsLessThan',
        values: 1,
      }
    case FilterComparator.lessOrEquals:
      return {
        text: 'comparatorsLessThanOrEquals',
        values: 1,
      }
    case FilterComparator.inSet:
      return {
        text: 'comparatorsInSet',
        values: 1,
      }
    case FilterComparator.jsonSearch:
      return {
        text: 'comparatorsJsonSearch',
        values: 1,
      }
    case FilterComparator.arrayContains:
      return {
        text: 'comparatorsArrayContains',
        values: 1,
      }
  }
}

const comparators: Record<FilterComparator, TextState & ValuesState> = {
  contains: {
    text: 'comparatorsContains',
    values: 1,
  },
  equals: {
    text: 'comparatorsEqual',
    values: 1,
  },
  isNull: {
    text: 'comparatorsIsNull',
    values: 0,
  },
  isNotNull: {
    text: 'comparatorsIsNotNull',
    values: 0,
  },
  between: {
    text: 'comparatorsBetween',
    values: 2,
  },
  greaterThan: {
    text: 'comparatorsGreaterThan',
    values: 1,
  },
  greaterOrEquals: {
    text: 'comparatorsGreaterThanOrEquals',
    values: 1,
  },
  startsWith: {
    text: 'comparatorsStartsWith',
    values: 1,
  },
  endsWith: {
    text: 'comparatorsEndsWith',
    values: 1,
  },
  lessThan: {
    text: 'comparatorsLessThan',
    values: 1,
  },
  lessOrEquals: {
    text: 'comparatorsLessThanOrEquals',
    values: 1,
  },
  inSet: {
    text: 'comparatorsInSet',
    values: 1,
  },
  jsonSearch: {
    text: 'comparatorsJsonSearch',
    values: 1,
  },
  arrayContains: {
    text: 'comparatorsArrayContains',
    values: 1,
  },
}

export {
  getComparatorConfig,
  comparators,
  operators,
}
