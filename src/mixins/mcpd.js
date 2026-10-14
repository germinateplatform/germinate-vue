// Multi-Crop Passport Descriptors (MCPD) helpers, same values as the MCPD block of the original passport page
const countries = require('i18n-iso-countries')
countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

// SAMPSTAT: biological status of the accession
const MCPD_SAMPSTAT = {
  100: 'Wild',
  110: 'Natural',
  120: 'Semi-natural/wild',
  130: 'Semi-natural/sown',
  200: 'Weedy',
  300: 'Traditional cultivar/landrace',
  400: 'Breeding/research material',
  410: 'Breeder\'s line',
  411: 'Synthetic population',
  412: 'Hybrid',
  413: 'Founder stock/base population',
  414: 'Inbred line (parent of hybrid cultivar)',
  415: 'Segregating population',
  416: 'Clonal selection',
  420: 'Genetic stock',
  421: 'Mutant (e.g. induced/insertion mutants, tilling populations)',
  422: 'Cytogenetic stocks (e.g. chromosome addition/substitution, aneuploids, amphiploids)',
  423: 'Other genetic stocks (e.g. mapping populations)',
  500: 'Advanced or improved cultivar (conventional breeding methods)',
  600: 'GMO (by genetic engineering)',
  999: 'Other (Elaborate in REMARKS field)'
}

// COLLSRC: collecting/acquisition source
const MCPD_COLLSRC = {
  10: 'Wild habitat',
  11: 'Forest or woodland',
  12: 'Shrubland',
  13: 'Grassland',
  14: 'Desert or tundra',
  15: 'Aquatic habitat',
  20: 'Farm or cultivated habitat',
  21: 'Field',
  22: 'Orchard',
  23: 'Backyard, kitchen or home garden (urban, peri-urban or rural)',
  24: 'Fallow land',
  25: 'Pasture',
  26: 'Farm store',
  27: 'Threshing floor',
  28: 'Park',
  30: 'Market or shop',
  40: 'Institute, Experimental station, Research organization, Genebank',
  50: 'Seed company',
  60: 'Weedy, disturbed or ruderal habitat',
  61: 'Roadside',
  62: 'Field margin',
  99: 'Other (Elaborate in REMARKS field)'
}

// STORAGE: type of germplasm storage
const MCPD_STORAGE = {
  10: 'Seed collection',
  11: 'Short term',
  12: 'Medium term',
  13: 'Long term',
  20: 'Field collection',
  30: 'In vitro collection',
  40: 'Cryopreserved collection',
  50: 'DNA collection'
}

/**
 * Turns a coded MCPD value into "<code> - <name>" using the given code list, e.g. 420 -> "420 - Genetic stock".
 * Fields like STORAGE can hold several codes ("11;13"), these are listed separated by "; ". Codes missing from the
 * list are shown as they are. Returns null when the value holds no code at all.
 */
const formatMcpdCodes = (value, codes) => {
  const found = value === null || value === undefined ? null : `${value}`.match(/\d+/g)

  if (!found) {
    return null
  }

  return found.map(code => codes[code] ? `${code} - ${codes[code]}` : code).join('; ')
}

// ISO 3166-1 alpha-3 (as stored in ORIGCTY) to the alpha-2 code used by the flag icons
const getCountryFlagCode = code3 => {
  const code2 = code3 ? countries.alpha3ToAlpha2(code3.toUpperCase()) : null
  return code2 ? code2.toLowerCase() : null
}

const getCountryName = code3 => code3 ? countries.getName(code3.toUpperCase(), 'en') : null

export {
  MCPD_SAMPSTAT,
  MCPD_COLLSRC,
  MCPD_STORAGE,
  formatMcpdCodes,
  getCountryFlagCode,
  getCountryName
}
