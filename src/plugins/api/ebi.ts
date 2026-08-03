import axios, { type AxiosResponse } from 'axios'
import type { EbiGenomyAssembly, EbiRecord, EbiStudy } from '@/plugins/types/ebi'

const BASE_URL = 'https://www.ebi.ac.uk/ena/portal/api/'

export function axiosCall<T> ({ baseUrl, url, method = 'GET', data = null }: { baseUrl: string, url: string, data?: any, method?: string }): Promise<AxiosResponse<T>> {
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

  return axios<T>({
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

export function ebiGetRecords (taxonId: string): Promise<AxiosResponse<EbiRecord[]>> {
  return axiosCall({ baseUrl: BASE_URL, url: 'links/taxon', data: { accession: taxonId, format: 'json' } })
}

export function ebiGetStudies (taxonId: string): Promise<AxiosResponse<EbiStudy[]>> {
  return axiosCall({ baseUrl: BASE_URL, url: 'search', data: {
    result: 'study',
    query: `tax_tree(${taxonId})`,
    fields: 'study_accession,study_title,study_description,center_name',
    format: 'json',
  } })
}

export function ebiGetGenomeAssemblies (taxonId: string): Promise<AxiosResponse<EbiGenomyAssembly[]>> {
  return axiosCall({ baseUrl: BASE_URL, url: 'search', data: {
    result: 'assembly',
    query: `tax_tree(${taxonId})`,
    fields: 'accession,scientific_name,cultivar,assembly_name,assembly_level,assembly_quality,assembly_software',
    format: 'json',
  } })
}
