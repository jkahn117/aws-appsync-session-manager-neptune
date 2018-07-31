const gremlin = require('gremlin')
const Graph = gremlin.structure.Graph
const P = gremlin.process.P
const Order = gremlin.process.order
const Scope = gremlin.process.scope
const Column = gremlin.process.column

const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const util = require('util')

////
const endpoint = `ws://${process.env.NEPTUNE_ENDPOINT}:${process.env.NEPTUNE_PORT}/gremlin`
const graph = new Graph()
const g = graph.traversal().withRemote(new DriverRemoteConnection(endpoint))


////
// @see http://tinkerpop.apache.org/docs/current/recipes/#recommendation
const recommendForUser = async(userId) => {
  return g.V()
    .has('User', 'name', userId).as('user')
    .out('registered').aggregate('self')
    .in_('registered').where(P.neq('user'))
    .out('registered').where(P.without('self'))
    .valueMap()
    .groupCount()
    .order(Scope.local)
      .by(Column.values, Order.decr)
    .toList()
}


///

/**
 * expected event from AppSync:
 * 
 * {
 *   "userId": "XXXXX",
 *   "limit": 5
 * }
 */

exports.handler = async (event) => {
  console.log(`Recommendations for ${event.userId}`)
  let result = await recommendForUser(event.userId)
  console.log(result)
  
  // TODO: need to parse results to return session ids / titles?
  
  return { sessions: result }
}