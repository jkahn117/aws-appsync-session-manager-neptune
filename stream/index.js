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
  console.log(record.dynamodb.NewImage.Title.S)

  return g.addV('Session')
    .property('id', sessionId)
    .property('Title', record.dynamodb.NewImage.Title.S)
    .property('SessionType', record.dynamodb.NewImage.SessionType.S)
    .next()
}


///
exports.handler = async (event) => {
  for(let record of event.Records) {
    // console.log(util.inspect(record, { depth: 5 }))
    let sessionId = record.dynamodb.Keys.SessionId.S
    console.log(`${record.eventName} record: ${sessionId}`)

    switch(record.eventName) {
      case 'INSERT':
      case 'MODIFY':
        try {
          let result = await addSessionToGraph(sessionId, record)
          console.log(result)
        } catch (e) {
          console.error(e)
        }
        
        break
      case 'REMOVE':
        break
      default:
        throw new Error(`Unsupported event ${record.eventName}`)
    }
  }

  return { message: `Finished processing ${event.Records.length} records` }
}