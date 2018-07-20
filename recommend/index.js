const gremlin = require('gremlin')
const Graph = gremlin.structure.Graph
const DriverRemoteConnection = gremlin.driver.DriverRemoteConnection
const util = require('util')

////
const endpoint = `ws://${process.env.NEPTUNE_ENDPOINT}:${process.env.NEPTUNE_PORT}/gremlin`
const graph = new Graph()
const g = graph.traversal().withRemote(new DriverRemoteConnection(endpoint))

////

const sampleVertices = async() => {
  return g.V().hasLabel('Session').values('Title').toList()
}


///
exports.handler = async (event) => {
  let sessions = await sampleVertices()
  console.log(util.inspect(sessions, { depth: 5 }))

  return { vertices: 'finished' }
}