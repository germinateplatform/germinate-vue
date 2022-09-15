import { authAxios } from '@/mixins/api/base'

const apiPostLocationTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'location/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostLocationDistanceTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'location/distance/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostLocationDistanceTableIds = (queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'location/distance/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostLocationPolygonTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  if (queryData.orderBy === 'distance') {
    delete queryData.orderBy
    delete queryData.ascending
  }
  return authAxios({ url: 'location/polygon/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostLocationPolygonTableIds = (queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'location/polygon/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostLocationTableIds = (queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'location/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGroupLocationTableExport = (groupId, queryData, onSuccess, onError) => authAxios({ url: `group/${groupId}/location/export`, method: 'POST', dataType: 'blob', data: queryData, success: onSuccess, error: onError })

const apiPostGroupLocationTable = (groupId, queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: `group/${groupId}/location`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostGroupLocationTableIds = (groupId, queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: `group/${groupId}/location/ids`, method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiGetCountries = (onSuccess, onError) => authAxios({ url: 'country', success: onSuccess, error: onError })

export {
  apiPostLocationTable,
  apiPostLocationTableIds,
  apiPostLocationDistanceTable,
  apiPostLocationDistanceTableIds,
  apiPostLocationPolygonTable,
  apiPostLocationPolygonTableIds,
  apiPostGroupLocationTableExport,
  apiPostGroupLocationTable,
  apiPostGroupLocationTableIds,
  apiGetCountries
}
