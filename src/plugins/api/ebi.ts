import axios, { type AxiosResponse } from 'axios'
import type { Count, EbiGenomyAssembly, EbiRecord, EbiStudy } from '@/plugins/types/ebi'

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
  return axiosCall<EbiRecord[]>({ baseUrl: BASE_URL, url: 'links/taxon', data: { accession: taxonId, format: 'json' } })
    .then(async result => {
      if (result && result.data) {
        // Get the actual numbers from separate `count` queries, since the overview cannot be trusted...
        const assemblyCount = +(await ebiGetGenomeAssemblyCount(taxonId))?.data.count || 0
        const studyCount = +(await ebiGetGenomeStudyCount(taxonId))?.data.count || 0

        const assemblies = result.data.find(d => d.result_id === 'assembly')

        if (assemblies) {
          assemblies.entry_cnt = assemblyCount
          assemblies.subtree_entry_cnt = assemblyCount
        }

        result.data.push({
          result_id: 'study',
          description: 'Studies',
          entry_cnt: studyCount,
          subtree_entry_cnt: studyCount,
        })
      }

      return result
    })
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

export function ebiGetGenomeStudyCount (taxonId: string): Promise<AxiosResponse<Count>> {
  return axiosCall({ baseUrl: BASE_URL, url: 'count', data: {
    result: 'study',
    query: `tax_tree(${taxonId})`,
    format: 'json',
  } })
}

export function ebiGetGenomeAssemblyCount (taxonId: string): Promise<AxiosResponse<Count>> {
  return axiosCall({ baseUrl: BASE_URL, url: 'count', data: {
    result: 'assembly',
    query: `tax_tree(${taxonId})`,
    format: 'json',
  } })
}
