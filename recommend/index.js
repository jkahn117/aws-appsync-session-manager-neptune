const gremlin = require('gremlin')
const Graph = gremlin.structure.Graph
const P = gremlin.process.P
const Order = gremlin.process.order
const Scope = gremlin.process.scope
const Column = gremlin.process.column
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection

////
const endpoint = `ws://${process.env.NEPTUNE_ENDPOINT}:${process.env.NEPTUNE_PORT}/gremlin`
const graph = new Graph()
const g = graph.traversal().withRemote(new DriverRemoteConnection(endpoint))


/**
 * Retrieves a list of recommendations based on the sessions other users with
 * similar registrations have registered for.
 * @see http://tinkerpop.apache.org/docs/current/recipes/#recommendation
 */
const recommendForUser = async(userId) => {
  return g.V()
    .has('User', 'userId', userId).as('user')
    .out('registered').aggregate('self')
    .in_('registered').where(P.neq('user'))
    .out('registered').where(P.without('self'))
    //.values('sessionId')
    .valueMap()
    //.sideEffect((it) => console.log(it))
    .groupCount()
    .order(Scope.local)
      .by(Column.values, Order.decr)
    .next()
}

/**
 * Builds a JSON representation of a Session from the result of the Gremlin
 * traversal.
 */
const buildSessionFrom = (recommendation) => {
  // TODO: must be a better approach to this than regex
  const parser = /{?(\w+)=\[([^\]]+)\]/gm
  
  let session = {}
  let match = null
  while ((match = parser.exec(recommendation)) !== null) {
    let key = match[1].replace(/^\w/, c => c.toUpperCase())
    session[key] = match[2]
  }
  
  console.log(session)
  return session
}


/**
 * Main handler function. Expects a request from AppSync such as:
 * 
 * { "userId": "XXXXX" }
 */
exports.handler = async (event) => {
  console.log(`Recommendations for ${event.userId}`)
  
  let error = null
  let sessions = []
  
  try {
    let recommendations = await recommendForUser(event.userId)
    for (let recommendation of Object.keys(recommendations.value)) {
      sessions.push(buildSessionFrom(recommendation))
    }
  } catch (e) {
    console.error(`[ERROR] ${e.message}`)
    console.log(JSON.stringify(e))
    return { error: e.message }
  }
  
  return { sessions: sessions }
}