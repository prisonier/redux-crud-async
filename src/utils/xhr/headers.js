var path = require('object-path')
var windowAccess    = typeof window !== 'undefined' ? window : {}  // Make it available in tests


module.exports = function headersUtil(hostConfig, singleModelName){
  const defaultLocalStorageName = 'JWT'
  var headers = {}
  var hasLocalStorage  = path.get(windowAccess, 'localStorage.getItem')
  var authConfig       = path.get(hostConfig, `apiSpecs.${singleModelName}.auth`)

  // Return empty headers if there is no localStorage to store the JWT or no config for the action
  if(!hasLocalStorage || !authConfig) return headers // empty headers

  var localStorageName = path.get(hostConfig, 'localStorageName') || defaultLocalStorageName
  var headerContent    = path.get(hostConfig, 'headerContent') || `Bearer {{${localStorageName}}}`
  var headerFormat     = path.get(hostConfig, 'headerFormat') || 'Authorization'
  let JWT = windowAccess.localStorage.getItem(localStorageName)
  
  authConfig.forEach(action => {
    let authBearer = headerContent.replace(`{{${localStorageName}}}`, JWT)

    // Return a function to get the token each time the action is dispatched
    headers[action] = {[headerFormat]: authBearer}
  })

  return headers
}
