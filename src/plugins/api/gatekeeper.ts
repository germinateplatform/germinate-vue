import { authAxios, type ErrorHandler } from '@/plugins/api/base'
import type { GatekeeperInstitution, NewUnapprovedUserRequest, NewUserAccessRequest, PaginatedRequest, PaginatedResult } from '@/plugins/types/germinate'
import type { GerminateResponseHandler } from '@/plugins/types/GerminateResponseHandler'

export function apiPostGatekeeperExisting (queryData: NewUserAccessRequest, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: 'gatekeeper/user/existing', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiPostGatekeeperNew (queryData: NewUnapprovedUserRequest, onSuccess?: GerminateResponseHandler<boolean>, onError?: ErrorHandler) {
  return authAxios({ url: 'gatekeeper/user/new', method: 'POST', data: queryData, success: onSuccess, error: onError })
}

export function apiGetGatekeeperInstitutions (queryData: PaginatedRequest, onSuccess?: GerminateResponseHandler<PaginatedResult<GatekeeperInstitution[]>>, onError?: ErrorHandler) {
  queryData.page -= 1
  return authAxios({ url: 'gatekeeper/institution', method: 'GET', data: queryData, success: onSuccess, error: onError })
}
