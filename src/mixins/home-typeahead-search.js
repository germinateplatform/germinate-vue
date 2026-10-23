// Typeahead of the home page search, for the scopes of TYPEAHEAD_SCOPES: Datasets, Genotypic map, Traits, Climates and
// Locations. Text results come 5 at a time from the table of the scope, and any result opens the page of that table
// filtered by it.
//
// Kinds of fields (see TYPEAHEAD_SCOPES):
// - text ("column"): results whose column contains the text typed (MIN_CHARS characters, or the field's "minChars");
// - "number": a number compared with NUMBER_COMPARATORS ("decimal": also negative and decimal numbers);
// - "options": a list to choose one value from (dataset types, location types), no typing;
// - "countries": countries to choose (several) from a list with their flags, searched by typing;
// - "taxon" ('genus' or 'species'): genera or species of the database to choose (several) from a list shown once
//   something typed matches, with the group of a genus, the genera of a species;
// - "hasData": kinds of data the germplasm must have (several), as the "Has data of type" toggles of the germplasm list;
// - "bioStatus": biological statuses of the database (several), with their SAMPSTAT code and name, in code order;
// - "storage": MCPD STORAGE codes in use (several), with their code and name, in code order (found through BrAPI);
// - "fixedFilter": nothing to type, the Search button applies the filter (e.g. locations with coordinates);
// - "geofence": an area drawn on a map in the results: the locations with coordinates inside it (the Search button
//   opens the geographic search with that area);
// - "pdci": a PDCI range (0 to 10) set with sliders in the results, applied by the Search button. Only offered when the
//   server calculates the PDCI ("requires": 'pdci');
// - "institution": germplasm by institution, by institute code (masked, 3 letters and 3 digits, looked up once
//   complete) or name, looked up on FAO WIEWS. A WIEWS result or the Search button opens the germplasm with that
//   institution, of any type.
//
// Kept fast: requests wait for a short pause in typing, only the answer to the latest request is shown, answers are
// cached for the session (per scope, field, text and page), and the total is only counted for the first page (later
// pages pass it on as "prevCount", so the server doesn't count again).
//
// Which datasets a user finds is decided by the server (dataset/table, like the datasets page): administrators get all
// of them, everyone else the public ones and the private or hidden ones they (or one of their groups) have permission
// for. The results show the state of those that are not public.
//
// Used by SearchModule (home page and Search page), which has "searchTerm", "searchScope", "searchScopes", "inline" and
// the template (ref searchField). On the home page a search opens the page of its table; "inline" (the Search page) it
// is emitted as "search" ({ scope, tableName, filter, polygons, crumbs }) for the page to show the results.

import { apiPostDatasetTable, apiPostCollaboratorsTable } from '@/mixins/api/dataset'
import { apiPostMapsTable } from '@/mixins/api/genotype'
import { apiPostTraitTable } from '@/mixins/api/trait'
import { apiPostClimateTable } from '@/mixins/api/climate'
import { apiPostLocationTable, apiPostLocationPolygonTable, apiGetCountries } from '@/mixins/api/location'
import { apiPostGermplasmTable, apiPostGermplasmGroupTable, apiGetTaxonomyData, apiPostGermplasmPolygonTableIds, apiGetBiologicalStatusData, apiPostPedigreeTable } from '@/mixins/api/germplasm'
import { searchWiewsOrganizations } from '@/mixins/fao-wiews'
import { getCountryFlagCode, MCPD_SAMPSTAT } from '@/mixins/mcpd'
import { CODE_DOMAINS, splitCodes } from '@/mixins/mcpd-update'
import { getBrapiGermplasm } from '@/mixins/mcpd-suggestions'
import { apiPostPublicationsTable, apiPostInstitutionDatasetTable } from '@/mixins/api/misc'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'
import { findFlagshipCrop } from '@/mixins/crops'
import { datasetTypes, datasetStates, dataTypes, locationTypes } from '@/mixins/types'
import { Pages } from '@/mixins/pages'
import { getNumberWithSuffix } from '@/mixins/formatting'
import { mdiHelpCircle, mdiDna, mdiDatabaseRemoveOutline, mdiTagText, mdiWeatherSnowyRainy, mdiMap, mdiSprout, mdiOfficeBuildingMarkerOutline, mdiCamera, mdiIdentifier, mdiBookOpenVariant, mdiCardAccountDetails, mdiSitemap } from '@mdi/js'

const PAGE_SIZE = 5
// Text searches (typeahead and Search button) need at least this many characters (fields with short values set their
// own "minChars"). A number needs one digit.
const MIN_CHARS = 3
const TYPING_DELAY = 200
const CACHE_SIZE = 100
// Part of a description shown around the text found: characters before and after it
const SNIPPET_BEFORE = 40
const SNIPPET_AFTER = 80
// Description shown next to a name
const DESCRIPTION_LENGTH = 110

// Datasets of an unknown type (or without one) are shown with this icon
const UNKNOWN_TYPE_ICON = mdiHelpCircle

// How a number is compared (fields with "number")
const NUMBER_COMPARATORS = [
  { value: 'greaterThan', text: 'Greater than' },
  { value: 'lessThan', text: 'Less than' },
  { value: 'equals', text: 'Equal to' }
]

// Lists of the "options" fields: [{ key, text, path, color }]
const OPTION_LISTS = {
  // Unknown last, with its own icon
  datasetTypes: () => Object.keys(datasetTypes)
    .filter(key => key !== 'unknown')
    .concat(['unknown'])
    .map(key => ({ key, text: datasetTypes[key].text(), path: key === 'unknown' ? UNKNOWN_TYPE_ICON : datasetTypes[key].path, color: datasetTypes[key].color ? datasetTypes[key].color() : null })),
  locationTypes: () => Object.keys(locationTypes)
    .map(key => ({ key, text: locationTypes[key].text(), path: locationTypes[key].path, color: locationTypes[key].color() })),
  // Pedigree relationship types: a letter as badge, the value searched is the key
  relationshipTypes: () => [
    { key: 'F', text: 'Female', badge: 'F' },
    { key: 'M', text: 'Male', badge: 'M' },
    { key: 'OTHER', text: 'Other', badge: 'O' }
  ]
}

// Rows of the pedigree table read to list the distinct values of a column (author, descriptions)
const DISTINCT_ROWS = 1000
// Parent or child of a pedigree: searched by accession number, or by accession name (turned into the accession numbers
// of the germplasm with that name: the pedigree table only holds the GID)
const RELATIVE_SEARCH_BY = [
  { value: 'number', text: 'Accession number' },
  { value: 'name', text: 'Accession name' }
]

// PDCI: its scale and the step of the sliders
const PDCI_MIN = 0
const PDCI_MAX = 10
const PDCI_STEP = 0.5
// Groups of a germplasm read to find the one shown (its icon)
const GERMPLASM_GROUPS_LIMIT = 25

// What an institution is searched by
const INSTITUTION_SEARCH_BY = [
  { value: 'code', text: 'Institute Code' },
  { value: 'name', text: 'Institute Name' }
]
const INSTITUTE_CODE_PATTERN = /^[A-Z]{3}[0-9]{3}$/

// The longest word of a text, letters and digits only (the server's JSON search takes nothing else)
const getLongestWord = text => `${text || ''}`.split(/[^a-zA-Z0-9_-]+/).reduce((longest, word) => word.length > longest.length ? word : longest, '')

// Sites without a name ("N/A", see the MCPD import) are not results
const NO_SITE_NAME = 'n/a'

// The scopes with a typeahead. "countKey"/"countText": a count shown as a badge (always, or with "countOnlyForField"
// only when searching by it). "dataTypeKey": the data type as a badge. "countryBadge": the flag and code of the country.
const TYPEAHEAD_SCOPES = {
  // The pedigree table (no page of its own: from the home page the results show on the Search page). "defaultField":
  // the field chosen first (the scopes without it start with "name").
  pedigrees: {
    defaultField: 'dataset',
    fields: [
      // Pedigree datasets, shown like the dataset results
      { value: 'dataset', text: 'Dataset name', pedigreeDataset: true, column: 'datasetName', placeholder: 'Search pedigree datasets by name...' },
      // The germplasm typeahead; the pedigree table is filtered on the GID of the parent or of the child
      { value: 'parent', text: 'Parent', relative: 'parent', placeholder: 'Search parents...' },
      { value: 'child', text: 'Child', relative: 'child', placeholder: 'Search children...' },
      { value: 'type', text: 'Relationship type', options: 'relationshipTypes', column: 'relationshipType', placeholder: 'Choose a relationship type...' },
      // Values of the pedigree table, each shown once
      { value: 'relationship', text: 'Relationship description', distinct: 'relationshipDescription', icon: mdiSitemap, placeholder: 'Search relationship descriptions...' },
      { value: 'description', text: 'Description', distinct: 'pedigreeDescription', icon: mdiSitemap, placeholder: 'Search pedigree descriptions...' },
      { value: 'author', text: 'Author', distinct: 'pedigreeAuthor', icon: mdiCardAccountDetails, placeholder: 'Search pedigree authors...' }
    ],
    api: apiPostPedigreeTable,
    orderBy: 'childName',
    page: null,
    tableName: 'pedigrees',
    notFound: 'No Pedigrees found'
  },
  // Results: the icon of the group of the germplasm, accession number and name, taxonomy, and a checkbox marking it
  germplasm: {
    fields: [
      { value: 'name', text: 'Accession number', column: 'germplasmName', placeholder: 'Search germplasm by accession number...' },
      { value: 'displayName', text: 'Accession name', column: 'germplasmDisplayName', placeholder: 'Search germplasm by accession name...' },
      { value: 'country', text: 'Country', countries: true, column: 'countryName', placeholder: 'Search countries...' },
      { value: 'genus', text: 'Genus', taxon: 'genus', column: 'genus', placeholder: 'Search genera...' },
      // The germplasm whose location (with coordinates) is inside the area drawn: no list under the map, the Search
      // button opens the germplasm table with them ("geofenceIdsApi")
      { value: 'geofence', text: 'Geofencing', geofence: true, geofenceIdsApi: apiPostGermplasmPolygonTableIds, placeholder: 'Draw an area on the map, then Search...' },
      { value: 'species', text: 'Species', taxon: 'species', column: 'species', placeholder: 'Search species...' },
      { value: 'hasData', text: 'Has data of type', hasData: true, placeholder: 'Choose the kinds of data below...' },
      { value: 'bioStatus', text: 'Biological status', bioStatus: true, column: 'biologicalStatusName', placeholder: 'Choose the biological statuses below...' },
      { value: 'storage', text: 'Storage', storage: true, placeholder: 'Choose the types of storage below...' },
      { value: 'pdci', text: 'PDCI', pdci: true, column: 'pdci', requires: 'pdci', placeholder: 'Choose the PDCI range below...' },
      { value: 'institution', text: 'Institution', institution: true, placeholder: 'Institute code, e.g. DEU146...' }
    ],
    api: apiPostGermplasmTable,
    idKey: 'germplasmId',
    nameKey: 'germplasmName',
    orderBy: 'germplasmName',
    page: Pages.germplasm,
    tableName: 'germplasm',
    icon: mdiSprout,
    germplasm: true,
    notFound: 'No Germplasm found'
  },
  datasets: {
    fields: [
      { value: 'name', text: 'Dataset Name', column: 'datasetName', placeholder: 'Search datasets by name...' },
      { value: 'description', text: 'Dataset Description', column: 'datasetDescription', placeholder: 'Search datasets by description...' },
      { value: 'type', text: 'Type', options: 'datasetTypes', column: 'datasetType', placeholder: 'Choose a dataset type...' },
      { value: 'dataPoints', text: 'Data points', column: 'dataPointCount', number: true, placeholder: 'Number of data points...' },
      // The collaborators of the datasets, by last or first name; a result opens the datasets of the collaborator
      { value: 'collaborator', text: 'Collaborator', collaborator: true, placeholder: 'Search collaborators by name, or by email (with @)...' },
      // The institutions of the datasets; a result opens their datasets with the institutions shown
      { value: 'institution', text: 'Institution', datasetInstitution: true, placeholder: 'Search the institutions of the datasets...' }
    ],
    api: apiPostDatasetTable,
    // The number of data points as a badge when searching by it
    countKey: 'dataPointCount',
    countText: 'data points',
    countOnlyForField: 'dataPoints',
    idKey: 'datasetId',
    nameKey: 'datasetName',
    descriptionKey: 'datasetDescription',
    orderBy: 'datasetName',
    page: Pages.datasets,
    tableName: 'datasets',
    notFound: 'No Datasets found'
  },
  mapdefinitions: {
    fields: [
      { value: 'name', text: 'Map Name', column: 'mapName', placeholder: 'Search genotypic maps by name...' },
      { value: 'description', text: 'Map Description', column: 'mapDescription', placeholder: 'Search genotypic maps by description...' },
      { value: 'markers', text: 'Marker count', column: 'markerCount', number: true, placeholder: 'Number of markers...' }
    ],
    api: apiPostMapsTable,
    idKey: 'mapId',
    nameKey: 'mapName',
    descriptionKey: 'mapDescription',
    orderBy: 'mapName',
    page: Pages.maps,
    tableName: 'maps',
    icon: mdiDna,
    countKey: 'markerCount',
    countText: 'markers',
    notFound: 'No Genotypic maps found'
  },
  trials: {
    fields: [
      { value: 'name', text: 'Trait name', column: 'traitName', placeholder: 'Search traits by name...' },
      { value: 'short', text: 'Trait short name', column: 'traitNameShort', shortKey: 'traitNameShort', minChars: 1, placeholder: 'Search traits by short name...' },
      { value: 'description', text: 'Trait description', column: 'traitDescription', placeholder: 'Search traits by description...' },
      { value: 'unitName', text: 'Unit name', column: 'unitName', minChars: 1, placeholder: 'Search traits by unit name...' },
      { value: 'unitAbbreviation', text: 'Unit abbreviation', column: 'unitAbbreviation', minChars: 1, placeholder: 'Search traits by unit abbreviation...' },
      { value: 'dataPoints', text: 'Data points', column: 'count', number: true, placeholder: 'Number of data points...' }
    ],
    api: apiPostTraitTable,
    idKey: 'traitId',
    nameKey: 'traitName',
    descriptionKey: 'traitDescription',
    orderBy: 'traitName',
    page: Pages.traits,
    tableName: 'traits',
    icon: mdiTagText,
    countKey: 'count',
    countText: 'data points',
    countOnlyForField: 'dataPoints',
    dataTypeKey: 'dataType',
    notFound: 'No Traits found'
  },
  // Not a type of the search page: only searched here
  climates: {
    fields: [
      { value: 'name', text: 'Climate name', column: 'climateName', placeholder: 'Search climates by name...' },
      { value: 'short', text: 'Climate short name', column: 'climateNameShort', shortKey: 'climateNameShort', minChars: 1, placeholder: 'Search climates by short name...' },
      { value: 'description', text: 'Climate description', column: 'climateDescription', placeholder: 'Search climates by description...' },
      { value: 'unitName', text: 'Unit name', column: 'unitName', minChars: 1, placeholder: 'Search climates by unit name...' },
      { value: 'unitAbbreviation', text: 'Unit abbreviation', column: 'unitAbbreviation', minChars: 1, placeholder: 'Search climates by unit abbreviation...' },
      { value: 'dataPoints', text: 'Data points', column: 'count', number: true, placeholder: 'Number of data points...' }
    ],
    api: apiPostClimateTable,
    idKey: 'climateId',
    nameKey: 'climateName',
    descriptionKey: 'climateDescription',
    orderBy: 'climateName',
    page: Pages.climates,
    tableName: 'climates',
    // Same icon as Climates in the menu
    icon: mdiWeatherSnowyRainy,
    countKey: 'count',
    countText: 'data points',
    countOnlyForField: 'dataPoints',
    dataTypeKey: 'dataType',
    notFound: 'No Climates found'
  },
  locations: {
    fields: [
      { value: 'name', text: 'Site name', column: 'locationName', placeholder: 'Search locations by site name...' },
      { value: 'country', text: 'Country', countries: true, column: 'countryName', placeholder: 'Search countries...' },
      { value: 'elevation', text: 'Elevation', column: 'locationElevation', number: true, decimal: true, placeholder: 'Elevation (m)...' },
      { value: 'type', text: 'Type', options: 'locationTypes', column: 'locationType', placeholder: 'Choose a location type...' },
      { value: 'geofence', text: 'Geofencing', geofence: true, geofenceApi: apiPostLocationPolygonTable, placeholder: 'Draw an area on the map below...' },
      {
        value: 'coordinates',
        text: 'Has coordinates',
        placeholder: 'Locations with latitude and longitude',
        fixedFilter: [
          { column: 'locationLatitude', comparator: 'isNotNull', operator: 'and', values: [] },
          { column: 'locationLongitude', comparator: 'isNotNull', operator: 'and', values: [] }
        ]
      }
    ],
    api: apiPostLocationTable,
    idKey: 'locationId',
    nameKey: 'locationName',
    orderBy: 'locationName',
    page: Pages.locations,
    tableName: 'locations',
    // Same icon as Locations in the menu
    icon: mdiMap,
    // Text next to the name: the type and where it is
    subtitle: record => [locationTypes[record.locationType] ? locationTypes[record.locationType].text() : null, record.locationRegion, record.locationState]
      .map(value => plain(value)).filter(value => value !== '').join(' · '),
    countryBadge: true,
    // Without the sites that have no name
    keep: record => plain(record.locationName).toLowerCase() !== NO_SITE_NAME,
    notFound: 'No Locations found'
  }
}

// Answers of the session: key -> { data, count }
const cache = new Map()
const remember = (key, value) => {
  cache.set(key, value)
  if (cache.size > CACHE_SIZE) {
    cache.delete(cache.keys().next().value)
  }
}

// Genera and species of the database (those with germplasm), loaded once: { genus: [...], species: [...] }
let taxaRequest = null
const getTaxa = () => {
  if (!taxaRequest) {
    const names = items => (items || [])
      .filter(item => item.taxonomy && `${item.taxonomy}`.trim() !== '' && item.count > 0)
      .map(item => `${item.taxonomy}`.trim())
      .filter((name, index, all) => all.indexOf(name) === index)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    taxaRequest = new Promise(resolve => {
      apiGetTaxonomyData(result => resolve({ genus: names(result && result.genus), species: names(result && result.species) }),
        { codes: [], callback: () => { taxaRequest = null; resolve({ genus: [], species: [] }) } })
    })
  }
  return taxaRequest
}
// Taxa whose details (group of a genus, genera of a species) are looked up at a time, from the top of the list shown
const GENUS_GROUPS_VISIBLE = 40
// Germplasm of a species read to find its genera
const SPECIES_GERMPLASM_LIMIT = 200

// "Has data of type": the same toggles and filters as the common filters of the germplasm list
const HAS_DATA_OPTIONS = () => [
  { key: 'images', text: 'Images', path: mdiCamera, color: '#495057', filter: { column: 'imageCount', comparator: 'greaterThan', operator: 'and', values: [0] } },
  { key: 'trials', text: 'Trials data', path: datasetTypes.trials.path, color: datasetTypes.trials.color(), filter: { column: 'hasTrialsData', comparator: 'equals', operator: 'and', values: [1] } },
  { key: 'genotype', text: 'Genotypic data', path: datasetTypes.genotype.path, color: datasetTypes.genotype.color(), filter: { column: 'hasGenotypicData', comparator: 'equals', operator: 'and', values: [1] } },
  { key: 'pedigree', text: 'Pedigree data', path: datasetTypes.pedigree.path, color: datasetTypes.pedigree.color(), filter: { column: 'hasPedigreeData', comparator: 'equals', operator: 'and', values: [1] } },
  { key: 'allelefreq', text: 'Allele frequency data', path: datasetTypes.allelefreq.path, color: datasetTypes.allelefreq.color(), filter: { column: 'hasAllelefreqData', comparator: 'equals', operator: 'and', values: [1] } },
  // Germplasm with a PUID (the germplasm list has no toggle for it)
  { key: 'puid', text: 'Unique Identifier', path: mdiIdentifier, color: '#3b6b35', filter: { column: 'germplasmPuid', comparator: 'isNotNull', operator: 'and', values: [] } },
  // Germplasm referenced by a publication: not a column of the germplasm table, so their ids are found first
  { key: 'publications', text: 'Publications', path: mdiBookOpenVariant, color: '#3b6b35', resolveFilter: () => getPublicationGermplasmIds().then(ids => ({ column: 'germplasmId', comparator: 'inSet', operator: 'and', values: ids.length > 0 ? ids : [-1] })) }
]

// Germplasm referenced by publications: the "germplasmIds" of the publications table (its view lists the germplasm of
// each publication), once per page visit
let publicationGermplasmRequest = null
const getPublicationGermplasmIds = () => {
  if (!publicationGermplasmRequest) {
    publicationGermplasmRequest = new Promise((resolve, reject) => {
      apiPostPublicationsTable({ page: 1, limit: MAX_JAVA_INTEGER, filter: [{ column: 'germplasmIds', comparator: 'isNotNull', operator: 'and', values: [] }] }, result => {
        const ids = []
        ;((result && result.data) || []).forEach(publication => {
          const list = typeof publication.germplasmIds === 'string' ? JSON.parse(publication.germplasmIds) : (publication.germplasmIds || [])
          list.forEach(id => { if (!ids.includes(id)) { ids.push(id) } })
        })
        resolve(ids)
      }, { codes: [], callback: error => { publicationGermplasmRequest = null; reject(error) } })
    })
  }
  return publicationGermplasmRequest
}

// SAMPSTAT code of a biological status name of the database, as in the common filters of the germplasm list: compared
// up to the first bracket, without case (some database names differ from MCPD in their details)
const SAMPSTAT_NAME_ALIASES = { 'cytogenic stocks': 422 }
const getSampstatCode = name => {
  const short = value => `${value}`.split(' (')[0].trim().toLowerCase()
  const wanted = short(name)
  const code = Object.keys(MCPD_SAMPSTAT).find(c => short(MCPD_SAMPSTAT[c]) === wanted)
  if (code !== undefined) {
    return parseInt(code)
  }
  return SAMPSTAT_NAME_ALIASES[wanted] !== undefined ? SAMPSTAT_NAME_ALIASES[wanted] : null
}

// Biological statuses of the database with germplasm, loaded once: [{ value (database name), code, name }], in code order
let bioStatusRequest = null
const getBioStatuses = () => {
  if (!bioStatusRequest) {
    bioStatusRequest = new Promise(resolve => {
      apiGetBiologicalStatusData(result => resolve((result || [])
        .filter(item => item.key && item.count > 0)
        .map(item => {
          const code = getSampstatCode(item.key)
          const known = code !== null ? CODE_DOMAINS.sampstat.find(i => i.code === code) : null
          // The names of the passport editing ("Inbred line"), the database name otherwise
          return { value: item.key, code, name: known ? known.name : `${item.key}` }
        })
        // Without a code: last
        .sort((a, b) => (a.code === null ? 10000 : a.code) - (b.code === null ? 10000 : b.code) || a.name.localeCompare(b.name))),
      { codes: [], callback: () => { bioStatusRequest = null; resolve([]) } })
    })
  }
  return bioStatusRequest
}

// STORAGE codes of each germplasm (germplasmId -> ['12', '13']), from the BrAPI germplasm list (storageTypes), the only
// list that has them (the germplasm table doesn't). Empty when BrAPI is turned off.
const getGermplasmStorage = () => getBrapiGermplasm().then(germplasm => germplasm.reduce((storage, g) => {
  const codes = (g.storageTypes || []).reduce((all, type) => all.concat(splitCodes(type && type.code)), [])
  if (codes.length > 0) {
    storage[g.germplasmDbId] = codes
  }
  return storage
}, {}))

// "triticum" -> "Triticum"
const capitalize = text => text ? text.charAt(0).toUpperCase() + text.slice(1) : text

// Countries of the database, loaded once
let countriesRequest = null
const getCountries = () => {
  if (!countriesRequest) {
    countriesRequest = new Promise(resolve => {
      apiGetCountries(result => resolve((result || [])
        // "UNKNOWN COUNTRY ORIGIN" is no country
        .filter(c => c.id !== -1 && c.countryCode2 && c.countryName)
        .sort((a, b) => a.countryName.localeCompare(b.countryName))), { codes: [], callback: () => { countriesRequest = null; resolve([]) } })
    })
  }
  return countriesRequest
}

// Plain text (descriptions may hold markup), one space between words
function plain (value) {
  return `${value === null || value === undefined ? '' : value}`.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

const truncate = (text, length) => text.length > length ? `${text.substring(0, length).replace(/\s+\S*$/, '')} …` : text

// The text in parts, those matching the term (any case) marked: [{ text, match }]
const splitMatches = (text, term) => {
  const wanted = term.toLowerCase()
  if (!wanted) {
    return [{ text, match: false }]
  }
  const parts = []
  const lower = text.toLowerCase()
  let from = 0
  let index = lower.indexOf(wanted)
  while (index !== -1) {
    if (index > from) {
      parts.push({ text: text.substring(from, index), match: false })
    }
    parts.push({ text: text.substring(index, index + wanted.length), match: true })
    from = index + wanted.length
    index = lower.indexOf(wanted, from)
  }
  if (from < text.length) {
    parts.push({ text: text.substring(from), match: false })
  }
  return parts
}

// The part of the text around the first match, cut at spaces, with "…" where it was cut
const getSnippet = (text, term) => {
  const index = text.toLowerCase().indexOf(term.toLowerCase())
  if (index === -1) {
    return truncate(text, DESCRIPTION_LENGTH)
  }
  let start = Math.max(0, index - SNIPPET_BEFORE)
  if (start > 0) {
    const space = text.lastIndexOf(' ', start)
    start = space !== -1 && index - space < SNIPPET_BEFORE + 20 ? space + 1 : start
  }
  let end = Math.min(text.length, index + term.length + SNIPPET_AFTER)
  if (end < text.length) {
    const space = text.indexOf(' ', end)
    end = space !== -1 && space - end < 20 ? space : end
  }
  return `${start > 0 ? '… ' : ''}${text.substring(start, end)}${end < text.length ? ' …' : ''}`
}

// What can be typed for a number: digits, or for a decimal number also a leading "-" and one decimal point
const cleanNumber = (value, decimal) => {
  const text = `${value === null || value === undefined ? '' : value}`.replace(',', '.')
  if (!decimal) {
    return text.replace(/\D+/g, '')
  }
  const negative = text.trim().startsWith('-')
  const [whole, ...rest] = text.replace(/[^\d.]+/g, '').split('.')
  return `${negative ? '-' : ''}${whole}${rest.length > 0 ? `.${rest.join('')}` : ''}`
}
const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/

// Alphabetical order of the "text" of list entries
const byText = (a, b) => a.text.localeCompare(b.text, undefined, { sensitivity: 'base' })

export { MIN_CHARS as SEARCH_MIN_CHARS }

export default {
  data: function () {
    return {
      numberComparators: NUMBER_COMPARATORS.slice().sort((a, b) => byText(a, b)),
      typeaheadField: 'name',
      numberComparator: 'greaterThan',
      typeaheadResults: [],
      typeaheadCount: 0,
      typeaheadPage: 1,
      typeaheadLoading: false,
      // The term the results are for
      typeaheadResultTerm: '',
      typeaheadPanelOpen: false,
      typeaheadPanelWidth: null,
      typeaheadHighlight: -1,
      // "options" fields: the value chosen
      selectedOption: null,
      // "countries" fields: the countries of the database, and those chosen
      countries: [],
      selectedCountries: [],
      // "taxon" fields: the genera and species of the database, those chosen (of the field's rank), the group of each genus
      // (genus -> { name } or null) and the genera of each species (species -> [genus])
      taxa: { genus: [], species: [] },
      selectedTaxa: [],
      speciesGenera: {},
      // "hasData" fields: the kinds of data chosen
      selectedHasData: [],
      // "bioStatus" fields: the statuses of the database, and those chosen (database names)
      bioStatuses: [],
      selectedBioStatus: [],
      // "storage" fields: the codes in use ([{ code, name }]), and those chosen (codes as text)
      storageTypes: [],
      selectedStorage: [],
      genusGroups: {},
      // "geofence" fields: the polygons drawn ([[{ lat, lng }]])
      geofencePolygons: [],
      // "pdci" fields: the range chosen
      pdciRange: [PDCI_MIN, PDCI_MAX],
      pdciLimits: { min: PDCI_MIN, max: PDCI_MAX, step: PDCI_STEP },
      // The group shown for each germplasm (its icon): germplasmId -> { name, path, key } (null without a group)
      germplasmGroups: {},
      // "institution" fields: what the institution is searched by
      institutionSearchBy: 'code',
      institutionSearchByOptions: INSTITUTION_SEARCH_BY.slice().sort((a, b) => byText(a, b)),
      // "relative" fields (parent, child of a pedigree): what the germplasm is searched by
      relativeSearchBy: 'number',
      relativeSearchByOptions: RELATIVE_SEARCH_BY.slice().sort((a, b) => byText(a, b)),
      notFoundIcon: mdiDatabaseRemoveOutline,
      // A service of the results that couldn't be reached (FAO WIEWS)
      typeaheadError: null
    }
  },
  computed: {
    // The typeahead of the scope chosen, null for the scopes without one
    typeaheadScope: function () {
      return TYPEAHEAD_SCOPES[this.searchScope] || null
    },
    hasTypeahead: function () {
      return !!this.typeaheadScope
    },
    // The fields of the scope the server allows (PDCI only when it calculates it)
    typeaheadFields: function () {
      // In alphabetical order
      return this.typeaheadScope
        ? this.typeaheadScope.fields.filter(field => field.requires !== 'pdci' || this.isPdciAvailable).slice().sort((a, b) => byText(a, b))
        : []
    },
    // "PDCI calculation" of the server; only administrators receive the setting, for everyone else it counts as on
    isPdciAvailable: function () {
      const settings = this.$store.getters.storeServerSettings
      return !(settings && settings.pdciEnabled === false)
    },
    typeaheadFieldConfig: function () {
      return this.typeaheadFields.find(field => field.value === this.typeaheadField) || this.typeaheadFields[0] || null
    },
    isOptionSearch: function () {
      return !!this.typeaheadFieldConfig && !!this.typeaheadFieldConfig.options
    },
    isNumberSearch: function () {
      return !!this.typeaheadFieldConfig && !!this.typeaheadFieldConfig.number
    },
    isCountrySearch: function () {
      return !!this.typeaheadFieldConfig && !!this.typeaheadFieldConfig.countries
    },
    isTaxonSearch: function () {
      return !!this.typeaheadFieldConfig && !!this.typeaheadFieldConfig.taxon
    },
    taxonRank: function () {
      return this.isTaxonSearch ? this.typeaheadFieldConfig.taxon : null
    },
    // Genera and species: the list only shows once something typed matches
    // The typeahead answered for the text typed and found nothing (lists of values and maps aside)
    typeaheadNothingFound: function () {
      if (!this.hasTypeahead || this.typeaheadLoading || this.isOptionSearch || this.isMultiSearch || this.isHasDataSearch ||
        this.isBioStatusSearch || this.isStorageSearch || this.isGeofenceSearch || this.isPdciSearch || this.isFixedSearch) {
        return false
      }
      return this.hasTypeaheadTerm && this.typeaheadResultTerm === this.typeaheadTerm && (this.typeaheadItems.length === 0 || !!this.typeaheadError)
    },
    // Values chosen in the field shown as chips (countries, taxa, kinds of data, statuses, storage)
    selectedChipCount: function () {
      if (this.isCountrySearch) {
        return this.selectedCountries.length
      }
      if (this.isTaxonSearch) {
        return this.selectedTaxa.length
      }
      if (this.isHasDataSearch) {
        return this.selectedHasData.length
      }
      if (this.isBioStatusSearch) {
        return this.selectedBioStatus.length
      }
      return this.isStorageSearch ? this.selectedStorage.length : 0
    },
    // Every value of the list was chosen: nothing left to show (no list, no placeholder)
    isChoiceExhausted: function () {
      let all = 0
      if (this.isCountrySearch) {
        all = this.countries.length
      } else if (this.isTaxonSearch) {
        all = (this.taxa[this.taxonRank] || []).length
      } else if (this.isHasDataSearch) {
        all = HAS_DATA_OPTIONS().length
      } else if (this.isBioStatusSearch) {
        all = this.bioStatuses.length
      } else if (this.isStorageSearch) {
        all = this.storageTypes.length
      }
      return all > 0 && this.selectedChipCount >= all
    },
    showTypeaheadPanel: function () {
      if (!this.hasTypeahead || !this.typeaheadPanelOpen || this.isChoiceExhausted) {
        return false
      }
      return !this.isTaxonSearch || ((this.searchTerm || '').trim() !== '' && this.taxonOptions.length > 0)
    },
    isHasDataSearch: function () {
      return !!this.typeaheadFieldConfig && !!this.typeaheadFieldConfig.hasData
    },
    isBioStatusSearch: function () {
      return !!this.typeaheadFieldConfig && !!this.typeaheadFieldConfig.bioStatus
    },
    isStorageSearch: function () {
      return !!this.typeaheadFieldConfig && !!this.typeaheadFieldConfig.storage
    },
    storageOptions: function () {
      // Those chosen are chips, no longer in the list
      return this.isStorageSearch ? this.storageTypes.filter(type => !this.selectedStorage.includes(`${type.code}`)).map(type => ({ ...type, selected: false })) : []
    },
    selectedStorageOptions: function () {
      return this.storageTypes.filter(type => this.selectedStorage.includes(`${type.code}`))
    },
    // The biological statuses, those chosen ticked
    bioStatusOptions: function () {
      return this.isBioStatusSearch ? this.bioStatuses.filter(status => !this.selectedBioStatus.includes(status.value)).map(status => ({ ...status, selected: false })) : []
    },
    selectedBioStatusOptions: function () {
      return this.bioStatuses.filter(status => this.selectedBioStatus.includes(status.value))
    },
    // The kinds of data, those chosen ticked
    hasDataOptions: function () {
      return this.isHasDataSearch ? HAS_DATA_OPTIONS().filter(option => !this.selectedHasData.includes(option.key)).map(option => ({ ...option, selected: false })) : []
    },
    selectedHasDataOptions: function () {
      return HAS_DATA_OPTIONS().filter(option => this.selectedHasData.includes(option.key))
    },
    isFixedSearch: function () {
      return !!this.typeaheadFieldConfig && !!this.typeaheadFieldConfig.fixedFilter
    },
    isGeofenceSearch: function () {
      return !!this.typeaheadFieldConfig && !!this.typeaheadFieldConfig.geofence
    },
    // A geofence whose results are listed under the map (not those whose table the Search button opens)
    geofenceListsResults: function () {
      return this.isGeofenceSearch && !this.typeaheadFieldConfig.geofenceIdsApi
    },
    isPdciSearch: function () {
      return !!this.typeaheadFieldConfig && !!this.typeaheadFieldConfig.pdci
    },
    isInstitutionSearch: function () {
      return !!this.typeaheadFieldConfig && !!this.typeaheadFieldConfig.institution
    },
    isCollaboratorSearch: function () {
      return !!this.typeaheadFieldConfig && !!this.typeaheadFieldConfig.collaborator
    },
    isDatasetInstitutionSearch: function () {
      return !!this.typeaheadFieldConfig && !!this.typeaheadFieldConfig.datasetInstitution
    },
    isInstitutionCodeSearch: function () {
      return this.isInstitutionSearch && this.institutionSearchBy === 'code'
    },
    isPedigreeDatasetSearch: function () {
      return !!this.typeaheadFieldConfig && !!this.typeaheadFieldConfig.pedigreeDataset
    },
    isRelativeSearch: function () {
      return !!this.typeaheadFieldConfig && !!this.typeaheadFieldConfig.relative
    },
    isDistinctSearch: function () {
      return !!this.typeaheadFieldConfig && !!this.typeaheadFieldConfig.distinct
    },
    pdciRangeText: function () {
      return `PDCI from ${this.pdciRange[0].toFixed(1)} to ${this.pdciRange[1].toFixed(1)}`
    },
    markedGermplasm: function () {
      return this.$store.getters.storeMarkedGermplasm || []
    },
    // Fields that show a list instead of results (options, countries, genera)
    isListSearch: function () {
      return this.isOptionSearch || this.isCountrySearch || this.isTaxonSearch || this.isHasDataSearch || this.isBioStatusSearch || this.isStorageSearch
    },
    // Fields where several values are chosen, shown as chips in the search field
    isMultiSearch: function () {
      return this.isCountrySearch || this.isTaxonSearch
    },
    // The term searched: a cleaned number for a number
    typeaheadTerm: function () {
      const term = (this.searchTerm || '').trim()
      return this.isNumberSearch ? cleanNumber(term, this.typeaheadFieldConfig.decimal) : term
    },
    // Enough typed to search: a number, or MIN_CHARS characters (or the field's "minChars") for a text
    hasTypeaheadTerm: function () {
      // An institute code: looked up once complete (3 letters and 3 digits)
      if (this.isInstitutionCodeSearch) {
        return INSTITUTE_CODE_PATTERN.test(this.typeaheadTerm)
      }
      if (this.isGeofenceSearch) {
        return this.geofencePolygons.length > 0
      }
      if (this.isNumberSearch) {
        return NUMBER_PATTERN.test(this.typeaheadTerm)
      }
      const field = this.typeaheadFieldConfig
      return this.typeaheadTerm.length >= ((field && field.minChars) || MIN_CHARS)
    },
    // The list of an "options" field
    optionList: function () {
      return this.isOptionSearch && OPTION_LISTS[this.typeaheadFieldConfig.options] ? OPTION_LISTS[this.typeaheadFieldConfig.options]() : []
    },
    // Countries matching what is typed (name or code), those chosen first
    countryOptions: function () {
      if (!this.isCountrySearch) {
        return []
      }
      const term = (this.searchTerm || '').trim().toLowerCase()
      return this.countries
        .filter(c => !term || c.countryName.toLowerCase().includes(term) || `${c.countryCode3 || ''}`.toLowerCase() === term || `${c.countryCode2}`.toLowerCase() === term)
        // Those chosen are chips, no longer in the list
        .filter(c => !this.selectedCountries.some(s => s.id === c.id))
        .map(c => ({ ...c, selected: false }))
    },
    // Genera or species matching what is typed (nothing typed: none). A genus with the icon and name of its group, a
    // species with the icon of the group of its (first) genus and its genera as badges.
    taxonOptions: function () {
      if (!this.isTaxonSearch) {
        return []
      }
      const term = (this.searchTerm || '').trim().toLowerCase()
      if (!term) {
        return []
      }
      const isGenus = this.taxonRank === 'genus'
      return this.taxa[this.taxonRank]
        // Those chosen are chips, no longer in the list
        .filter(name => name.toLowerCase().includes(term) && !this.selectedTaxa.includes(name))
        .map(name => {
          const genera = isGenus ? [name] : (this.speciesGenera[name] || [])
          const group = genera.length > 0 ? this.genusGroups[genera[0]] : null
          const crop = group ? findFlagshipCrop(group.name) : null
          return {
            name,
            // Genus with a capital, species in lower case
            text: isGenus ? capitalize(name) : name,
            selected: this.selectedTaxa.includes(name),
            group: isGenus && group ? { name: group.name, className: `cp-crop-${crop ? crop.key : 'other'}` } : null,
            genera: isGenus ? [] : genera.map(genus => capitalize(genus)),
            icon: crop ? crop.icon : mdiSprout,
            iconStyle: { color: `var(--cp-crop-${crop ? crop.key : 'other'}-fg)`, background: `var(--cp-crop-${crop ? crop.key : 'other'}-bg)` }
          }
        })
    },
    typeaheadPageCount: function () {
      // The lists are shown whole
      return this.isListSearch ? 1 : Math.max(1, Math.ceil(this.typeaheadCount / PAGE_SIZE))
    },
    // The results as shown: an icon, the name and a text, in parts with the term marked, and badges
    typeaheadItems: function () {
      const scope = this.typeaheadScope
      if (!scope) {
        return []
      }
      const term = this.typeaheadResultTerm
      const field = this.typeaheadField
      const fieldConfig = this.typeaheadFieldConfig || {}
      const byDescription = field === 'description'
      const byName = field === 'name'
      // Pedigree datasets: like the dataset results
      if (this.isPedigreeDatasetSearch) {
        return this.typeaheadResults.map(record => ({
          id: record.datasetId,
          record,
          pedigreeDataset: true,
          icon: this.getDatasetTypeInfo(record.datasetType).path,
          iconStyle: this.getDatasetIconStyle(record.datasetType),
          state: record.datasetState && record.datasetState !== 'public' && datasetStates[record.datasetState] ? { path: datasetStates[record.datasetState].path, text: datasetStates[record.datasetState].text() } : null,
          nameParts: splitMatches(plain(record.datasetName), term),
          textParts: [{ text: truncate(plain(record.datasetDescription), DESCRIPTION_LENGTH), match: false }],
          badges: []
        }))
      }
      // Parent, child: germplasm (accession number or name marked)
      if (this.isRelativeSearch) {
        return this.typeaheadResults.map(record => ({ ...this.getGermplasmItem(record, term, this.relativeSearchBy === 'name' ? 'displayName' : 'name'), relative: true }))
      }
      // Values of the pedigree table, each once
      if (this.isDistinctSearch) {
        const column = this.typeaheadFieldConfig.distinct
        return this.typeaheadResults
          .map(record => plain(record[column]))
          .filter((value, index, all) => value !== '' && all.findIndex(v => v.toLowerCase() === value.toLowerCase()) === index)
          .map(value => ({
            id: value,
            distinctValue: value,
            icon: this.typeaheadFieldConfig.icon,
            iconStyle: this.getColorStyle(null),
            nameParts: splitMatches(value, term),
            textParts: [],
            badges: []
          }))
      }
      // Institutions (germplasm by institution): FAO WIEWS institutes
      if (this.isInstitutionSearch) {
        return this.typeaheadResults.map(record => this.getInstitutionItem(record, term))
      }
      // Collaborators of datasets: one row per collaborator (the table has one per dataset)
      if (this.isCollaboratorSearch) {
        return this.typeaheadResults
          .filter((record, index, all) => all.findIndex(r => r.collaboratorId === record.collaboratorId) === index)
          .map(record => this.getCollaboratorItem(record, term))
      }
      // Institutions of datasets: only those with datasets the user may see
      if (this.isDatasetInstitutionSearch) {
        return this.typeaheadResults
          .filter(record => this.getInstitutionDatasetIds(record).length > 0)
          .map(record => this.getDatasetInstitutionItem(record, term))
      }
      // Germplasm: accession number and name, taxonomy, the icon of its group
      if (scope.germplasm) {
        return this.typeaheadResults.map(record => this.getGermplasmItem(record, term, field))
      }
      return this.typeaheadResults.map(record => {
        const name = plain(record[scope.nameKey])
        const description = scope.descriptionKey ? plain(record[scope.descriptionKey]) : ''
        const isDataset = this.searchScope === 'datasets'
        const state = isDataset && record.datasetState !== 'public' ? datasetStates[record.datasetState] : null
        let nameParts = byName ? splitMatches(name, term) : [{ text: name, match: false }]
        let textParts
        if (byDescription) {
          // The part with the text found, marked
          textParts = splitMatches(getSnippet(description, term), term)
        } else if (fieldConfig.shortKey) {
          // Short name: after the name, marked
          const short = plain(record[fieldConfig.shortKey])
          nameParts = nameParts.concat(short ? [{ text: ' (', match: false }].concat(splitMatches(short, term), [{ text: ')', match: false }]) : [])
          textParts = [{ text: truncate(description, DESCRIPTION_LENGTH), match: false }]
        } else if (field === 'unitName' || field === 'unitAbbreviation') {
          // The unit, the part searched marked, then the start of the description
          const unitName = plain(record.unitName)
          const abbreviation = plain(record.unitAbbreviation)
          textParts = [{ text: 'Unit: ', match: false }]
            .concat(field === 'unitName' ? splitMatches(unitName, term) : [{ text: unitName, match: false }])
            .concat(abbreviation ? [{ text: ' (', match: false }].concat(field === 'unitAbbreviation' ? splitMatches(abbreviation, term) : [{ text: abbreviation, match: false }], [{ text: ')', match: false }]) : [])
            .concat(description ? [{ text: ` · ${truncate(description, DESCRIPTION_LENGTH)}`, match: false }] : [])
        } else if (scope.subtitle) {
          textParts = [{ text: scope.subtitle(record), match: false }]
        } else {
          textParts = [{ text: truncate(description, DESCRIPTION_LENGTH), match: false }]
        }
        // An elevation searched: shown with the text
        if (field === 'elevation') {
          const elevation = record.locationElevation !== null && record.locationElevation !== undefined ? `${Number(record.locationElevation).toLocaleString()} m` : '—'
          textParts = [{ text: elevation, match: true }].concat(textParts[0] && textParts[0].text ? [{ text: ` · ${textParts[0].text}`, match: false }] : [])
        }
        // Badges at the right: the count of the scope (markers, data points), the data type, the country
        const badges = []
        if (scope.countKey && (!scope.countOnlyForField || scope.countOnlyForField === field)) {
          badges.push({ ...this.getCountBadge(record[scope.countKey], scope.countText), matched: this.isNumberSearch })
        }
        if (scope.dataTypeKey && dataTypes[record[scope.dataTypeKey]]) {
          const dataType = dataTypes[record[scope.dataTypeKey]]
          badges.push({ text: dataType.text(), title: `Data type: ${dataType.text()}`, icon: dataType.path, style: this.getColorStyle(dataType.color()) })
        }
        if (scope.countryBadge && record.countryCode2) {
          badges.push({ text: record.countryCode3 || `${record.countryCode2}`.toUpperCase(), title: plain(record.countryName), flag: `${record.countryCode2}`.toLowerCase(), plainBadge: true })
        }
        return {
          id: record[scope.idKey],
          record,
          icon: isDataset ? this.getDatasetTypeInfo(record.datasetType).path : scope.icon,
          iconStyle: isDataset ? this.getDatasetIconStyle(record.datasetType) : this.getColorStyle(null),
          // Private or hidden datasets: their state next to the name
          state: state ? { path: state.path, text: state.text() } : null,
          nameParts,
          textParts,
          badges
        }
      })
    },
    // Items of the list that can be highlighted with the arrow keys
    typeaheadItemCount: function () {
      if (this.isOptionSearch) {
        return this.optionList.length
      }
      if (this.isTaxonSearch) {
        return this.taxonOptions.length
      }
      if (this.isHasDataSearch) {
        return this.hasDataOptions.length
      }
      if (this.isBioStatusSearch) {
        return this.bioStatusOptions.length
      }
      if (this.isStorageSearch) {
        return this.storageOptions.length
      }
      return this.isCountrySearch ? this.countryOptions.length : this.typeaheadItems.length
    },
    selectedOptionText: function () {
      const option = this.optionList.find(o => o.key === this.selectedOption)
      return option ? option.text : ''
    },
    // What the search field shows: the option chosen, nothing for a fixed filter
    searchInputValue: function () {
      if (this.isOptionSearch) {
        return this.selectedOptionText
      }
      if (this.isGeofenceSearch) {
        const count = this.geofencePolygons.length
        return count > 0 ? `${count} area${count > 1 ? 's' : ''} drawn on the map` : ''
      }
      if (this.isPdciSearch) {
        return this.pdciRangeText
      }
      return this.isFixedSearch || this.isHasDataSearch || this.isBioStatusSearch || this.isStorageSearch ? '' : (this.searchTerm || '')
    },
    searchInputPlaceholder: function () {
      if (this.isChoiceExhausted) {
        return ''
      }
      if (this.isCountrySearch && this.selectedCountries.length > 0) {
        return 'Add a country...'
      }
      if (this.isTaxonSearch && this.selectedTaxa.length > 0) {
        return this.taxonRank === 'genus' ? 'Add a genus...' : 'Add a species...'
      }
      if (this.isInstitutionSearch && !this.isInstitutionCodeSearch) {
        return 'Institute name, e.g. Leibniz...'
      }
      return this.typeaheadFieldConfig ? this.typeaheadFieldConfig.placeholder : 'Search datasets, germplasms, traits, climates, locations, pedigrees, genotypic maps...'
    },
    canSubmitSearch: function () {
      if (this.isOptionSearch) {
        return !!this.selectedOption
      }
      if (this.isFixedSearch) {
        return true
      }
      if (this.isCountrySearch) {
        return this.selectedCountries.length > 0
      }
      if (this.isTaxonSearch) {
        return this.selectedTaxa.length > 0
      }
      if (this.isHasDataSearch) {
        return this.selectedHasData.length > 0
      }
      if (this.isBioStatusSearch) {
        return this.selectedBioStatus.length > 0
      }
      if (this.isStorageSearch) {
        return this.selectedStorage.length > 0
      }
      if (this.isGeofenceSearch) {
        return this.geofencePolygons.length > 0
      }
      if (this.isPdciSearch) {
        return true
      }
      // An institute code: complete; an institute name: 3 characters
      if (this.isInstitutionCodeSearch) {
        return INSTITUTE_CODE_PATTERN.test(this.typeaheadTerm)
      }
      if (this.hasTypeahead) {
        return this.hasTypeaheadTerm
      }
      return !!this.searchTerm && this.searchTerm.trim().length >= MIN_CHARS
    }
  },
  watch: {
    // Another scope: its own fields, nothing chosen
    searchScope: function () {
      this.resetTypeahead()
      // The text typed was for the other scope (changing a field of the same scope keeps it)
      this.searchTerm = ''
    },
    // Another field: other results. A list (options) shows at once.
    typeaheadField: function () {
      this.clearTypeaheadResults()
      this.selectedOption = null
      this.selectedTaxa = []
      if (this.isNumberSearch) {
        this.searchTerm = cleanNumber(this.searchTerm, this.typeaheadFieldConfig.decimal)
      }
      if (this.isCountrySearch) {
        this.loadCountries()
      }
      if (this.isTaxonSearch) {
        this.loadTaxa()
      }
      if (this.isInstitutionCodeSearch) {
        this.searchTerm = this.maskInstituteCode(this.searchTerm)
      }
      if (this.isBioStatusSearch) {
        getBioStatuses().then(statuses => { this.bioStatuses = statuses })
      }
      if (this.isStorageSearch) {
        this.loadStorageTypes()
      }
      if (this.isOptionSearch || this.isGeofenceSearch || this.isPdciSearch || this.isHasDataSearch || this.isBioStatusSearch || this.isStorageSearch) {
        this.openTypeaheadPanel()
        if (this.geofenceListsResults && this.geofencePolygons.length > 0) {
          this.loadTypeaheadPage(1)
        }
      } else {
        this.typeaheadPanelOpen = false
        this.scheduleTypeahead()
      }
    },
    numberComparator: function () {
      this.clearTypeaheadResults()
      this.scheduleTypeahead(0)
    },
    // Code or name: the text typed doesn't fit the other one
    institutionSearchBy: function () {
      this.searchTerm = this.isInstitutionCodeSearch ? this.maskInstituteCode(this.searchTerm) : this.searchTerm
      this.clearTypeaheadResults()
      this.scheduleTypeahead(0)
    },
    relativeSearchBy: function () {
      this.clearTypeaheadResults()
      this.scheduleTypeahead(0)
    }
  },
  methods: {
    clearTypeaheadResults: function () {
      this.typeaheadResults = []
      this.typeaheadCount = 0
      this.typeaheadPage = 1
      this.typeaheadHighlight = -1
    },
    resetTypeahead: function () {
      clearTimeout(this.typeaheadTimer)
      this.typeaheadRequest = (this.typeaheadRequest || 0) + 1
      this.typeaheadField = (this.typeaheadScope && this.typeaheadScope.defaultField) || 'name'
      this.relativeSearchBy = 'number'
      this.numberComparator = 'greaterThan'
      this.clearTypeaheadResults()
      this.typeaheadLoading = false
      this.typeaheadPanelOpen = false
      this.selectedOption = null
      this.selectedCountries = []
      this.selectedTaxa = []
      this.selectedHasData = []
      this.selectedBioStatus = []
      this.selectedStorage = []
      this.geofencePolygons = []
      this.pdciRange = [PDCI_MIN, PDCI_MAX]
      this.institutionSearchBy = 'code'
    },
    loadCountries: function () {
      getCountries().then(countries => { this.countries = countries })
    },
    loadTaxa: function () {
      getTaxa().then(taxa => {
        this.taxa = taxa
        this.loadTaxonDetails()
      })
    },
    // Details of the taxa at the top of the list shown: the group of a genus, the genera of a species (and their groups)
    loadTaxonDetails: function () {
      const names = this.taxonOptions.slice(0, GENUS_GROUPS_VISIBLE).map(option => option.name)
      if (this.taxonRank === 'genus') {
        this.loadGenusGroupsOf(names)
      } else if (this.taxonRank === 'species') {
        this.loadSpeciesGenera(names)
      }
    },
    // The genera of each species (not looked up yet): those of its germplasm. Once per species.
    loadSpeciesGenera: function (names) {
      names.filter(name => !(name in this.speciesGenera)).forEach(name => {
        this.speciesGenera = { ...this.speciesGenera, [name]: [] }
        apiPostGermplasmTable({ page: 1, limit: SPECIES_GERMPLASM_LIMIT, filter: [{ column: 'species', comparator: 'equals', operator: 'and', values: [name] }] }, result => {
          const genera = [...new Set(((result && result.data) || []).map(g => plain(g.genus)).filter(genus => genus !== ''))]
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
          this.speciesGenera = { ...this.speciesGenera, [name]: genera }
          // The icon comes from the group of the first genus
          this.loadGenusGroupsOf(genera.slice(0, 1))
        }, { codes: [], callback: () => {} })
      })
    },
    // The group of each genus (not looked up yet): the group of a germplasm of the genus (the first flagship crop
    // group, else the first germplasm group). Once per genus.
    loadGenusGroupsOf: function (names) {
      names
        .filter(name => !(name in this.genusGroups))
        .forEach(name => {
          this.genusGroups = { ...this.genusGroups, [name]: null }
          apiPostGermplasmTable({ page: 1, limit: 1, filter: [{ column: 'genus', comparator: 'equals', operator: 'and', values: [name] }] }, result => {
            const germplasm = result && result.data && result.data[0]
            if (!germplasm) {
              return
            }
            apiPostGermplasmGroupTable(germplasm.germplasmId, { page: 1, limit: GERMPLASM_GROUPS_LIMIT }, groupResult => {
              const groups = ((groupResult && groupResult.data) || []).filter(g => g.groupType === 'germinatebase' && g.groupName)
              const group = groups.find(g => findFlagshipCrop(g.groupName)) || groups[0]
              this.genusGroups = { ...this.genusGroups, [name]: group ? { name: group.groupName } : null }
            }, { codes: [], callback: () => {} })
          }, { codes: [], callback: () => {} })
        })
    },
    // Typing: a number only takes what makes a number
    onSearchInput: function (event) {
      if (this.isOptionSearch || this.isFixedSearch || this.isGeofenceSearch || this.isPdciSearch || this.isHasDataSearch || this.isBioStatusSearch || this.isStorageSearch) {
        return
      }
      let value = event.target.value
      // Institute code: 3 letters (capitals), then 3 digits
      if (this.isInstitutionCodeSearch) {
        value = this.maskInstituteCode(value)
        if (event.target.value !== value) {
          event.target.value = value
        }
      }
      if (this.isNumberSearch) {
        value = cleanNumber(value, this.typeaheadFieldConfig.decimal)
        if (event.target.value !== value) {
          event.target.value = value
        }
      }
      this.searchTerm = value
      if (this.isMultiSearch) {
        this.typeaheadHighlight = -1
        this.openTypeaheadPanel()
        if (this.isTaxonSearch) {
          this.$nextTick(() => this.loadTaxonDetails())
        }
      } else if (this.hasTypeahead) {
        this.scheduleTypeahead()
      }
    },
    // Clicked or focused: the list of the current results (or of the options, the countries)
    onSearchInputActivate: function () {
      if (!this.hasTypeahead || this.isFixedSearch) {
        return
      }
      if (this.isListSearch || this.isGeofenceSearch || this.isPdciSearch || this.typeaheadResults.length > 0) {
        this.openTypeaheadPanel()
      } else {
        this.scheduleTypeahead(0)
      }
    },
    scheduleTypeahead: function (delay = TYPING_DELAY) {
      clearTimeout(this.typeaheadTimer)
      if (!this.hasTypeahead || this.isListSearch || this.isFixedSearch || this.isPdciSearch || !this.hasTypeaheadTerm) {
        this.typeaheadRequest = (this.typeaheadRequest || 0) + 1
        this.clearTypeaheadResults()
        this.typeaheadLoading = false
        this.typeaheadPanelOpen = false
        return
      }
      this.typeaheadTimer = setTimeout(() => this.loadTypeaheadPage(1), delay)
    },
    // The filter of the field chosen: the text it contains, the number compared, the value or countries chosen, or
    // the field's fixed filter
    getTypeaheadFilter: function () {
      const field = this.typeaheadFieldConfig
      if (!field) {
        return null
      }
      // Pedigree: the text in the column (a parent or child by accession number: its GID); by accession name, see
      // submitTypeaheadSearch
      if (field.distinct && this.hasTypeaheadTerm) {
        return [{ column: field.distinct, comparator: 'contains', operator: 'and', values: [this.typeaheadTerm] }]
      }
      if (field.relative && this.hasTypeaheadTerm) {
        return [{ column: `${field.relative}Gid`, comparator: 'contains', operator: 'and', values: [this.typeaheadTerm] }]
      }
      if (field.fixedFilter) {
        return field.fixedFilter
      }
      if (field.pdci) {
        return [{ column: field.column, comparator: 'between', operator: 'and', values: [this.pdciRange[0], this.pdciRange[1]] }]
      }
      if (field.options) {
        return this.selectedOption ? [{ column: field.column, comparator: 'equals', operator: 'and', values: [this.selectedOption] }] : null
      }
      if (field.countries) {
        return this.selectedCountries.length > 0 ? [{ column: field.column, comparator: 'inSet', operator: 'and', values: this.selectedCountries.map(c => c.countryName) }] : null
      }
      if (field.taxon) {
        return this.selectedTaxa.length > 0 ? [{ column: field.column, comparator: 'inSet', operator: 'and', values: this.selectedTaxa }] : null
      }
      if (field.bioStatus) {
        return this.selectedBioStatus.length > 0 ? [{ column: field.column, comparator: 'inSet', operator: 'and', values: this.selectedBioStatus }] : null
      }
      // Each kind of data chosen (all of them; those found first, e.g. publications, see submitTypeaheadSearch)
      if (field.hasData) {
        return this.selectedHasData.length > 0 ? this.selectedHasDataOptions.filter(option => option.filter).map(option => option.filter) : null
      }
      if (!field.column || !this.hasTypeaheadTerm) {
        return null
      }
      return field.number
        ? [{ column: field.column, comparator: this.numberComparator, operator: 'and', values: [Number(this.typeaheadTerm)] }]
        : [{ column: field.column, comparator: 'contains', operator: 'and', values: [this.typeaheadTerm] }]
    },
    loadTypeaheadPage: function (page) {
      // Institutions: looked up on FAO WIEWS
      if (this.isInstitutionSearch) {
        this.loadInstitutionPage(page)
        return
      }
      // Pedigree: pedigree datasets, germplasm (parent, child), values of the pedigree table
      if (this.isPedigreeDatasetSearch) {
        this.loadOwnTablePage(page, {
          key: 'pedigree-datasets',
          api: apiPostDatasetTable,
          orderBy: 'datasetName',
          filter: [
            { column: 'datasetName', comparator: 'contains', operator: 'and', values: [this.typeaheadTerm] },
            { column: 'datasetType', comparator: 'equals', operator: 'and', values: ['pedigree'] }
          ]
        })
        return
      }
      if (this.isRelativeSearch) {
        this.loadOwnTablePage(page, {
          key: `pedigree-relative-${this.relativeSearchBy}`,
          api: apiPostGermplasmTable,
          orderBy: 'germplasmName',
          filter: [{ column: this.relativeSearchBy === 'name' ? 'germplasmDisplayName' : 'germplasmName', comparator: 'contains', operator: 'and', values: [this.typeaheadTerm] }],
          onData: data => this.loadGermplasmGroups(data)
        })
        return
      }
      if (this.isDistinctSearch) {
        this.loadDistinctPage(page)
        return
      }
      // Collaborators, institutions of datasets: their own tables
      if (this.isCollaboratorSearch) {
        this.loadCollaboratorPage(page)
        return
      }
      if (this.isDatasetInstitutionSearch) {
        this.loadDatasetInstitutionPage(page)
        return
      }
      const scope = this.typeaheadScope
      const geofence = this.isGeofenceSearch
      const filter = geofence ? null : this.getTypeaheadFilter()
      if (!scope || (!filter && !(geofence && this.geofencePolygons.length > 0))) {
        return
      }
      const term = geofence ? '' : this.typeaheadTerm
      // The area drawn identifies a geofence search
      const what = geofence ? this.getGeofenceText() : term.toLowerCase()
      const key = `${this.searchScope}|${this.typeaheadField}|${this.isNumberSearch ? this.numberComparator : ''}|${what}`
      const show = result => {
        this.typeaheadResults = result.data
        if (scope.germplasm) {
          this.loadGermplasmGroups(result.data)
        }
        this.typeaheadCount = result.count
        this.typeaheadPage = page
        this.typeaheadResultTerm = term
        this.typeaheadHighlight = -1
        this.typeaheadLoading = false
        this.openTypeaheadPanel()
      }

      const cached = cache.get(`${key}|${page}`)
      if (cached) {
        this.typeaheadRequest = (this.typeaheadRequest || 0) + 1
        show(cached)
        return
      }

      // Only the answer to the latest request counts
      const request = (this.typeaheadRequest || 0) + 1
      this.typeaheadRequest = request
      this.typeaheadLoading = true
      this.openTypeaheadPanel()

      const first = cache.get(`${key}|1`)
      const query = {
        page,
        limit: PAGE_SIZE,
        // The total is counted once, for the first page
        prevCount: page > 1 && first ? first.count : -1,
        orderBy: scope.orderBy,
        ascending: 1
      }
      if (geofence) {
        query.polygons = this.geofencePolygons
      } else {
        query.filter = filter
      }
      // A geofence: the polygon search of the scope (locations, germplasm)
      ;(geofence ? this.typeaheadFieldConfig.geofenceApi : scope.api)(query, result => {
        const data = (result && result.data) || []
        // Records the scope leaves out (e.g. sites without a name) are not counted either
        const kept = scope.keep ? data.filter(scope.keep) : data
        const total = (result && result.count) || (first ? first.count : 0)
        const answer = { data: kept, count: Math.max(kept.length, total - (data.length - kept.length)) }
        remember(`${key}|${page}`, answer)
        if (request === this.typeaheadRequest) {
          show(answer)
        }
      }, {
        codes: [],
        callback: () => {
          if (request === this.typeaheadRequest) {
            this.typeaheadLoading = false
          }
        }
      })
    },
    openTypeaheadPanel: function () {
      // As wide as the search field
      const field = this.$refs.searchField
      this.typeaheadPanelWidth = field ? field.offsetWidth : null
      this.typeaheadPanelOpen = true
    },
    closeTypeaheadPanel: function () {
      this.typeaheadPanelOpen = false
      this.typeaheadHighlight = -1
    },
    goTypeaheadPage: function (step) {
      const page = this.typeaheadPage + step
      if (!this.isListSearch && page >= 1 && page <= this.typeaheadPageCount) {
        // (distinct values: from those already read)
        // (a geofence search too: the area stays the same)
        this.loadTypeaheadPage(page)
      }
    },
    // Arrows move through the list (and its pages), Enter picks the highlighted item, Escape closes the list.
    // Backspace in an empty country field takes the last country chosen away.
    onSearchKeydown: function (event) {
      if (!this.hasTypeahead) {
        return
      }
      const count = this.typeaheadItemCount
      if (event.key === 'Escape') {
        this.closeTypeaheadPanel()
      } else if (event.key === 'Backspace' && this.isCountrySearch && !this.searchTerm && this.selectedCountries.length > 0) {
        this.selectedCountries = this.selectedCountries.slice(0, -1)
      } else if (event.key === 'Backspace' && this.isTaxonSearch && !this.searchTerm && this.selectedTaxa.length > 0) {
        this.selectedTaxa = this.selectedTaxa.slice(0, -1)
      } else if (event.key === 'Backspace' && this.isHasDataSearch && this.selectedHasData.length > 0) {
        this.selectedHasData = this.selectedHasData.slice(0, -1)
      } else if (event.key === 'Backspace' && this.isBioStatusSearch && this.selectedBioStatus.length > 0) {
        this.selectedBioStatus = this.selectedBioStatus.slice(0, -1)
      } else if (event.key === 'Backspace' && this.isStorageSearch && this.selectedStorage.length > 0) {
        this.selectedStorage = this.selectedStorage.slice(0, -1)
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        if (!this.typeaheadPanelOpen) {
          this.onSearchInputActivate()
          return
        }
        if (count > 0) {
          const step = event.key === 'ArrowDown' ? 1 : -1
          this.typeaheadHighlight = (this.typeaheadHighlight + step + count) % count
        }
      } else if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft') && this.typeaheadPanelOpen && this.typeaheadHighlight !== -1 && !this.isListSearch) {
        event.preventDefault()
        this.goTypeaheadPage(event.key === 'ArrowRight' ? 1 : -1)
      } else if (event.key === 'Enter' && this.typeaheadPanelOpen && this.typeaheadHighlight !== -1) {
        event.preventDefault()
        if (this.isOptionSearch) {
          this.chooseOption(this.optionList[this.typeaheadHighlight])
        } else if (this.isCountrySearch) {
          this.toggleCountry(this.countryOptions[this.typeaheadHighlight])
        } else if (this.isTaxonSearch) {
          this.toggleTaxon(this.taxonOptions[this.typeaheadHighlight])
        } else if (this.isHasDataSearch) {
          this.toggleHasData(this.hasDataOptions[this.typeaheadHighlight])
        } else if (this.isBioStatusSearch) {
          this.toggleBioStatus(this.bioStatusOptions[this.typeaheadHighlight])
        } else if (this.isStorageSearch) {
          this.toggleStorage(this.storageOptions[this.typeaheadHighlight])
        } else {
          this.openTypeaheadItem(this.typeaheadItems[this.typeaheadHighlight])
        }
      }
    },
    // The focus left the search (not for its list): the list closes
    onSearchWrapFocusOut: function (event) {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.closeTypeaheadPanel()
      }
    },
    // A value of an "options" list: the table filtered by it (it also stays chosen for the Search button)
    chooseOption: function (option) {
      if (!option) {
        return
      }
      this.selectedOption = option.key
      this.closeTypeaheadPanel()
      this.submitTypeaheadSearch()
    },
    // A country of the list: chosen, or no longer chosen. The list stays open to choose more.
    toggleCountry: function (country) {
      if (!country) {
        return
      }
      this.selectedCountries = this.selectedCountries.some(c => c.id === country.id)
        ? this.selectedCountries.filter(c => c.id !== country.id)
        : this.selectedCountries.concat([{ id: country.id, countryName: country.countryName, countryCode2: country.countryCode2, countryCode3: country.countryCode3 }])
      this.searchTerm = ''
      this.typeaheadHighlight = -1
    },
    removeCountry: function (country) {
      this.selectedCountries = this.selectedCountries.filter(c => c.id !== country.id)
    },
    // A genus or species of the list: chosen, or no longer chosen. The text typed is cleared (the list closes until
    // something is typed again).
    toggleTaxon: function (option) {
      if (!option) {
        return
      }
      this.selectedTaxa = this.selectedTaxa.includes(option.name)
        ? this.selectedTaxa.filter(name => name !== option.name)
        : this.selectedTaxa.concat([option.name])
      this.searchTerm = ''
      this.typeaheadHighlight = -1
    },
    // A kind of data of the list: chosen, or no longer chosen. The list stays open to choose more.
    toggleHasData: function (option) {
      if (!option) {
        return
      }
      this.selectedHasData = this.selectedHasData.includes(option.key)
        ? this.selectedHasData.filter(key => key !== option.key)
        : this.selectedHasData.concat([option.key])
    },
    // A biological status of the list: chosen, or no longer chosen. The list stays open to choose more.
    toggleBioStatus: function (status) {
      if (!status) {
        return
      }
      this.selectedBioStatus = this.selectedBioStatus.includes(status.value)
        ? this.selectedBioStatus.filter(value => value !== status.value)
        : this.selectedBioStatus.concat([status.value])
    },
    // The STORAGE codes in use (those of the germplasm), in code order; all the MCPD codes when BrAPI gives none
    loadStorageTypes: function () {
      getGermplasmStorage().then(storage => {
        const used = new Set(Object.values(storage).reduce((all, codes) => all.concat(codes), []))
        this.storageTypes = CODE_DOMAINS.storage
          .filter(item => used.size === 0 || used.has(`${item.code}`))
          .map(item => ({ code: item.code, name: item.name }))
          .sort((a, b) => a.code - b.code)
      })
    },
    // A type of storage of the list: chosen, or no longer chosen. The list stays open to choose more.
    toggleStorage: function (type) {
      if (!type) {
        return
      }
      const code = `${type.code}`
      this.selectedStorage = this.selectedStorage.includes(code)
        ? this.selectedStorage.filter(c => c !== code)
        : this.selectedStorage.concat([code])
    },
    removeStorage: function (code) {
      this.selectedStorage = this.selectedStorage.filter(c => c !== `${code}`)
    },
    // The broom chip: every value chosen in the field goes
    clearAllChoices: function () {
      this.selectedCountries = []
      this.selectedTaxa = []
      this.selectedHasData = []
      this.selectedBioStatus = []
      this.selectedStorage = []
      this.typeaheadHighlight = -1
    },
    removeBioStatus: function (value) {
      this.selectedBioStatus = this.selectedBioStatus.filter(v => v !== value)
    },
    removeHasData: function (key) {
      this.selectedHasData = this.selectedHasData.filter(k => k !== key)
    },
    removeTaxon: function (name) {
      this.selectedTaxa = this.selectedTaxa.filter(n => n !== name)
    },
    capitalize,
    getDatasetTypeInfo: function (key) {
      const type = datasetTypes[key]
      return type && key !== 'unknown' ? type : { ...datasetTypes.unknown, path: UNKNOWN_TYPE_ICON }
    },
    // The type colour (green for other items), light behind the icon
    getDatasetIconStyle: function (key) {
      const type = key ? this.getDatasetTypeInfo(key) : null
      return this.getColorStyle(type && type.color ? type.color() : null)
    },
    // A colour as text, with a light background of it (green without a colour)
    getColorStyle: function (value) {
      const color = value || '#3b6b35'
      return { color, background: /^#[0-9a-f]{6}$/i.test(color) ? `${color}1f` : 'var(--home-badge-bg)' }
    },
    // A count, short (1K) in the badge, in full on hover (some counts come as { value })
    getCountBadge: function (value, unit) {
      const raw = value && typeof value === 'object' ? value.value : value
      const number = raw === null || raw === undefined ? 0 : Number(raw)
      return { text: getNumberWithSuffix(number, 2), title: `${number.toLocaleString()} ${unit}` }
    },
    // A result of the list: the table of the scope showing it
    openTypeaheadItem: function (item) {
      if (!item) {
        return
      }
      this.closeTypeaheadPanel()
      // A germplasm (germplasm scope) on the home page: its page (the new passport page)
      if (item.germplasm && !item.relative && !this.inline) {
        this.$router.push({ name: Pages.passport, params: { germplasmId: item.id } })
        return
      }
      // Pedigree: a dataset, a germplasm as parent or child, a value of the pedigree table
      if (item.pedigreeDataset) {
        this.goToTable([{ column: 'datasetId', comparator: 'equals', operator: 'and', values: [item.id] }], this.getItemLabel(item))
        return
      }
      if (item.relative) {
        const gid = item.record.germplasmGid || item.record.germplasmName
        this.goToTable([{ column: `${this.typeaheadFieldConfig.relative}Gid`, comparator: 'equals', operator: 'and', values: [gid] }], this.getItemLabel(item))
        return
      }
      if (item.distinctValue !== undefined) {
        this.goToTable([{ column: this.typeaheadFieldConfig.distinct, comparator: 'equals', operator: 'and', values: [item.distinctValue] }], item.distinctValue)
        return
      }
      // A collaborator: the datasets of the collaborator, with their collaborators shown
      if (item.person) {
        this.goToCollaboratorDatasets(item)
        return
      }
      // An institution of datasets: its datasets, with their institutions shown
      if (item.datasetInstitution) {
        const ids = this.getInstitutionDatasetIds(item.record)
        this.goToTable([{ column: 'datasetId', comparator: 'inSet', operator: 'and', values: ids.length > 0 ? ids : [-1] }], plain(item.record.institutionName), { openDetails: 'institutions' })
        return
      }
      // An institute: the germplasm with it, as an institution of the type chosen
      if (item.institution) {
        this.goToInstitutionGermplasm({ code: item.record.instcode })
        return
      }
      const scope = this.typeaheadScope
      this.goToTable([{ column: scope.idKey, comparator: 'equals', operator: 'and', values: [item.id] }], this.getItemLabel(item))
    },
    // The name of a result, for the breadcrumb of the Search page
    getItemLabel: function (item) {
      const parts = item.nameParts || item.numberParts || []
      return parts.map(part => part.text).join('') || `${item.id}`
    },
    // Institute code mask: 3 letters (in capitals), then 3 digits
    maskInstituteCode: function (value) {
      return `${value || ''}`.toUpperCase().split('').reduce((result, char) => {
        if (result.length < 3 && /[A-Z]/.test(char)) {
          return result + char
        }
        if (result.length >= 3 && result.length < 6 && /[0-9]/.test(char)) {
          return result + char
        }
        return result
      }, '')
    },
    // FAO WIEWS institutes with the complete code typed, or whose name contains the name typed (5 at a time)
    loadInstitutionPage: function (page) {
      const term = this.typeaheadTerm
      if (!this.hasTypeaheadTerm) {
        return
      }
      const byCode = this.isInstitutionCodeSearch
      const key = `wiews|${byCode ? 'code' : 'name'}|${term.toLowerCase()}|${page}`
      const show = result => {
        this.typeaheadResults = result.data
        this.typeaheadCount = result.count
        this.typeaheadPage = page
        this.typeaheadResultTerm = term
        this.typeaheadHighlight = -1
        this.typeaheadLoading = false
        this.typeaheadError = null
        this.openTypeaheadPanel()
      }
      const cached = cache.get(key)
      if (cached) {
        this.typeaheadRequest = (this.typeaheadRequest || 0) + 1
        show(cached)
        return
      }
      const request = (this.typeaheadRequest || 0) + 1
      this.typeaheadRequest = request
      this.typeaheadLoading = true
      this.typeaheadError = null
      this.openTypeaheadPanel()
      searchWiewsOrganizations({ instcode: byCode ? term : null, name: byCode ? null : term, from: (page - 1) * PAGE_SIZE, size: PAGE_SIZE })
        .then(result => {
          const answer = { data: result.data, count: result.total }
          remember(key, answer)
          if (request === this.typeaheadRequest) {
            show(answer)
          }
        })
        .catch(() => {
          if (request === this.typeaheadRequest) {
            this.typeaheadLoading = false
            this.typeaheadResults = []
            this.typeaheadCount = 0
            this.typeaheadError = 'FAO WIEWS could not be reached. Try again later.'
          }
        })
    },
    // A table of its own of a field (collaborators, institutions of datasets), 5 at a time: { key, api, filter, orderBy }
    // Values of a column of the pedigree table containing the text, each value once (the table has one row per
    // pedigree), 5 at a time: the rows are read once per text (up to DISTINCT_ROWS), the values paged here
    loadDistinctPage: function (page) {
      const term = this.typeaheadTerm
      const column = this.typeaheadFieldConfig.distinct
      if (!this.hasTypeaheadTerm) {
        return
      }
      const key = `pedigree-distinct|${column}|${term.toLowerCase()}`
      const show = values => {
        this.typeaheadResults = values.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(value => ({ [column]: value }))
        this.typeaheadCount = values.length
        this.typeaheadPage = page
        this.typeaheadResultTerm = term
        this.typeaheadHighlight = -1
        this.typeaheadLoading = false
        this.openTypeaheadPanel()
      }
      const cached = cache.get(key)
      if (cached) {
        this.typeaheadRequest = (this.typeaheadRequest || 0) + 1
        show(cached)
        return
      }
      const request = (this.typeaheadRequest || 0) + 1
      this.typeaheadRequest = request
      this.typeaheadLoading = true
      this.openTypeaheadPanel()
      apiPostPedigreeTable({ page: 1, limit: DISTINCT_ROWS, orderBy: column, ascending: 1, filter: [{ column, comparator: 'contains', operator: 'and', values: [term] }] }, result => {
        const values = []
        ;((result && result.data) || []).forEach(record => {
          const value = plain(record[column])
          if (value !== '' && !values.some(v => v.toLowerCase() === value.toLowerCase())) {
            values.push(value)
          }
        })
        remember(key, values)
        if (request === this.typeaheadRequest) {
          show(values)
        }
      }, {
        codes: [],
        callback: () => {
          if (request === this.typeaheadRequest) {
            this.typeaheadLoading = false
          }
        }
      })
    },
    // "onData": called with the records shown (e.g. to look up the groups of germplasm)
    loadOwnTablePage: function (page, { key, api, filter, orderBy, onData }) {
      const term = this.typeaheadTerm
      if (!this.hasTypeaheadTerm) {
        return
      }
      const cacheKey = `${key}|${term.toLowerCase()}|${page}`
      const show = result => {
        this.typeaheadResults = result.data
        if (onData) {
          onData(result.data)
        }
        this.typeaheadCount = result.count
        this.typeaheadPage = page
        this.typeaheadResultTerm = term
        this.typeaheadHighlight = -1
        this.typeaheadLoading = false
        this.openTypeaheadPanel()
      }
      const cached = cache.get(cacheKey)
      if (cached) {
        this.typeaheadRequest = (this.typeaheadRequest || 0) + 1
        show(cached)
        return
      }
      const request = (this.typeaheadRequest || 0) + 1
      this.typeaheadRequest = request
      this.typeaheadLoading = true
      this.openTypeaheadPanel()
      api({ page, limit: PAGE_SIZE, prevCount: -1, orderBy, ascending: 1, filter }, result => {
        const answer = { data: (result && result.data) || [], count: (result && result.count) || 0 }
        remember(cacheKey, answer)
        if (request === this.typeaheadRequest) {
          show(answer)
        }
      }, {
        codes: [],
        callback: () => {
          if (request === this.typeaheadRequest) {
            this.typeaheadLoading = false
          }
        }
      })
    },
    // Collaborators whose last or first name contains the text; a text with "@" is an email: its part before the "@"
    // ends the name of the address, its part after starts the domain (either can be missing, e.g. "@ipk")
    loadCollaboratorPage: function (page) {
      const term = this.typeaheadTerm
      let filter
      if (term.includes('@')) {
        const at = term.indexOf('@')
        const before = term.substring(0, at).trim()
        const after = term.substring(at + 1).trim()
        filter = [
          before ? { column: 'collaboratorEmail', comparator: 'contains', operator: 'and', values: [`${before}@`] } : null,
          after ? { column: 'collaboratorEmail', comparator: 'contains', operator: 'and', values: [`@${after}`] } : null
        ].filter(f => f)
        if (filter.length === 0) {
          filter = [{ column: 'collaboratorEmail', comparator: 'contains', operator: 'and', values: ['@'] }]
        }
      } else {
        filter = [
          { column: 'collaboratorLastName', comparator: 'contains', operator: 'or', values: [term] },
          { column: 'collaboratorFirstName', comparator: 'contains', operator: 'or', values: [term] }
        ]
      }
      this.loadOwnTablePage(page, { key: 'collaborators', api: apiPostCollaboratorsTable, filter, orderBy: 'collaboratorLastName' })
    },
    // Institutions of datasets whose name contains the text
    loadDatasetInstitutionPage: function (page) {
      this.loadOwnTablePage(page, {
        key: 'dataset-institutions',
        api: apiPostInstitutionDatasetTable,
        orderBy: 'institutionName',
        filter: [
          { column: 'institutionName', comparator: 'contains', operator: 'and', values: [this.typeaheadTerm] },
          { column: 'allDatasetIds', comparator: 'isNotNull', operator: 'and', values: [] }
        ]
      })
    },
    // An institution of datasets as shown: its name (the text found marked), its code or acronym below, the flag of
    // its country when it has one
    getDatasetInstitutionItem: function (record, term) {
      return {
        id: record.institutionId,
        record,
        datasetInstitution: true,
        icon: mdiOfficeBuildingMarkerOutline,
        iconStyle: this.getColorStyle(null),
        codeParts: splitMatches(plain(record.institutionName), term),
        nameParts: [{ text: [plain(record.institutionCode), plain(record.institutionAcronym)].filter(v => v !== '').join(' · '), match: false }],
        flag: record.countryCode2 ? `${record.countryCode2}`.toLowerCase() : null,
        country: plain(record.countryName),
        badges: []
      }
    },
    // The ids of the datasets of an institution (only those the user may see), as a list
    getInstitutionDatasetIds: function (record) {
      const ids = typeof record.allDatasetIds === 'string' ? JSON.parse(record.allDatasetIds) : (record.allDatasetIds || [])
      return [...new Set(ids)]
    },
    // A collaborator as shown: "Last name, First name" (the text found marked), the name of the institute below, the
    // flag of the collaborator's country
    getCollaboratorItem: function (record, term) {
      const name = [plain(record.collaboratorLastName), plain(record.collaboratorFirstName)].filter(v => v !== '').join(', ')
      return {
        id: record.collaboratorId,
        record,
        person: true,
        icon: mdiCardAccountDetails,
        iconStyle: this.getColorStyle(null),
        codeParts: term.includes('@') ? [{ text: name, match: false }] : splitMatches(name, term),
        // Found by email: the email (the parts typed marked), then the institute
        nameParts: term.includes('@')
          ? splitMatches(plain(record.collaboratorEmail), term.substring(0, term.indexOf('@')).trim() || term.substring(term.indexOf('@')))
            .concat(plain(record.institutionName) ? [{ text: ` · ${plain(record.institutionName)}`, match: false }] : [])
          : [{ text: plain(record.institutionName), match: false }],
        flag: record.countryCode2 ? `${record.countryCode2}`.toLowerCase() : null,
        country: plain(record.countryName),
        badges: []
      }
    },
    // The datasets of a collaborator (the collaborators table has one row per dataset), with their collaborators shown
    goToCollaboratorDatasets: function (item) {
      this.typeaheadLoading = true
      apiPostCollaboratorsTable({ page: 1, limit: MAX_JAVA_INTEGER, filter: [{ column: 'collaboratorId', comparator: 'equals', operator: 'and', values: [item.id] }] }, result => {
        this.typeaheadLoading = false
        const ids = [...new Set(((result && result.data) || []).map(r => r.datasetId).filter(id => id !== null && id !== undefined))]
        this.goToTable([{ column: 'datasetId', comparator: 'inSet', operator: 'and', values: ids.length > 0 ? ids : [-1] }], this.getItemLabel({ nameParts: item.codeParts }), { openDetails: 'collaborators' })
      }, { codes: [], callback: () => { this.typeaheadLoading = false } })
    },
    // A FAO WIEWS institute as shown: its code (stronger), its name below, the flag of the country of its code
    getInstitutionItem: function (record, term) {
      const byCode = this.isInstitutionCodeSearch
      const flag = getCountryFlagCode(record.instcode.substring(0, 3))
      return {
        id: record.instcode,
        record,
        institution: true,
        icon: mdiOfficeBuildingMarkerOutline,
        iconStyle: this.getColorStyle(null),
        codeParts: byCode ? splitMatches(record.instcode, term) : [{ text: record.instcode, match: false }],
        nameParts: byCode ? [{ text: plain(record.name), match: false }] : splitMatches(plain(record.name), term),
        flag,
        country: record.country,
        badges: []
      }
    },
    // The germplasm with the institution (any type), through the "institutions" column of the germplasm table. The
    // server finds a value in it as letters and digits only: a name is searched by its longest word.
    goToInstitutionGermplasm: function ({ code, name }) {
      const searched = code ? `${code}`.toUpperCase() : getLongestWord(name)
      this.goToTable(searched
        ? [{ column: 'institutions', comparator: 'jsonSearch', operator: 'and', values: [searched] }]
        // Nothing to search with: a filter that finds none
        : [{ column: 'germplasmId', comparator: 'inSet', operator: 'and', values: [-1] }])
    },
    // A germplasm as shown: the icon of its group, accession number (marked when searched) and name, taxonomy
    getGermplasmItem: function (record, term, field) {
      const number = plain(record.germplasmName)
      const displayName = plain(record.germplasmDisplayName)
      // The accession name: the display name, or ACCENAME when the display name is the accession number
      const accessionName = displayName && displayName !== number ? displayName : plain(record.germplasmNumber)
      const group = this.germplasmGroups[record.germplasmId]
      const crop = group ? findFlagshipCrop(group.name) : null
      return {
        id: record.germplasmId,
        record,
        germplasm: true,
        icon: crop ? crop.icon : mdiSprout,
        iconStyle: { color: `var(--cp-crop-${crop ? crop.key : 'other'}-fg)`, background: `var(--cp-crop-${crop ? crop.key : 'other'}-bg)` },
        iconTitle: group ? group.name : null,
        // The group as a badge, in the colours of its crop
        group: group ? { name: group.name, className: `cp-crop-${crop ? crop.key : 'other'}` } : null,
        numberParts: field === 'name' ? splitMatches(number, term) : [{ text: number, match: false }],
        accessionNameParts: accessionName ? (field === 'displayName' ? splitMatches(accessionName, term) : [{ text: accessionName, match: false }]) : [],
        taxonomy: [record.genus, record.species, record.subtaxa].map(value => plain(value)).filter(value => value !== '').join(' '),
        badges: []
      }
    },
    // The groups of the germplasm listed (not read yet): the first germplasm group that is a flagship crop, else the
    // first germplasm group. Read once per germplasm.
    loadGermplasmGroups: function (records) {
      records.filter(record => !(record.germplasmId in this.germplasmGroups)).forEach(record => {
        const id = record.germplasmId
        this.germplasmGroups = { ...this.germplasmGroups, [id]: null }
        apiPostGermplasmGroupTable(id, { page: 1, limit: GERMPLASM_GROUPS_LIMIT }, result => {
          const groups = ((result && result.data) || []).filter(g => g.groupType === 'germinatebase' && g.groupName)
          const group = groups.find(g => findFlagshipCrop(g.groupName)) || groups[0]
          this.germplasmGroups = { ...this.germplasmGroups, [id]: group ? { name: group.groupName } : null }
        }, { codes: [], callback: () => {} })
      })
    },
    isGermplasmMarked: function (id) {
      return this.markedGermplasm.indexOf(id) !== -1
    },
    // The checkbox of a germplasm: marked or no longer marked, like the checkbox of the germplasm table
    setGermplasmMarked: function (id, marked) {
      this.$store.dispatch(marked ? 'addMarkedIds' : 'removeMarkedIds', { type: 'germplasm', ids: [id] })
    },
    // PDCI sliders: the lower one never above the upper one
    setPdciRange: function (index, value) {
      const number = Number(value)
      const range = [...this.pdciRange]
      range[index] = number
      if (range[0] > range[1]) {
        range[index === 0 ? 1 : 0] = number
      }
      this.pdciRange = range
    },
    // The map of a geofence search is ready: the areas drawn before are put back on it
    onGeofenceMapLoaded: function () {
      if (this.geofencePolygons.length > 0 && this.$refs.geofenceMap) {
        this.$refs.geofenceMap.setPolygons(this.geofencePolygons)
      }
    },
    // An area drawn, changed or deleted: the locations inside the areas
    onGeofenceChanged: function (polygons) {
      this.geofencePolygons = (polygons || [])
        .map(polygon => polygon.map(point => ({ lat: point.lat, lng: point.lng })))
        .filter(polygon => polygon.length > 2)
      this.clearTypeaheadResults()
      // Listed under the map, unless the Search button opens their table (germplasm)
      if (this.geofencePolygons.length > 0 && this.geofenceListsResults) {
        this.loadTypeaheadPage(1)
      }
    },
    // The areas as the geographic search takes them in its URL: "lat,lng;lat,lng|..."
    getGeofenceText: function () {
      return this.geofencePolygons.map(polygon => polygon.map(point => `${point.lat.toFixed(6)},${point.lng.toFixed(6)}`).join(';')).join('|')
    },
    // Search button: the table of the scope filtered by the field chosen (a geofence: the geographic search with the
    // areas, which lists the locations and germplasm inside them)
    submitTypeaheadSearch: function () {
      // Parent or child by accession name: the pedigree table only holds the GID, so the GIDs of the germplasm with that
      // name are searched
      if (this.isRelativeSearch && this.relativeSearchBy === 'name' && this.hasTypeaheadTerm) {
        const column = `${this.typeaheadFieldConfig.relative}Gid`
        this.typeaheadLoading = true
        apiPostGermplasmTable({ page: 1, limit: MAX_JAVA_INTEGER, filter: [{ column: 'germplasmDisplayName', comparator: 'contains', operator: 'and', values: [this.typeaheadTerm] }] }, result => {
          this.typeaheadLoading = false
          const gids = [...new Set(((result && result.data) || []).map(g => g.germplasmGid || g.germplasmName).filter(gid => gid))]
          // None: a filter that finds none
          this.goToTable([{ column, comparator: 'inSet', operator: 'and', values: gids.length > 0 ? gids : ['-'] }])
        }, { codes: [], callback: () => { this.typeaheadLoading = false } })
        return
      }
      // Storage: the germplasm with any of the codes chosen (from BrAPI), then their table
      if (this.isStorageSearch) {
        if (this.selectedStorage.length === 0) {
          return
        }
        this.typeaheadLoading = true
        getGermplasmStorage()
          .then(storage => {
            const ids = Object.keys(storage).filter(id => storage[id].some(code => this.selectedStorage.includes(code))).map(id => Number(id))
            // None: a filter that finds none
            this.goToTable([{ column: 'germplasmId', comparator: 'inSet', operator: 'and', values: ids.length > 0 ? ids : [-1] }])
          })
          .finally(() => { this.typeaheadLoading = false })
        return
      }
      // Kinds of data whose filter is found first (publications): then the table with all of them
      if (this.isHasDataSearch && this.selectedHasDataOptions.some(option => option.resolveFilter)) {
        const filters = this.getTypeaheadFilter() || []
        this.typeaheadLoading = true
        Promise.all(this.selectedHasDataOptions.filter(option => option.resolveFilter).map(option => option.resolveFilter()))
          .then(resolved => this.goToTable(filters.concat(resolved)))
          .catch(() => {})
          .finally(() => { this.typeaheadLoading = false })
        return
      }
      if (this.isInstitutionSearch) {
        if (this.canSubmitSearch) {
          this.goToInstitutionGermplasm(this.isInstitutionCodeSearch ? { code: this.typeaheadTerm } : { name: this.typeaheadTerm })
        }
        return
      }
      if (this.isGeofenceSearch) {
        if (this.geofencePolygons.length === 0) {
          return
        }
        const idsApi = this.typeaheadFieldConfig.geofenceIdsApi
        // Germplasm: their table, with those inside the areas
        if (idsApi) {
          this.typeaheadLoading = true
          idsApi({ polygons: this.geofencePolygons }, result => {
            this.typeaheadLoading = false
            const ids = [...new Set((result && result.data) || [])]
            // None inside: a filter that finds none
            this.goToTable([{ column: this.typeaheadScope.idKey, comparator: 'inSet', operator: 'and', values: ids.length > 0 ? ids : [-1] }])
          }, { codes: [], callback: () => { this.typeaheadLoading = false } })
          return
        }
        // The Search page: the locations inside the areas, in its table
        if (this.inline) {
          this.emitSearch({ polygons: this.geofencePolygons })
          return
        }
        this.$router.push({ name: Pages.geographicSearch, query: { tabIndex: 1, polygons: this.getGeofenceText() } })
        return
      }
      const filter = this.getTypeaheadFilter()
      if (filter) {
        this.goToTable(filter)
      }
    },
    // The table of the scope with the filter: its page, or (inline) the results of the Search page. "label": the
    // result chosen, shown in the breadcrumb instead of the values of the field.
    // "options": { openDetails } details of the datasets shown at once (e.g. 'collaborators')
    goToTable: function (filter, label, options = {}) {
      if (this.inline) {
        this.emitSearch({ filter, openDetails: options.openDetails || null }, label)
        return
      }
      const scope = this.typeaheadScope
      // No page of its own (pedigrees): the results show on the Search page
      if (!scope.page) {
        this.$router.push({
          name: Pages.search,
          query: {
            searchScope: this.searchScope,
            searchTable: scope.tableName,
            searchFilter: JSON.stringify(filter),
            searchCrumbs: JSON.stringify(this.getSearchCrumbs(label)),
            // The search module of the Search page shows the same search
            searchState: JSON.stringify(this.getModuleState())
          }
        })
        return
      }
      const query = { [`${scope.tableName}-filter`]: JSON.stringify(filter) }
      if (options.openDetails) {
        query[`${scope.tableName}-details`] = options.openDetails
      }
      this.$router.push({ name: scope.page, query })
    },
    // What the module shows (besides the scope): the field, the text and the choices of the field
    getModuleState: function () {
      return {
        field: this.typeaheadField,
        term: this.searchTerm || '',
        relativeSearchBy: this.relativeSearchBy,
        institutionSearchBy: this.institutionSearchBy,
        numberComparator: this.numberComparator,
        selectedOption: this.selectedOption
      }
    },
    // Shows a state of getModuleState (the scope already set), without searching nor opening the list
    applyModuleState: function (state) {
      if (!state) {
        return
      }
      if (state.field && this.typeaheadFields.some(field => field.value === state.field)) {
        this.typeaheadField = state.field
      }
      // After the field's change (which clears the choices) was handled
      this.$nextTick(() => {
        if (state.relativeSearchBy) {
          this.relativeSearchBy = state.relativeSearchBy
        }
        if (state.institutionSearchBy) {
          this.institutionSearchBy = state.institutionSearchBy
        }
        if (state.numberComparator) {
          this.numberComparator = state.numberComparator
        }
        this.searchTerm = state.term || ''
        this.$nextTick(() => {
          // Nothing searched nor shown: the results are on the page already
          clearTimeout(this.typeaheadTimer)
          this.typeaheadRequest = (this.typeaheadRequest || 0) + 1
          this.typeaheadLoading = false
          this.closeTypeaheadPanel()
          this.selectedOption = state.selectedOption || null
        })
      })
    },
    emitSearch: function (search, label) {
      this.closeTypeaheadPanel()
      this.$emit('search', { scope: this.searchScope, tableName: this.typeaheadScope.tableName, crumbs: this.getSearchCrumbs(label), ...search })
    },
    // Breadcrumb of a search: the scope, the field and what was searched (or the result chosen)
    // (a result chosen: what was searched, then the result, e.g. Datasets > Data points > Greater than 1000 > Test dataset)
    getSearchCrumbs: function (label) {
      const scope = (this.searchScopes || []).find(s => s.value === this.searchScope)
      const field = this.typeaheadFieldConfig
      const value = this.getSearchValueText()
      return [scope ? scope.text : this.searchScope, field ? field.text : null, value, label && label !== value ? label : null].filter(crumb => crumb)
    },
    // What was searched, as text
    getSearchValueText: function () {
      const field = this.typeaheadFieldConfig || {}
      const list = values => values.join(', ')
      if (field.options) {
        return this.selectedOptionText
      }
      if (field.countries) {
        return list(this.selectedCountries.map(c => c.countryName))
      }
      if (field.taxon) {
        return list(this.selectedTaxa.map(name => field.taxon === 'genus' ? capitalize(name) : name))
      }
      if (field.hasData) {
        return list(this.selectedHasDataOptions.map(option => option.text))
      }
      if (field.bioStatus) {
        return list(this.selectedBioStatusOptions.map(status => status.code !== null ? `${status.code} ${status.name}` : status.name))
      }
      if (field.storage) {
        return list(this.selectedStorageOptions.map(type => `${type.code} ${type.name}`))
      }
      if (field.pdci) {
        return this.pdciRangeText
      }
      if (field.geofence) {
        return this.searchInputValue
      }
      if (field.fixedFilter) {
        return null
      }
      if (field.number) {
        const comparator = NUMBER_COMPARATORS.find(c => c.value === this.numberComparator)
        return `${comparator ? comparator.text : this.numberComparator} ${this.typeaheadTerm}`
      }
      if (field.relative) {
        const by = RELATIVE_SEARCH_BY.find(option => option.value === this.relativeSearchBy)
        return `${by ? by.text : ''}: "${this.typeaheadTerm}"`
      }
      if (field.institution) {
        const by = INSTITUTION_SEARCH_BY.find(option => option.value === this.institutionSearchBy)
        return `${by ? by.text : ''}: ${this.typeaheadTerm}`
      }
      return `"${this.typeaheadTerm}"`
    }
  },
  beforeDestroy: function () {
    clearTimeout(this.typeaheadTimer)
  }
}
