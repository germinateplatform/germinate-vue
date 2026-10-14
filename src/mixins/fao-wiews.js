// Institution details from FAO WIEWS (https://www.fao.org/wiews/data/organizations/).
// The WIEWS organisation page fills its fields, e.g. <div data-gpaindex="name">, from this JSON service in the browser,
// so the page HTML itself does not contain them. The service allows cross-origin requests, the page does not.
const WIEWS_SEARCH_URL = 'https://wiews.fao.org/wiewsOrganizationsSearch'
const WIEWS_ORGANISATION_URL = 'https://www.fao.org/wiews/data/organizations/en/?instcode='

// One request per institution code, shared by everything that asks for it
const nameCache = {}

const getWiewsOrganisationUrl = code => `${WIEWS_ORGANISATION_URL}${encodeURIComponent(code)}`

/**
 * Resolves with the WIEWS name of the institution with the given code (FAO WIEWS instcode), or null when it is
 * unknown or the service can't be reached.
 */
const getWiewsInstitutionName = code => {
  const key = code ? `${code}`.trim().toUpperCase() : ''

  if (!key) {
    return Promise.resolve(null)
  }

  if (!nameCache[key]) {
    nameCache[key] = fetch(WIEWS_SEARCH_URL, {
      method: 'POST',
      // Same request as the WIEWS page sends. Plain text keeps it a simple cross-origin request.
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: JSON.stringify({ lang: 'en', size: 1, from: 0, filters: { instcode: key } })
    })
      .then(response => response.ok ? response.json() : null)
      .then(result => {
        const match = result && result.data ? result.data.find(o => o.instcode && o.instcode.toUpperCase() === key) : null
        const name = match && match.name ? `${match.name}`.trim() : ''
        return name || null
      })
      .catch(() => {
        // Network or service problem: allow a new attempt next time
        delete nameCache[key]
        return null
      })
  }

  return nameCache[key]
}

export {
  getWiewsOrganisationUrl,
  getWiewsInstitutionName
}
