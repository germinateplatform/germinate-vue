import { authAxios } from '@/mixins/api/base'

const apiPostCompoundTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'compound/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostDatasetCompounds = (datasetIds, onSuccess, onError) => {
  const queryData = {
    datasetIds: datasetIds
  }
  return authAxios({ url: 'dataset/compound', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostCompoundDataTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'dataset/data/compound/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostCompoundDataTableIds = (queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'dataset/data/compound/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostCompoundDatasetTable = (compoundId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: `compound/${compoundId}/dataset`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export {
  apiPostCompoundTable,
  apiPostDatasetCompounds,
  apiPostCompoundDataTable,
  apiPostCompoundDataTableIds,
  apiPostCompoundDatasetTable
}
