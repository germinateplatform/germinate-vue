// Conservation filter of the germplasm table: ex-situ or in-situ germplasm, as on the passport page (in-situ germplasm
// have the IN-SITU additional attribute 1, ex-situ are all the others).
//
// The table has no such column and its filters can't say "not in a list", so the filter is kept (in the table filters
// and the URL) as the short { column: 'conservation', comparator: 'equals', values: ['In-situ'] } and turned into
// "germplasmId in <the ids>" only for the requests to the server (see translateConservationFilters).

import { apiPostGermplasmTableIds, apiPostGermplasmAttributeTable } from '@/mixins/api/germplasm'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'

const CONSERVATION_COLUMN = 'conservation'
const CONSERVATION_OPTIONS = ['Ex-situ', 'In-situ']

// "in-situ" -> "In-situ", null when it is neither
const toConservationOption = value => {
  const text = value === null || value === undefined ? '' : `${value}`.trim().toLowerCase()
  return CONSERVATION_OPTIONS.find(option => option.toLowerCase() === text) || null
}

// Ids of the in-situ germplasm, and of all germplasm, loaded once per page visit
let inSituRequest = null
let allRequest = null

const getInSituIds = () => {
  if (!inSituRequest) {
    inSituRequest = new Promise(resolve => {
      apiPostGermplasmAttributeTable({
        page: 1,
        limit: MAX_JAVA_INTEGER,
        filter: [
          { column: 'attributeName', comparator: 'equals', operator: 'and', values: ['IN-SITU'] },
          { column: 'attributeValue', comparator: 'equals', operator: 'and', values: ['1'] }
        ]
      }, result => resolve([...new Set(((result && result.data) || []).map(a => a.germplasmId))]), {
        codes: [],
        callback: () => {
          inSituRequest = null
          resolve([])
        }
      })
    })
  }
  return inSituRequest
}

const getAllIds = () => {
  if (!allRequest) {
    allRequest = new Promise(resolve => {
      apiPostGermplasmTableIds({ filter: [] }, result => resolve((result && result.data) || []), {
        codes: [],
        callback: () => {
          allRequest = null
          resolve([])
        }
      })
    })
  }
  return allRequest
}

/**
 * Germplasm ids of a conservation option ("In-situ" or "Ex-situ").
 */
const getConservationIds = option => {
  if (option === 'In-situ') {
    return getInSituIds()
  }
  return Promise.all([getInSituIds(), getAllIds()]).then(([inSitu, all]) => all.filter(id => !inSitu.includes(id)))
}

const isConservationFilter = filter => {
  const column = filter && filter.column && typeof filter.column === 'object' ? filter.column.name : (filter ? filter.column : null)
  return column === CONSERVATION_COLUMN
}

/**
 * The filters of a request with the conservation filter turned into "germplasmId in <ids>" (an id no germplasm has
 * when there are none, so the result is empty). Other filters stay as they are.
 */
const translateConservationFilters = filters => Promise.all((filters || []).map(filter => {
  if (!isConservationFilter(filter)) {
    return Promise.resolve(filter)
  }
  const option = toConservationOption(filter.values ? filter.values[0] : null)
  const ids = option ? getConservationIds(option) : Promise.resolve([])
  return ids.then(list => ({
    column: 'germplasmId',
    comparator: 'inSet',
    operator: filter.operator || 'and',
    values: list.length > 0 ? list : [-1]
  }))
}))

/**
 * The request data with its conservation filter turned into germplasm ids, for the server.
 */
const translateConservationRequest = data => translateConservationFilters(data ? data.filter : []).then(filter => {
  if (data) {
    data.filter = filter
  }
  return data
})

export {
  CONSERVATION_COLUMN,
  CONSERVATION_OPTIONS,
  toConservationOption,
  isConservationFilter,
  getConservationIds,
  translateConservationFilters,
  translateConservationRequest
}
