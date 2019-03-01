const AWS = require('aws-sdk')
const cognito = new AWS.CognitoIdentityServiceProvider({ region: 'us-west-2' })

async function invalidateUsers() {
  const rawUsers = await new Promise((resolve, reject) =>
    cognito.listUsers({ UserPoolId: 'us-west-2_***REMOVED***' }, (err, res) => {
      if (err) reject(err)
      else resolve(res.Users)
    })
  )

  const salesmen = (await new Promise((resolve, reject) =>
    cognito.listUsersInGroup(
      { GroupName: 'Salesmen', UserPoolId: 'us-west-2_***REMOVED***' },
      (err, res) => {
        if (err) reject(err)
        else resolve(res.Users)
      }
    )
  )).map(o => o.Username)

  const admins = (await new Promise((resolve, reject) =>
    cognito.listUsersInGroup(
      {
        GroupName: 'Admin',
        UserPoolId: 'us-west-2_***REMOVED***'
      },
      (err, res) => {
        if (err) reject(err)
        else resolve(res.Users)
      }
    )
  )).map(o => o.Username)

  module.exports.value = rawUsers.map(user => {
    const obj = {}

    for (const attr of user.Attributes) {
      switch (attr.Name) {
        case 'email':
          obj.email = attr.Value
          break
        case 'name':
          obj.name = attr.Value
          break
      }
    }

    obj.salesman = salesmen.includes(user.Username)
    obj.admin = admins.includes(user.Username)
    obj.id = user.Username

    return obj
  })
}

invalidateUsers()

module.exports = { value: [], invalidateUsers }
