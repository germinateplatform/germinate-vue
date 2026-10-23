// Updates MCPD fields of one germplasm through the MCPD data import in "update" mode (Excel template), the only way
// Germinate 4.8 has to change passport data of an existing germplasm. (The BrAPI PUT of germplasm in this version
// only creates germplasm: it refuses or fails on existing ones.)
//
// How the importer updates (checked on the compiled Germinate 4.8.4 server):
// - each row is matched to the germplasm with the same ACCENUMB (general identifier);
// - a database value is only changed when the cell is different from it and not empty: empty cells never change
//   anything, which also means a value can't be emptied this way;
// - some values are always written from the row, even if their column is missing:
//   - germplasm name: ACCENUMB;
//   - display name: ACCENAME, or ACCENUMB when ACCENAME is empty;
//   - entity type: "Entity type", or "Accession" when empty;
//   - synonyms: ACCENAME followed by the OTHERNUMB values, replacing the current synonyms (only when ACCENAME is given).
// So the row also carries the current ACCENAME, OTHERNUMB and entity type, and the update is refused when the
// current data doesn't follow these rules (the import would then change more than the edited fields).

import { utils, write } from 'xlsx'
import { apiPostDataUpload, apiPostDataAsyncImport, apiGetDataAsyncImportStart, apiDeleteDataAsyncImport } from '@/mixins/api/misc'
import { apiGetGermplasmMcpd, apiPostGermplasmAttributeTable } from '@/mixins/api/germplasm'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'
import { apiDeleteFileresource } from '@/mixins/api/dataset'
import { getCountryFlagCode } from '@/mixins/mcpd'

// MCPD fields this module can update, keyed by their name in the MCPD of the germplasm, with their template column and
// the longest value the database takes
const EDITABLE_MCPD_FIELDS = {
  // "mcpd"."puid" is a TEXT column (65,535 bytes), up to 4 bytes per utf8mb4 character
  puid: { column: 'PUID', maxLength: 16383 },
  // Goes to "germinatebase"."number" and "mcpd"."accename", and the importer also makes it the display name and the
  // first synonym: all varchar(255) (synonyms: JSON)
  accename: { column: 'ACCENAME', maxLength: 255 },
  // Only goes to "mcpd"."collnumb", varchar(255)
  collnumb: { column: 'COLLNUMB', maxLength: 255 },
  // Institutions (ex-situ). With a code in the row, the importer looks the institution up by its code (an existing one
  // is reused, only its missing name and address are filled in) or creates it with the name and address, and links it
  // to the germplasm with the type of the column. Links already there are kept: this adds an institution, it can't
  // replace one. The values also go to their "mcpd" columns (varchar(255), the address TEXT).
  collcode: { column: 'COLLCODE', maxLength: 255, institution: 'collection' },
  collname: { column: 'COLLNAME', maxLength: 255 },
  collinstaddress: { column: 'COLLINSTADDRESS', maxLength: 16383 },
  bredcode: { column: 'BREDCODE', maxLength: 255, institution: 'breeding' },
  bredname: { column: 'BREDNAME', maxLength: 255 },
  donorcode: { column: 'DONORCODE', maxLength: 255, institution: 'donor' },
  donorname: { column: 'DONORNAME', maxLength: 255 },
  duplsite: { column: 'DUPLSITE', maxLength: 255, institution: 'duplicate' },
  duplinstname: { column: 'DUPLINSTNAME', maxLength: 255 },
  // Goes to "mcpd"."othernumb" (TEXT), and the importer also makes its values (separated by ";") the synonyms that
  // follow ACCENAME
  othernumb: { column: 'OTHERNUMB', maxLength: 16383 },
  // Only goes to "mcpd"."colldate", varchar(255). The import check refuses a value that isn't a MCPD date: YYYYMMDD,
  // with "-" for the unknown parts (e.g. "1987----")
  colldate: { column: 'COLLDATE', maxLength: 255 },
  // Taxonomy fields, see TAXONOMY_FIELDS: "mcpd" and "taxonomies" columns are all varchar(255).
  // ignoreCase: a change of upper/lower case only is no change. The database compares text without case
  // (utf8mb4_general_ci), so the importer would find the same taxonomy and only the "mcpd" copy would change.
  species: { column: 'SPECIES', maxLength: 255, taxonomy: true, ignoreCase: true },
  cropname: { column: 'CROPNAME', maxLength: 255, taxonomy: true, ignoreCase: true },
  spauthor: { column: 'SPAUTHOR', maxLength: 255, taxonomy: true, ignoreCase: true },
  subtaxa: { column: 'SUBTAXA', maxLength: 255, taxonomy: true, ignoreCase: true },
  subtauthor: { column: 'SUBTAUTHOR', maxLength: 255, taxonomy: true, ignoreCase: true },
  // Coded fields, see CODE_DOMAINS: the code is saved, not the name.
  // Only goes to "mcpd"."sampstat", an int linked to "biologicalstatus" (which holds all codes of its domain)
  sampstat: { column: 'SAMPSTAT', maxLength: 3, coded: true },
  // Only goes to "mcpd"."collsrc", an int linked to "collectingsources" (which holds all codes of its domain)
  collsrc: { column: 'COLLSRC', maxLength: 2, coded: true },
  // 3-letter code of a country of the "countries" table, see LOCATION_COLUMNS
  origcty: { column: 'ORIGCTY', maxLength: 3, country: true },
  // Additional attributes (see the ADDITIONAL_ATTRIBUTES sheet), keyed by their exact name. Values are "attributedata"
  // "value" (mediumtext); for an existing value the importer changes it, otherwise it adds it.
  // NICODE: 3-letter code of the country preparing the National Inventory
  NICODE: { attribute: 'NICODE', maxLength: 3, country: true },
  // Liaison institution of in-situ populations: its FAO WIEWS institute code and name
  LIAISONCODE: { attribute: 'LIAISONCODE', maxLength: 6 },
  LIAISONNAME: { attribute: 'LIAISONNAME', maxLength: 16383 },
  // SITEPROT: several codes of CODE_DOMAINS.SITEPROT separated by ";"
  SITEPROT: { attribute: 'SITEPROT', maxLength: 16383, multiCoded: true },
  // POPSRC: one code of CODE_DOMAINS.POPSRC
  POPSRC: { attribute: 'POPSRC', maxLength: 2, coded: true },
  // CONSACTION: several codes of CODE_DOMAINS.CONSACTION separated by ";"
  CONSACTION: { attribute: 'CONSACTION', maxLength: 16383, multiCoded: true },
  // Several codes of CODE_DOMAINS.storage separated by ";". Only goes to "mcpd"."storage", a TEXT column the importer
  // writes as it is (it checks nothing), so the codes are checked here.
  storage: { column: 'STORAGE', maxLength: 16383, multiCoded: true },
  // Only goes to "mcpd"."remarks" (TEXT). Edited on the Metadata tab.
  remarks: { column: 'REMARKS', maxLength: 16383 },
  // 0 (No) or 1 (Yes). Only goes to "mcpd"."mlsstat", an int linked to "mlsstatus" (0, 1 and 99 "Other"); 0 is written
  // like any other value, the importer only skips empty cells.
  mlsstat: { column: 'MLSSTAT', maxLength: 1, options: ['0', '1'] }
}

// The country of origin also decides the collecting site of the germplasm, a shared "locations" record: the importer
// looks for the location with the same COLLSITE (or "N/A" without one), country, coordinates, elevation, datum and
// coordinate uncertainty, creates it when there is none, and links the germplasm to it (other germplasm keep theirs,
// existing locations are never changed). So a new ORIGCTY is sent with the current location data, for the germplasm
// to move to the same location in the new country instead of an empty "N/A" one.
const LOCATION_COLUMNS = { collsite: 'COLLSITE', declatitude: 'DECLATITUDE', declongitude: 'DECLONGITUDE', elevation: 'ELEVATION', coorduncert: 'COORDUNCERT', coorddatum: 'COORDDATUM', georefmeth: 'GEOREFMETH' }

// Codes that can be saved in the coded fields, keyed like EDITABLE_MCPD_FIELDS
const CODE_DOMAINS = {}

// SAMPSTAT: biological status of the accession
CODE_DOMAINS.sampstat = [
  { code: 100, name: 'Wild' },
  { code: 110, name: 'Natural' },
  { code: 120, name: 'Semi-natural/wild' },
  { code: 130, name: 'Semi-natural/sown' },
  { code: 200, name: 'Weedy' },
  { code: 300, name: 'Traditional cultivar/landrace' },
  { code: 400, name: 'Breeding/research material' },
  { code: 410, name: 'Breeder\'s line' },
  { code: 411, name: 'Synthetic population' },
  { code: 412, name: 'Hybrid' },
  { code: 413, name: 'Founder stock/base population' },
  { code: 414, name: 'Inbred line' },
  { code: 415, name: 'Segregating population' },
  { code: 416, name: 'Clonal selection' },
  { code: 420, name: 'Genetic stock' },
  { code: 421, name: 'Mutant' },
  { code: 422, name: 'Cytogenetic stocks' },
  { code: 423, name: 'Other genetic stocks' },
  { code: 500, name: 'Advanced or improved cultivar' },
  { code: 600, name: 'GMO' },
  { code: 999, name: 'Other' }
]

// COLLSRC: collecting/acquisition source
CODE_DOMAINS.collsrc = [
  { code: 10, name: 'Wild habitat' },
  { code: 11, name: 'Forest or woodland' },
  { code: 12, name: 'Shrubland' },
  { code: 13, name: 'Grassland' },
  { code: 14, name: 'Desert or tundra' },
  { code: 15, name: 'Aquatic habitat' },
  { code: 20, name: 'Farm or cultivated habitat' },
  { code: 21, name: 'Field' },
  { code: 22, name: 'Orchard' },
  { code: 23, name: 'Backyard, kitchen or home garden' },
  { code: 24, name: 'Fallow land' },
  { code: 25, name: 'Pasture' },
  { code: 26, name: 'Farm store' },
  { code: 27, name: 'Threshing floor' },
  { code: 28, name: 'Park' },
  { code: 30, name: 'Market or shop' },
  { code: 40, name: 'Institute' },
  { code: 50, name: 'Seed company' },
  { code: 60, name: 'Weedy, disturbed or ruderal habitat' },
  { code: 61, name: 'Roadside' },
  { code: 62, name: 'Field margin' },
  { code: 99, name: 'Other' }
]

// STORAGE: type of germplasm storage, several separated by ";"
CODE_DOMAINS.storage = [
  { code: 10, name: 'Seed collection' },
  { code: 11, name: 'Short term' },
  { code: 12, name: 'Medium term' },
  { code: 13, name: 'Long term' },
  { code: 20, name: 'Field collection' },
  { code: 30, name: 'In vitro collection' },
  { code: 40, name: 'Cryopreserved collection' },
  { code: 50, name: 'DNA collection' },
  { code: 99, name: 'Other' }
]

// SITEPROT: legal or official protection of the collecting site, several separated by ";"
CODE_DOMAINS.SITEPROT = [
  { code: 0, name: 'Not protected' },
  { code: 1, name: 'Strict nature reserve' },
  { code: 2, name: 'Wilderness area' },
  { code: 3, name: 'National park' },
  { code: 4, name: 'Natural monument or feature' },
  { code: 5, name: 'Habitat/species management area' },
  { code: 6, name: 'Protected landscape/seascape' },
  { code: 7, name: 'Protected area w/ sustainable use' },
  { code: 8, name: 'Other effective conservation measures' }
]

// POPSRC: habitat of the occurrence site of the population
CODE_DOMAINS.POPSRC = [
  { code: 10, name: 'Wild' },
  { code: 11, name: 'Forest or woodland' },
  { code: 12, name: 'Shrubland' },
  { code: 13, name: 'Grassland' },
  { code: 14, name: 'Desert or tundra' },
  { code: 15, name: 'Aquatic habitat' },
  { code: 20, name: 'Farm or cultivated area' },
  { code: 21, name: 'Field' },
  { code: 22, name: 'Orchard' },
  { code: 23, name: 'Backyard, kitchen or home garden' },
  { code: 24, name: 'Fallow land' },
  { code: 25, name: 'Pasture' },
  { code: 28, name: 'Park' },
  { code: 60, name: 'Weedy, disturbed or ruderal habitat' },
  { code: 61, name: 'Roadside' },
  { code: 62, name: 'Field margin' },
  { code: 99, name: 'Other' }
]

// CONSACTION: conservation actions in place for the population (IUCN), several separated by ";"
CODE_DOMAINS.CONSACTION = [
  { code: 0, name: 'No conservation actions' },
  { code: 1, name: 'Monitoring and planning' },
  { code: 2, name: 'Land/Water protection and management' },
  { code: 3, name: 'Species management' },
  { code: 4, name: 'Education and legislation' },
  { code: 5, name: 'Managed as part of a CWR genetic reserve' },
  { code: 99, name: 'Other' }
]

// The values of a field with several codes: "13;11" -> ['13', '11']
const splitCodes = value => (value === null || value === undefined ? '' : `${value}`).split(';').map(v => v.trim()).filter(v => v !== '')

// "410 - Breeder's line"
const formatCode = item => `${item.code} - ${item.name}`

/**
 * The CODE_DOMAINS entry of a value of the given field: its code ("410"), the text shown for it ("410 - Breeder's
 * line") or its name ("breeder's line", case is ignored). Null when the value isn't one of them.
 */
const findCode = (field, value) => {
  const query = value === null || value === undefined ? '' : `${value}`.trim().toLowerCase()
  if (!query || !CODE_DOMAINS[field]) {
    return null
  }
  return CODE_DOMAINS[field].find(item => `${item.code}` === query || formatCode(item).toLowerCase() === query || item.name.toLowerCase() === query) || null
}

// The taxonomy of a germplasm is a shared "taxonomies" record. With GENUS in the row, the importer looks for the record
// with the same GENUS, SPECIES, SUBTAXA, SPAUTHOR and SUBTAUTHOR (not CROPNAME), creates it when there is none, and
// links the germplasm to it: other germplasm keep theirs, existing records are never changed. Without GENUS only the
// "mcpd" columns would change. So a taxonomy change always sends the complete taxonomy: current values plus changes.
const TAXONOMY_FIELDS = { genus: 'GENUS', species: 'SPECIES', spauthor: 'SPAUTHOR', subtaxa: 'SUBTAXA', subtauthor: 'SUBTAUTHOR', cropname: 'CROPNAME' }

// SUBTAXA is "<abbreviation> <name>" (e.g. "subsp. elatius"), with one of the abbreviations allowed by MCPD
const SUBTAXA_RANKS = [
  { value: 'subsp.', text: 'Subspecies' },
  { value: 'convar.', text: 'Convariety' },
  { value: 'var.', text: 'Variety' },
  { value: 'f.', text: 'Form' },
  { value: 'Group', text: 'Cultivar group' }
]

/**
 * Splits a SUBTAXA value into its abbreviation (written as in SUBTAXA_RANKS, case is ignored) and its name.
 * Returns null when it doesn't start with an allowed abbreviation followed by a name.
 */
const parseSubtaxa = value => {
  const subtaxa = text(value)
  for (const rank of SUBTAXA_RANKS) {
    if (subtaxa.toLowerCase().startsWith(`${rank.value.toLowerCase()} `)) {
      const name = subtaxa.substring(rank.value.length).trim()
      return name ? { rank: rank.value, name } : null
    }
  }
  return null
}

// Columns of the DATA sheet: the importer refuses a file without every one of them (empty cells are fine)
const TEMPLATE_COLUMNS = ['PUID', 'INSTCODE', 'ACCENUMB', 'COLLNUMB', 'COLLCODE', 'COLLNAME', 'COLLINSTADDRESS', 'COLLMISSID', 'GENUS',
  'SPECIES', 'SPAUTHOR', 'SUBTAXA', 'SUBTAUTHOR', 'CROPNAME', 'ACCENAME', 'ACQDATE', 'ORIGCTY', 'COLLSITE', 'DECLATITUDE', 'LATITUDE',
  'DECLONGITUDE', 'LONGITUDE', 'COORDUNCERT', 'COORDDATUM', 'GEOREFMETH', 'ELEVATION', 'COLLDATE', 'BREDCODE', 'BREDNAME', 'SAMPSTAT',
  'ANCEST', 'COLLSRC', 'DONORCODE', 'DONORNAME', 'DONORNUMB', 'OTHERNUMB', 'DUPLSITE', 'DUPLINSTNAME', 'STORAGE', 'MLSSTAT', 'REMARKS',
  'Entity type', 'Entity parent ACCENUMB']

// The server needs about 1-2 s for each step, asked often so no time is lost after it
const POLL_INTERVAL = 250
const POLL_TIMEOUT = 60 * 1000
// Times the new values are read back after the import
const VERIFY_ATTEMPTS = 3

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

const text = value => value === null || value === undefined ? '' : `${value}`.trim()

const sameList = (a, b) => a.length === b.length && a.every((value, index) => value === b[index])

/**
 * Puts the value of one field of EDITABLE_MCPD_FIELDS in the template row (or in the additional attributes), in the form
 * the importer takes (codes instead of names, ...). Throws an Error when the value can't be saved.
 */
const addFieldValue = (row, attributes, field, rawValue) => {
  const definition = EDITABLE_MCPD_FIELDS[field]
  const value = text(rawValue)

  if (!definition) {
    throw new Error(`"${field}" can't be updated.`)
  }
  if (definition.attribute) {
    if (!value) {
      throw new Error(`${definition.attribute} can't be emptied.`)
    }
    if (value.length > definition.maxLength) {
      throw new Error(`${definition.attribute} can't be longer than ${definition.maxLength} characters.`)
    }
    if (definition.country && !/^[A-Z]{3}$/.test(value.toUpperCase())) {
      throw new Error(`${definition.attribute} has to be the 3-letter ISO code of a country.`)
    }
    if (definition.coded) {
      const item = findCode(field, value)
      if (!item) {
        throw new Error(`${definition.attribute} has to be one of its MCPD codes.`)
      }
      attributes[definition.attribute] = `${item.code}`
      return
    }
    if (definition.multiCoded) {
      const items = splitCodes(value).map(part => findCode(field, part))
      if (items.length === 0 || items.some(item => !item)) {
        throw new Error(`${definition.attribute} can only hold its MCPD codes, separated by ";".`)
      }
      attributes[definition.attribute] = items.map(item => item.code).filter((code, index, all) => all.indexOf(code) === index).join(';')
      return
    }
    attributes[definition.attribute] = definition.country ? value.toUpperCase() : value
    return
  }
  // Empty cells are skipped by the importer, the value would silently stay as it is
  if (!value) {
    throw new Error(`${definition.column} can't be emptied.`)
  }
  if (value.length > definition.maxLength) {
    throw new Error(`${definition.column} can't be longer than ${definition.maxLength} characters.`)
  }
  if (field === 'subtaxa' && !parseSubtaxa(value)) {
    throw new Error(`SUBTAXA has to start with one of ${SUBTAXA_RANKS.map(r => r.value).join(', ')}, followed by the name.`)
  }
  if (definition.options) {
    if (!definition.options.includes(value)) {
      throw new Error(`${definition.column} has to be one of ${definition.options.join(', ')}.`)
    }
    row[definition.column] = Number(value)
    return
  }
  if (definition.multiCoded) {
    const items = splitCodes(value).map(part => findCode(field, part))
    if (items.length === 0 || items.some(item => !item)) {
      throw new Error(`${definition.column} can only hold its MCPD codes, separated by ";".`)
    }
    row[definition.column] = items.map(item => item.code).filter((code, index, all) => all.indexOf(code) === index).join(';')
    return
  }
  if (definition.coded) {
    const item = findCode(field, value)
    if (!item) {
      throw new Error(`${definition.column} has to be one of its MCPD codes.`)
    }
    row[definition.column] = item.code
    return
  }
  // A new ACCENAME replaces the current one sent above (and with it the display name and the first synonym)
  row[definition.column] = value
}

/**
 * The template row that changes the given fields and leaves everything else as it is.
 * Throws an Error when that isn't possible for this germplasm.
 *
 * @param {Object} germplasm Row of the germplasm table (germplasmGid, germplasmName, germplasmNumber, ...)
 * @param {Object} mcpd MCPD of the germplasm (accename, othernumb, ...)
 * @param {Object} changes New values, keyed by MCPD field (e.g. { puid: '10.18730/ABC' })
 */
const getMcpdUpdateRow = (germplasm, mcpd, changes) => {
  const accenumb = text(germplasm.germplasmGid)
  const accename = text(germplasm.germplasmNumber)
  const othernumb = text(mcpd.othernumb)
  const entityType = text(germplasm.entityTypeName)

  if (!accenumb) {
    throw new Error('The germplasm has no accession number (ACCENUMB), which the update needs to find it.')
  }
  // The importer renames the germplasm to its ACCENUMB
  if (text(germplasm.germplasmName) !== accenumb) {
    throw new Error(`The germplasm name "${germplasm.germplasmName}" is not its accession number "${accenumb}", the update would rename it.`)
  }
  // ... sets the display name to ACCENAME, or ACCENUMB without one
  if (text(germplasm.germplasmDisplayName) !== (accename || accenumb)) {
    throw new Error(`The display name "${germplasm.germplasmDisplayName}" is neither the accession name nor the accession number, the update would change it.`)
  }
  // ... sets the MCPD accession name to ACCENAME
  if (accename && text(mcpd.accename) !== accename) {
    throw new Error('The accession name of the MCPD is different from the one of the germplasm, the update would change it.')
  }
  // ... and replaces the synonyms with ACCENAME and the OTHERNUMB values (when there is any of them)
  const expected = (accename ? [accename] : []).concat(othernumb ? othernumb.split(';').map(v => v.trim()) : [])
  if (expected.length > 0) {
    const current = (germplasm.synonyms || []).map(v => text(v))
    if (!sameList(current, expected)) {
      throw new Error('The synonyms of the germplasm are not its accession name and other identifiers, the update would replace them.')
    }
  }
  if (!entityType) {
    throw new Error('The entity type of the germplasm is unknown, the update would set it to "Accession".')
  }

  const row = {
    ACCENUMB: accenumb,
    ACCENAME: accename,
    OTHERNUMB: othernumb,
    'Entity type': entityType
  }

  // Values of the ADDITIONAL_ATTRIBUTES sheet, keyed by attribute name
  const attributes = {}

  Object.keys(changes).forEach(field => addFieldValue(row, attributes, field, changes[field]))

  if (changes.origcty !== undefined) {
    const code = text(changes.origcty).toUpperCase()
    if (!/^[A-Z]{3}$/.test(code)) {
      throw new Error('ORIGCTY has to be the 3-letter ISO code of a country.')
    }
    row.ORIGCTY = code

    // The current location has to be the one the MCPD describes, or its data would be lost in the new one
    const number = value => value === null || value === undefined || `${value}`.trim() === '' ? null : Number(value)
    if (germplasm.locationId !== null && germplasm.locationId !== undefined) {
      const site = text(mcpd.collsite) || (text(mcpd.origcty) ? 'N/A' : '')
      const sameCountry = (getCountryFlagCode(text(mcpd.origcty)) || '') === text(germplasm.countryCode).toLowerCase()
      if (text(germplasm.location) !== site || !sameCountry || number(germplasm.latitude) !== number(mcpd.declatitude) ||
        number(germplasm.longitude) !== number(mcpd.declongitude) || number(germplasm.elevation) !== number(mcpd.elevation)) {
        throw new Error('The location of the germplasm is different from the collecting site of its MCPD, the country can\'t be updated without losing location data.')
      }
    } else if (text(mcpd.collsite) || number(mcpd.declatitude) !== null || number(mcpd.declongitude) !== null) {
      throw new Error('The MCPD has a collecting site but the germplasm has no location, the country can\'t be updated safely.')
    }
    Object.keys(LOCATION_COLUMNS).forEach(field => {
      const value = mcpd[field]
      row[LOCATION_COLUMNS[field]] = value === null || value === undefined ? '' : value
    })
  }

  if (Object.keys(changes).some(field => EDITABLE_MCPD_FIELDS[field].taxonomy)) {
    // The MCPD values have to be the ones of the current taxonomy record, or the germplasm would be linked to another one
    if (!text(mcpd.genus) || text(mcpd.genus) !== text(germplasm.genus) || text(mcpd.species) !== text(germplasm.species)) {
      throw new Error('The genus or species of the MCPD is missing or different from the taxonomy of the germplasm, the taxonomy can\'t be updated safely.')
    }
    Object.keys(TAXONOMY_FIELDS).forEach(field => {
      const column = TAXONOMY_FIELDS[field]
      if (row[column] === undefined) {
        row[column] = text(mcpd[field])
      }
    })
  }

  return { row, attributes }
}

// MCPD template with the DATA sheet (all columns, one row) and the ADDITIONAL_ATTRIBUTES sheet (ACCENUMB plus one
// column per changed attribute, only those), both required by the importer
const createWorkbookFile = ({ row, attributes }, filename) => {
  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([TEMPLATE_COLUMNS, TEMPLATE_COLUMNS.map(c => row[c] === undefined ? '' : row[c])]), 'DATA')
  const names = Object.keys(attributes)
  const attributeRows = names.length > 0 ? [['ACCENUMB'].concat(names), [row.ACCENUMB].concat(names.map(n => attributes[n]))] : [['ACCENUMB']]
  utils.book_append_sheet(workbook, utils.aoa_to_sheet(attributeRows), 'ADDITIONAL_ATTRIBUTES')

  const data = write(workbook, { type: 'array', bookType: 'xlsx' })
  return new File([data], filename, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

const toError = response => new Error((response && response.data && (response.data.reasonPhrase || response.data.message)) || (response && response.statusText) || 'The server did not accept the request.')

const call = (apiFunction, ...args) => new Promise((resolve, reject) => {
  apiFunction(...args, result => resolve(result), { codes: [], callback: response => reject(toError(response)) })
})

// First import problems reported by the server, as one message
const getFeedbackMessage = job => {
  const feedback = (job && job.feedback) || []
  const lines = feedback.slice(0, 3).map(f => [f.status, f.message].filter(v => v).join(': '))
  return lines.length > 0 ? lines.join('; ') : 'The import reported a problem.'
}

const isFinished = job => job.status !== 'waiting' && job.status !== 'running'
// After the import was started: the job may keep its uuid, so it also has to be marked as imported
const isImported = job => isFinished(job) && (job.status !== 'completed' || job.imported !== false)

// Resolves with the given jobs once all of them are done.
// The server answers with ALL import jobs of the user, not only the requested ones, so they are picked by uuid.
const waitForJobs = (uuids, isDone = isFinished) => new Promise((resolve, reject) => {
  const started = Date.now()

  const poll = () => {
    call(apiPostDataAsyncImport, uuids)
      .then(jobs => {
        const list = uuids.map(uuid => (jobs || []).find(job => job.uuid === uuid)).filter(job => job)
        if (list.length === uuids.length && list.every(isDone)) {
          resolve(list)
        } else if (Date.now() - started > POLL_TIMEOUT) {
          reject(new Error('The import is taking too long. It is listed in the data upload jobs.'))
        } else {
          setTimeout(poll, POLL_INTERVAL)
        }
      })
      .catch(reject)
  }

  poll()
})

const checkJob = job => {
  if (job.status !== 'completed') {
    throw new Error(job.status === 'failed' ? getFeedbackMessage(job) : `The import ended as "${job.status}".`)
  }
  if (job.errorStatus === 'ERROR') {
    throw new Error(getFeedbackMessage(job))
  }
  return job
}

// Uploads the template, waits for the server check, then imports it.
// Fills "trace" with the uuids of the jobs and the file resources they created, so they can be removed afterwards.
// Tells onPhase when it moves on: 'validating' (upload and server check), then 'updating' (import and read back).
// isUpdate: the rows change existing germplasm (otherwise they are new germplasm).
const runImport = (file, trace, onPhase, isUpdate = true) => {
  onPhase('validating')

  const formData = new FormData()
  formData.append('fileToUpload', file)

  return call(apiPostDataUpload, formData, 'mcpd', isUpdate, 'GENOTYPE_GERMPLASM_BY_MARKER', null, 1)
    .then(jobs => {
      const uuids = (jobs || []).map(job => job.uuid)
      if (uuids.length === 0) {
        throw new Error('The server did not start the import.')
      }
      trace.uuids.push(...uuids)
      return waitForJobs(uuids)
    })
    .then(jobs => {
      const job = checkJob(jobs[0])
      // Checked: now import it
      onPhase('updating')
      return call(apiGetDataAsyncImportStart, job.uuid).then(started => (started && started.length > 0) ? started.map(s => s.uuid) : [job.uuid])
    })
    .then(uuids => {
      uuids.forEach(uuid => !trace.uuids.includes(uuid) && trace.uuids.push(uuid))
      return waitForJobs(uuids, isImported)
    })
    .then(jobs => {
      jobs.forEach(job => job.stats && job.stats.fileResourceId && trace.fileResourceIds.push(job.stats.fileResourceId))
      jobs.forEach(checkJob)
    })
}

// The template is only a way to reach the importer, nothing of it is kept: every import stores the uploaded file as a
// "Dataset resource" (deleted here, file and record) and keeps a job (deleting it removes its files and hides it from
// the job lists; Germinate has no way to remove the job record itself). Runs in the background, failures are ignored.
const discardImport = trace => {
  const ignore = () => {}
  trace.fileResourceIds.forEach(id => apiDeleteFileresource(id, ignore, { codes: [], callback: ignore }))
  trace.uuids.forEach(uuid => apiDeleteDataAsyncImport(uuid, ignore, { codes: [], callback: ignore }))
}

// True once the database holds all the new values (read a few times, the import may still be finishing)
const getAttributes = germplasmId => call(apiPostGermplasmAttributeTable, {
  page: 1,
  limit: MAX_JAVA_INTEGER,
  filter: [{ column: 'germplasmId', comparator: 'equals', operator: 'and', values: [germplasmId] }]
}).then(result => (result && result.data) || [])

const isApplied = (germplasmId, changes, attempt = 1) => {
  const fields = Object.keys(changes)
  const mcpdFields = fields.filter(field => !EDITABLE_MCPD_FIELDS[field].attribute)
  const attributeFields = fields.filter(field => EDITABLE_MCPD_FIELDS[field].attribute)
  // The saved form of a value: country codes in capitals
  const saved = field => EDITABLE_MCPD_FIELDS[field].country ? text(changes[field]).toUpperCase() : text(changes[field])

  return Promise.all([
    mcpdFields.length > 0 ? call(apiGetGermplasmMcpd, germplasmId) : Promise.resolve({}),
    attributeFields.length > 0 ? getAttributes(germplasmId) : Promise.resolve([])
  ]).then(([mcpd, attributes]) => {
    const applied = !!mcpd &&
      mcpdFields.every(field => text(mcpd[field]) === saved(field)) &&
      attributeFields.every(field => attributes.some(a => a.attributeName === EDITABLE_MCPD_FIELDS[field].attribute && text(a.attributeValue) === saved(field)))
    if (applied || attempt >= VERIFY_ATTEMPTS) {
      return applied
    }
    return wait(POLL_INTERVAL).then(() => isApplied(germplasmId, changes, attempt + 1))
  })
}

/**
 * Changes the given MCPD fields of the germplasm and nothing else.
 * Resolves when the new values are in the database, rejects with an Error telling why it couldn't be done.
 *
 * Steps, as on the data upload page: upload the template (the server checks it), start the actual import, then read
 * the values back to confirm them. onPhase(phase) is called with 'validating', then 'updating'.
 */
const updateGermplasmMcpd = (germplasm, mcpd, changes, dataImportMode, onPhase = () => {}) => {
  if (dataImportMode !== 'IMPORT') {
    return Promise.reject(new Error('Data import is not enabled on this server (data import mode is not "IMPORT").'))
  }

  let file
  try {
    file = createWorkbookFile(getMcpdUpdateRow(germplasm, mcpd, changes), `germplasm-${germplasm.germplasmId}-update.xlsx`)
  } catch (error) {
    return Promise.reject(error)
  }

  const trace = { uuids: [], fileResourceIds: [] }

  return runImport(file, trace, onPhase)
    .then(() => isApplied(germplasm.germplasmId, changes))
    .finally(() => discardImport(trace))
    .then(applied => {
      if (!applied) {
        throw new Error('The server reported the import as done, but the new value is not in the database.')
      }
    })
}

// True once every attribute has its new value (read a few times, the import may still be finishing)
const areAttributesApplied = (germplasmId, attributes, attempt = 1) => {
  const names = Object.keys(attributes)
  if (names.length === 0) {
    return Promise.resolve(true)
  }
  return getAttributes(germplasmId).then(current => {
    const applied = names.every(name => current.some(a => a.attributeName === name && text(a.attributeValue) === text(attributes[name])))
    if (applied || attempt >= VERIFY_ATTEMPTS) {
      return applied
    }
    return wait(POLL_INTERVAL).then(() => areAttributesApplied(germplasmId, attributes, attempt + 1))
  })
}

/**
 * Changes additional attributes of the germplasm, keyed by their exact name (the importer changes the value of the
 * attribute with that name, or adds it), and MCPD fields of EDITABLE_MCPD_FIELDS. Nothing else changes.
 * Resolves when the new values are in the database, rejects with an Error telling why it couldn't be done.
 */
const updateGermplasmMetadata = (germplasm, mcpd, { fields = {}, attributes = {} }, dataImportMode, onPhase = () => {}) => {
  if (dataImportMode !== 'IMPORT') {
    return Promise.reject(new Error('Data import is not enabled on this server (data import mode is not "IMPORT").'))
  }

  let file
  try {
    const data = getMcpdUpdateRow(germplasm, mcpd, fields)
    Object.keys(attributes).forEach(name => {
      const value = text(attributes[name])
      // Empty cells are skipped by the importer, the value would silently stay as it is
      if (!value) {
        throw new Error(`${name} can't be emptied.`)
      }
      data.attributes[name] = value
    })
    file = createWorkbookFile(data, `germplasm-${germplasm.germplasmId}-metadata.xlsx`)
  } catch (error) {
    return Promise.reject(error)
  }

  const trace = { uuids: [], fileResourceIds: [] }

  return runImport(file, trace, onPhase)
    .then(() => Object.keys(fields).length > 0 ? isApplied(germplasm.germplasmId, fields) : true)
    .then(applied => applied && areAttributesApplied(germplasm.germplasmId, attributes))
    .finally(() => discardImport(trace))
    .then(applied => {
      if (!applied) {
        throw new Error('The server reported the import as done, but the new value is not in the database.')
      }
    })
}

/**
 * The template row of a new germplasm: ACCENUMB, GENUS and the maintenance institution (INSTCODE), plus the filled in
 * fields of EDITABLE_MCPD_FIELDS (institutions and additional attributes among them) and extra additional attributes.
 * The entity type is "Accession". Throws an Error when a value can't be saved.
 */
const getMcpdInsertRow = ({ accenumb, genus, instcode, fields = {}, attributes: extraAttributes = {} }) => {
  const row = {
    ACCENUMB: text(accenumb),
    GENUS: text(genus),
    INSTCODE: text(instcode).toUpperCase(),
    'Entity type': 'Accession'
  }
  if (!row.ACCENUMB) {
    throw new Error('ACCENUMB is mandatory.')
  }
  if (!row.GENUS) {
    throw new Error('GENUS is mandatory.')
  }
  if (row.ACCENUMB.length > 255 || row.GENUS.length > 255) {
    throw new Error('ACCENUMB and GENUS can\'t be longer than 255 characters.')
  }

  const attributes = { ...extraAttributes }
  Object.keys(fields).filter(field => text(fields[field]) !== '').forEach(field => addFieldValue(row, attributes, field, fields[field]))

  if (row.ORIGCTY) {
    row.ORIGCTY = text(row.ORIGCTY).toUpperCase()
    if (!/^[A-Z]{3}$/.test(row.ORIGCTY)) {
      throw new Error('ORIGCTY has to be the 3-letter ISO code of a country.')
    }
  }

  return { row, attributes }
}

/**
 * Creates a germplasm through the MCPD data import (insert mode), with the values of getMcpdInsertRow.
 * Resolves once the import is done (the germplasm is then found by its ACCENUMB), rejects with an Error telling why it
 * couldn't be done. onPhase(phase) is called with 'validating', then 'updating'. Nothing of the import is kept.
 */
const createGermplasmMcpd = (values, dataImportMode, onPhase = () => {}) => {
  if (dataImportMode !== 'IMPORT') {
    return Promise.reject(new Error('Data import is not enabled on this server (data import mode is not "IMPORT").'))
  }

  let file
  try {
    file = createWorkbookFile(getMcpdInsertRow(values), `germplasm-new-${Date.now()}.xlsx`)
  } catch (error) {
    return Promise.reject(error)
  }

  const trace = { uuids: [], fileResourceIds: [] }

  return runImport(file, trace, onPhase, false)
    .finally(() => discardImport(trace))
}

export {
  EDITABLE_MCPD_FIELDS,
  SUBTAXA_RANKS,
  parseSubtaxa,
  CODE_DOMAINS,
  formatCode,
  findCode,
  splitCodes,
  updateGermplasmMcpd,
  updateGermplasmMetadata,
  createGermplasmMcpd
}
