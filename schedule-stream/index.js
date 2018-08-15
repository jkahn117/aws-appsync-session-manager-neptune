const gremlin = require('gremlin')
const Graph = gremlin.structure.Graph
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection

const { addV, otherV, unfold } = gremlin.process.statics

////
const endpoint = `ws://${process.env.NEPTUNE_ENDPOINT}:${process.env.NEPTUNE_PORT}/gremlin`
const graph = new Graph()
const g = graph.traversal().withRemote(new DriverRemoteConnection(endpoint))

///
const addScheduledSessionToGraph = async(userId, sessionId) => {
  // session should already exist in graph, get it for later
  let session = await g.V().has('Session', 'sessionId', sessionId)
  
  // if user does not already exist in graph, create and then add edge
  return await g.V()
      .has('User', 'userId', userId)
      .fold()
      .coalesce(unfold(), addV('User').property('userId', userId))
      //.as('user')
      .addE('registered')./*from_('user').*/to(session)
      .next()
      
  /* not sure why this version doesn't work....
    return await g.V()
      .has('Session', 'sessionId', sessionId).as('session').V()
      .has('User', 'userId', userId)
      .fold()
      .coalesce(unfold(), addV('User').property('userId', userId))
      .as('user')
      .addE('registered').from_('user').to(session)
      .next()
  */
}

///
const removeScheduledSessionFromGraph = async(userId, sessionId) => {
  // session should already exist in graph, get it for later
  let session = await g.V().has('Session', 'sessionId', sessionId)
  
  return await g.V()
      .has('User', 'userId', userId)
      .outE()
      .where(otherV().has('Session', 'sessionId', sessionId))
      .drop()
      .iterate()
}

///
exports.handler = async (event) => {
  for(let record of event.Records) {
    console.log(JSON.stringify(event))
    let userId = record.dynamodb.Keys.UserId.S
    let sessionId = record.dynamodb.Keys.SessionId.S
    console.log(`${record.eventName}: User (${userId}) + Session (${sessionId})`)
    
    try {
      switch(record.eventName) {
        case 'INSERT':
          await addScheduledSessionToGraph(userId, sessionId)
          break
        case 'REMOVE':
          await removeScheduledSessionFromGraph(userId, sessionId)
          break
        case 'MODIFY':
          // NOTE: MODIFY should never occur as API only allows add / remove, we'll ignore
          break
        default:
          throw new Error(`Unsupported event ${record.eventName}`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return { message: `Finished processing ${event.Records.length} records` }
}