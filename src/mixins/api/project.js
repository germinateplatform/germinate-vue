import { authAxios } from '@/mixins/api/base'

const apiPostProjectTable = (queryData, onSuccess, onError) => {
  queryData.page -= 1
  return authAxios({ url: 'project/table', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

const apiPostProjectTableIds = (queryData, onSuccess, onError) => {
  delete queryData.orderBy
  delete queryData.ascending
  return authAxios({ url: 'project/table/ids', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export {
  apiPostProjectTable,
  apiPostProjectTableIds
}
