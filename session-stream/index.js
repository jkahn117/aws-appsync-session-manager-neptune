const gremlin = require('gremlin')
const Graph = gremlin.structure.Graph
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const util = require('util')

////
const endpoint = `ws://${process.env.NEPTUNE_ENDPOINT}:${process.env.NEPTUNE_PORT}/gremlin`
const graph = new Graph()
const g = graph.traversal().withRemote(new DriverRemoteConnection(endpoint))


////
const addSessionToGraph = async(sessionId, record) => {
  console.log(`Adding session ${record.dynamodb.NewImage.Title.S} [${sessionId}]`)

  return g.addV('Session')
    .property('sessionId', sessionId)
    .property('title', record.dynamodb.NewImage.Title.S)
    .property('sessionType', record.dynamodb.NewImage.SessionType.S)
    .next()
}

////
const updateSessionInGraph = async(sessionId, record) => {
  console.log(`Updating session ${record.dynamodb.NewImage.Title.S} [${sessionId}]`)
  
  return g.V(sessionId)
    .property('title', record.dynamodb.NewImage.Title.S)
    .property('sessionType', record.dynamodb.NewImage.SessionType.S)
    .next()
}

////
const removeSessionFromGraph = async(sessionId) => {
  console.log(`Removing session ${sessionId}`)
  
  return g.V(sessionId)
    .next()
    .remove()
}

////
exports.handler = async (event) => {
  for(let record of event.Records) {
    // console.log(util.inspect(record, { depth: 5 }))
    let sessionId = record.dynamodb.Keys.SessionId.S
    console.log(`${record.eventName} record: ${sessionId}`)
    
    try {
      switch(record.eventName) {
        case 'INSERT':
          await addSessionToGraph(sessionId, record)
          break
        case 'MODIFY':
          await updateSessionInGraph(sessionId, record)
          break
        case 'REMOVE':
          await removeSessionFromGraph(sessionId)
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