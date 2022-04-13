import store from './store/store'

export default {
  loggedIn () {
    const token = store.getters.token
    return token !== null && this.tokenStillValid()
  },
  tokenStillValid () {
    const token = store.getters.token
    if (token) {
      return new Date().getTime() - token.createdOn <= token.lifetime
    } else {
      return false
    }
  }
}
