import { authAxios } from '@/mixins/api/base'

const apiPostDatasetClimates = (datasetIds, onSuccess, onError) => {
  const queryData = {
    datasetIds: datasetIds
  }
  return authAxios({ url: 'dataset/climate', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostClimateTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'climate/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostClimates = (queryData, onSuccess, onError) => {
  return authAxios({ url: 'climate/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostClimateOverlays = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: '/climate/overlay', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostClimateDataTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'dataset/data/climate/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostClimateDataTableIds = (queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'dataset/data/climate/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostClimateDatasetTable = (climateId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: `climate/${climateId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export {
  apiPostDatasetClimates,
  apiPostClimateTable,
  apiPostClimates,
  apiPostClimateOverlays,
  apiPostClimateDataTable,
  apiPostClimateDataTableIds,
  apiPostClimateDatasetTable
}
