// Values already used in the database for some editable MCPD fields, suggested while editing the passport.
// Only values of germplasm with the same genus are suggested (no species author of another genus, for example).
//
// Germinate has no list of these values with their genus, the only source that links them is the BrAPI germplasm
// list: one request with every germplasm (genus, species, speciesAuthority, subtaxa, subtaxaAuthority, commonCropName), loaded
// once per page visit, so it grows with the database. When BrAPI is turned off there are no suggestions and the
// fields work as plain text fields.

import { authAxios, MAX_JAVA_INTEGER } from '@/mixins/api/base'

// Fields with suggestions, with the BrAPI germplasm property holding their value
const SUGGESTION_SOURCES = {
  species: 'species',
  cropname: 'commonCropName',
  spauthor: 'speciesAuthority',
  subtaxa: 'subtaxa',
  subtauthor: 'subtaxaAuthority'
}
const SUGGESTION_FIELDS = Object.keys(SUGGESTION_SOURCES)

const text = value => value === null || value === undefined ? '' : `${value}`.trim()

// Distinct, non-empty, sorted
const distinct = values => [...new Set(values.map(text).filter(v => v !== ''))]
  .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))

// All germplasm of the BrAPI list, loaded once. Resolves with [] when BrAPI isn't available.
let cache = null
const getBrapiGermplasm = () => {
  if (!cache) {
    cache = new Promise(resolve => {
      authAxios({
        url: 'brapi/v2/germplasm',
        data: { pageSize: MAX_JAVA_INTEGER },
        success: result => resolve((result && result.result && result.result.data) || []),
        error: { codes: [], callback: () => resolve([]) }
      })
    })
  }

  return cache
}

/**
 * Suggestions for each field of SUGGESTION_FIELDS: the values used by germplasm with the given genus (case is ignored).
 * Without a genus there are no suggestions.
 */
const getMcpdSuggestions = genus => getBrapiGermplasm().then(germplasm => {
  const wanted = text(genus).toLowerCase()
  const sameGenus = wanted ? germplasm.filter(g => text(g.genus).toLowerCase() === wanted) : []

  return SUGGESTION_FIELDS.reduce((suggestions, field) => ({
    ...suggestions,
    [field]: distinct(sameGenus.map(g => g[SUGGESTION_SOURCES[field]]))
  }), {})
})

// Fields of a new germplasm offering every value of the database (whatever the genus), with their BrAPI property
const ALL_VALUE_SOURCES = {
  genus: 'genus',
  species: 'species',
  cropname: 'commonCropName'
}

/**
 * Every value used by some germplasm for each field of ALL_VALUE_SOURCES (distinct, sorted)
 */
const getAllMcpdValues = () => getBrapiGermplasm().then(germplasm => Object.keys(ALL_VALUE_SOURCES).reduce((values, field) => ({
  ...values,
  [field]: distinct(germplasm.map(g => g[ALL_VALUE_SOURCES[field]]))
}), {}))

// After a save, so a new value is suggested next time
const clearMcpdSuggestions = () => {
  cache = null
}

export {
  SUGGESTION_FIELDS,
  getBrapiGermplasm,
  getMcpdSuggestions,
  getAllMcpdValues,
  clearMcpdSuggestions
}
