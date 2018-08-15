
const DynamoDB = require('aws-sdk/clients/dynamodb')

SCHEDULE_TABLE = 'SessionManager-user-schedule-table'

let ddb = new DynamoDB.DocumentClient({ region: 'us-east-2' })

/// now, add a few sample registrations for later

let registrations = [
  {
    SessionId: 'BB0EF3A7-3E33-49CC-B148-4F13B47CEE00',
    UserId: '65F6DA85-58E6-4D21-A2A9-40E2A7D852C4'
  },
  {
    SessionId: 'C516AA84-B0B1-4092-BFD5-D664D743992A',
    UserId: '65F6DA85-58E6-4D21-A2A9-40E2A7D852C4'
  },
  {
    SessionId: '1A40A9E3-5DDD-42D7-B393-D7E10AAEA17F',
    UserId: '65F6DA85-58E6-4D21-A2A9-40E2A7D852C4'
  },
  {
    SessionId: 'BB0EF3A7-3E33-49CC-B148-4F13B47CEE00',
    UserId: 'B5349BFA-DE2F-4083-BEE5-1B980AFEC372'
  },
  {
    SessionId: '1A40A9E3-5DDD-42D7-B393-D7E10AAEA17F',
    UserId: 'B5349BFA-DE2F-4083-BEE5-1B980AFEC372'
  },
  {
    SessionId: '0C17272F-B3B1-4956-8EBA-F2C806D74197',
    UserId: 'B5349BFA-DE2F-4083-BEE5-1B980AFEC372'
  },
  {
    SessionId: 'BB0EF3A7-3E33-49CC-B148-4F13B47CEE00',
    UserId: '07676958-7969-4B76-9FFC-EF0F05BF0C01'
  },
  {
    SessionId: 'C516AA84-B0B1-4092-BFD5-D664D743992A',
    UserId: 'D64528C5-3A28-4EF0-AAB3-73CF023D56B6'
  },
]

params = {
  RequestItems: {}
}
params.RequestItems[SCHEDULE_TABLE] = []

for (let reg of registrations) {
  ddb.put({
    TableName: SCHEDULE_TABLE,
    Item: reg
  }, (error, data) => {
    if (error) {
      console.error(error)
    }
  })
}

console.log('Finished')

