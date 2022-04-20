import store from './store'

export default {
  loggedIn () {
    const token = store.getters.storeToken
    return token !== null && this.tokenStillValid()
  },
  tokenStillValid () {
    const token = store.getters.storeToken
    if (token) {
      return new Date().getTime() - token.createdOn <= token.lifetime
    } else {
      return false
    }
  }
}
