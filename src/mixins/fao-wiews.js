// FAO WIEWS organisation lookup, the same logic and result format as the shared jQuery function
// fao-wiews-organizations.js, written with fetch for this project (which has no jQuery).
//
// Data comes from the JSON the WIEWS organisation page itself requests (https://wiews.fao.org/wiewsOrganizationsSearch),
// not from the page HTML: the organisation table (<div class="tableGPA">) is built in the browser from that JSON, and
// the page cannot be read from other websites (no CORS). The JSON service allows cross-origin requests.
//
// Every field the JSON returns is included:
// - fields shown in the WIEWS table are named after the table label, in lower case with "_" for spaces and without
//   text in brackets ("Name of organization" -> name_of_organization, "Latitude (decimal degrees format)" -> latitude);
// - other fields keep their JSON name (parent_instcode, valid, valid_instcode, ...);
// - the role flags (role_f646, ...) become one list, organization_role_categories, named from the WIEWS label file.
// Fields an organisation does not have are absent from its result, empty text values are null.

const SEARCH_URL = 'https://wiews.fao.org/wiewsOrganizationsSearch'
const LABELS_URL = 'https://storage.googleapis.com/fao-wiews-lang-bucket/frontendlabels_EN.json'
const PAGE_URL = 'https://www.fao.org/wiews/data/organizations/en/?instcode='
const REQUEST_TIMEOUT = 20000

// Three letters (ISO 3166-1 alpha-3 country code) followed by three digits, e.g. DEU146
const INSTCODE_PATTERN = /^[A-Z]{3}[0-9]{3}$/

// JSON fields shown in the WIEWS organisation table, with the label of their table cell
const TABLE_LABELS = {
  name: 'Name of organization',
  acronym: 'Organization acronym',
  instcode: 'WIEWS instcode',
  parent_name: 'Parent organization',
  address: 'Address',
  zip_code: 'ZIP code',
  city: 'City',
  country: 'Country',
  telephone: 'Telephone',
  fax: 'Fax',
  email: 'Email address',
  website: 'WWW address',
  status: 'Organization authority status',
  longitude: 'Longitude (decimal degrees format)',
  latitude: 'Latitude (decimal degrees format)'
}
const ROLES_LABEL = 'Organization role categories'
const ROLE_FIELD = /^role_f\d+$/

// Role names as of 2026, used when the WIEWS label file can't be loaded
const BUILT_IN_ROLE_NAMES = {
  role_f646: 'Genebank (long term collections)',
  role_f874: 'Genebank (medium term collections)',
  role_f875: 'Genebank (short term collections)',
  role_f647: 'Botanical garden',
  role_f648: 'Breeder',
  role_f649: 'Network',
  role_f650: 'Community',
  role_f651: 'Educational',
  role_f652: 'Seed producer',
  role_f653: 'Seed supplier',
  role_f654: 'Farmer community',
  role_f655: 'Research',
  role_f656: 'Extensionist',
  role_f657: 'Laboratory',
  role_f658: 'Publisher',
  role_f869: 'Administration/Policy'
}

// "Latitude (decimal degrees format)" -> "latitude", "Name of organization" -> "name_of_organization"
const toKey = label => `${label}`
  .replace(/\s*\([^)]*\)\s*/g, ' ')
  .trim()
  .toLowerCase()
  .replace(/[\s-]+/g, '_')

const failure = (instcode, message) => ({ success: false, instcode: instcode, error_message: message })

// fetch with a time limit, rejecting with an error whose name is "TimeoutError" when it runs out
const fetchWithTimeout = (url, options) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  return fetch(url, { ...options, signal: controller.signal })
    .catch(error => {
      if (error && error.name === 'AbortError') {
        const timeout = new Error('the request timed out')
        timeout.name = 'TimeoutError'
        throw timeout
      }
      throw error
    })
    .finally(() => clearTimeout(timer))
}

// Role names from the WIEWS label file, loaded once. Falls back to the built-in names.
let roleNamesPromise = null
const getRoleNames = () => {
  if (!roleNamesPromise) {
    roleNamesPromise = fetchWithTimeout(LABELS_URL, { method: 'GET' })
      .then(response => response.ok ? response.json() : [])
      .then(labels => {
        const names = { ...BUILT_IN_ROLE_NAMES }
        ;(Array.isArray(labels) ? labels : []).forEach(label => {
          const match = label && /^organizations_details_(role_f\d+)$/.exec(label.frontend_label_id)
          if (match && label.frontend_label_en) {
            names[match[1]] = label.frontend_label_en
          }
        })
        return names
      })
      .catch(() => {
        // Try the label file again next time
        roleNamesPromise = null
        return BUILT_IN_ROLE_NAMES
      })
  }

  return roleNamesPromise
}

// Every field of the organisation JSON, named as described at the top
const toResult = (instcode, organisation, roleNames) => {
  const result = { success: true, instcode: instcode }
  const roles = []

  Object.keys(organisation).forEach(field => {
    const value = organisation[field]

    if (ROLE_FIELD.test(field)) {
      if (value === true) {
        roles.push(roleNames[field] || field)
      }
      return
    }

    const key = TABLE_LABELS[field] ? toKey(TABLE_LABELS[field]) : toKey(field)
    result[key] = (typeof value === 'string' && value.trim() === '') ? null : value
  })

  result[toKey(ROLES_LABEL)] = roles
  return result
}

// Found organisations, one request per code for the whole session
const resultCache = {}

// Looks up a single, already validated code. Always resolves.
const lookUp = instcode => {
  if (resultCache[instcode]) {
    return resultCache[instcode]
  }

  const request = fetchWithTimeout(SEARCH_URL, {
    method: 'POST',
    // Same request as the WIEWS page sends; plain text keeps it a simple cross-origin request
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    body: JSON.stringify({ lang: 'en', size: 1, from: 0, filters: { instcode: instcode } })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}${response.statusText ? ' ' + response.statusText : ''}`)
      }
      return response.json().catch(() => {
        throw new Error('the service did not answer with valid JSON')
      })
    })
    .then(response => {
      const match = response && Array.isArray(response.data)
        ? response.data.find(o => o && `${o.instcode}`.toUpperCase() === instcode)
        : null

      if (!match) {
        // On the WIEWS website an unknown code sends you back to the search page
        return failure(instcode, `No organization found for institute code "${instcode}" (${PAGE_URL}${instcode} opens the search page instead).`)
      }

      return getRoleNames().then(roleNames => toResult(instcode, match, roleNames))
    })
    .catch(error => {
      // A failed request is not cached, the next call tries again
      delete resultCache[instcode]
      const reason = error && error.message && error.name !== 'TypeError'
        ? error.message
        // fetch rejects with a TypeError when there is no answer at all (offline, DNS, firewall, blocked request)
        : 'no response from wiews.fao.org (network error or the request was blocked)'
      return failure(instcode, `Request to FAO WIEWS failed for institute code "${instcode}": ${reason}.`)
    })

  resultCache[instcode] = request
  return request
}

/**
 * Looks up one or more FAO WIEWS institute codes.
 *
 * @param {string|string[]} instcodes One code, several codes separated by commas ("MKD001,DEU146"), or an array.
 * @returns {Promise<Object[]>} One result per code (repeated codes once), in the order given. Never rejects:
 *   found codes give { success: true, instcode, name_of_organization, ... }, the others
 *   { success: false, instcode, error_message }.
 */
const getWiewsOrganizations = instcodes => {
  const list = Array.isArray(instcodes) ? instcodes : `${instcodes === undefined || instcodes === null ? '' : instcodes}`.split(',')
  const codes = list
    .map(code => `${code}`.trim().toUpperCase())
    .filter((code, index, all) => code !== '' && all.indexOf(code) === index)

  if (codes.length === 0) {
    return Promise.resolve([failure(null, 'No institute code given. Example: getWiewsOrganizations("DEU146") or getWiewsOrganizations("MKD001,DEU146").')])
  }

  return Promise.all(codes.map(code => {
    if (!INSTCODE_PATTERN.test(code)) {
      return Promise.resolve(failure(code, `Invalid institute code "${code}". A WIEWS institute code is the three-letter ISO 3166-1 alpha-3 country code followed by three digits, for example DEU146 (Germany) or MKD001 (North Macedonia).`))
    }
    return lookUp(code)
  }))
}

/**
 * Searches FAO WIEWS organizations by the start of an institute code ("DEU1") or by a part of the name ("Leibniz").
 * Resolves with { total, data: [{ instcode, name, country }] } for the page asked (from, size); rejects when the
 * service can't be reached.
 */
const searchWiewsOrganizations = ({ instcode, name, from = 0, size = 5 }) => {
  const filters = {}
  if (instcode) {
    filters.instcode = `${instcode}`.trim().toUpperCase()
  }
  if (name) {
    filters.name = `${name}`.trim()
  }
  return fetchWithTimeout(SEARCH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    body: JSON.stringify({ lang: 'en', size, from, filters })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return response.json()
    })
    .then(response => {
      let data = (response && Array.isArray(response.data) ? response.data : [])
        .filter(o => o && o.instcode)
        .map(o => ({ instcode: `${o.instcode}`.toUpperCase(), name: o.name || '', country: o.country || '' }))
      // The service may answer with every match instead of the page asked
      if (data.length > size) {
        data = data.slice(from, from + size)
      }
      return { total: (response && response.totalRows) || data.length, data }
    })
}

const getWiewsOrganisationUrl = code => `${PAGE_URL}${encodeURIComponent(code)}`

/**
 * Resolves with the WIEWS "Name of organization" of the institution with the given code, or null when the code is
 * invalid, unknown, or the service can't be reached.
 */
const getWiewsInstitutionName = code => getWiewsOrganizations(code)
  .then(results => {
    const result = results[0]
    return result && result.success && result.name_of_organization ? `${result.name_of_organization}`.trim() || null : null
  })

export {
  getWiewsOrganizations,
  searchWiewsOrganizations,
  getWiewsOrganisationUrl,
  getWiewsInstitutionName
}
