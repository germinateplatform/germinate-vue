import { authAxios } from '@/mixins/api/base'

const apiPostTrialsDataTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'dataset/data/trial/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostTrialsDataTableIds = (queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'dataset/data/trial/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostTrialsDataTimepoints = (queryData, onSuccess, onError) => authAxios({ url: 'dataset/data/trial/timepoint', method: 'POST', data: queryData, success: onSuccess, error: onError })

const apiPostTraitTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'trait/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostTraitTableIds = (queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'trait/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostDatasetTraits = (datasetIds, onSuccess, onError) => {
  const queryData = {
    datasetIds: datasetIds
  }
  return authAxios({ url: 'dataset/trait', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostTraitDatasetTable = (traitId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: `trait/${traitId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostTraitAttributeTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'trait/attribute', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPatchTrait = (id, data, onSuccess, onError) => authAxios({ url: `trait/${id}`, method: 'PATCH', data: data, success: onSuccess, error: onError })

const apiPostTraitUnification = (queryData, onSuccess, onError) => authAxios({ url: 'trait/unify', data: queryData, method: 'POST', success: onSuccess, error: onError })

const apiGetTraitDistinctValues = (traitId, onSuccess, onError) => authAxios({ url: `trait/${traitId}/values`, success: onSuccess, error: onError })

const apiPostTrialLocationCount = (queryData, onSuccess, onError) => authAxios({ url: 'dataset/data/trial/location/count', method: 'POST', data: queryData, success: onSuccess, error: onError })

export {
  apiPostTrialsDataTable,
  apiPostTrialsDataTableIds,
  apiPostTraitTable,
  apiPostTraitTableIds,
  apiPostDatasetTraits,
  apiPostTraitDatasetTable,
  apiPatchTrait,
  apiPostTraitUnification,
  apiGetTraitDistinctValues,
  apiPostTrialLocationCount,
  apiPostTraitAttributeTable,
  apiPostTrialsDataTimepoints
}
