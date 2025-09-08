import axios, { type AxiosResponse } from 'axios'

const BASE_URL = 'https://www.ebi.ac.uk/ena/portal/api/'

function axiosCall<T> ({ baseUrl, url, method = 'GET', data = null }: { baseUrl: string, url: string, data?: any, method?: string }): Promise<AxiosResponse<T>> {
  let requestData = null
  let requestParams = null

  // Stringify the data object for non-GET requests
  if (data !== null || data !== undefined) {
    if (method === 'GET') {
      requestParams = data
    } else {
      requestData = data
    }
  }

  return axios({
    baseURL: baseUrl,
    url,
    method,
    data: requestData,
    params: requestParams,
    // crossDomain: true,
    responseType: 'json',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

function ebiGetRecords<T> (taxonId: string): Promise<AxiosResponse<T>> {
  return axiosCall<T>({ baseUrl: BASE_URL, url: 'links/taxon', data: { accession: taxonId, format: 'json' } })
}

function ebiGetStudies<T> (taxonId: string): Promise<AxiosResponse<T>> {
  return axiosCall<T>({ baseUrl: BASE_URL, url: 'search', data: {
    result: 'study',
    query: `tax_tree(${taxonId})`,
    fields: 'study_accession,study_title,study_description,center_name',
    format: 'json',
  } })
}

function ebiGetGenomeAssemblies<T> (taxonId: string): Promise<AxiosResponse<T>> {
  return axiosCall<T>({ baseUrl: BASE_URL, url: 'search', data: {
    result: 'assembly',
    query: `tax_tree(${taxonId})`,
    fields: 'accession,scientific_name,cultivar,assembly_name,assembly_level,assembly_quality,assembly_software',
    format: 'json',
  } })
}

export {
  axiosCall,
  ebiGetRecords,
  ebiGetStudies,
  ebiGetGenomeAssemblies,
}
