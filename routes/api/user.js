const Router = require('koa-router')
const AWS = require('aws-sdk')
const { promisify } = require('util')

const users = require('../../schema/users.js')

const cognito = new AWS.CognitoIdentityServiceProvider({ region: 'us-west-2' })
const adminCreateUser = promisify(cognito.adminCreateUser).bind(cognito)
const adminAddUserToGroup = promisify(cognito.adminAddUserToGroup).bind(cognito)
const adminRemoveUserFromGroup = promisify(
  cognito.adminRemoveUserFromGroup
).bind(cognito)
const adminResetUserPassword = promisify(cognito.adminResetUserPassword).bind(
  cognito
)
const adminDeleteUser = promisify(cognito.adminDeleteUser).bind(cognito)

const router = new Router()

router.get('/', ctx => (ctx.body = users.value))

router.post('/', async ctx => {
  const config = ctx.request.body

  const user = await adminCreateUser({
    UserPoolId: '***REMOVED***',
    Username: config.email,
    DesiredDeliveryMediums: ['EMAIL'],
    ForceAliasCreation: false,
    UserAttributes: [
      {
        Name: 'email',
        Value: config.email
      },
      {
        Name: 'name',
        Value: config.name
      },
      {
        Name: 'email_verified',
        Value: 'true'
      }
    ]
  })

  if (config.isAdmin) {
    adminAddUserToGroup({
      GroupName: 'Admin',
      UserPoolId: '***REMOVED***',
      Username: user.User.Username
    })
  }

  if (config.isSalesmen) {
    adminAddUserToGroup({
      GroupName: 'Salesmen',
      UserPoolId: '***REMOVED***',
      Username: user.User.Username
    })
  }

  ctx.body = user.User
  await users.invalidateUsers()
  ctx.socketIo.emit('invalidateUsers')
})

router.post('/:id', async ctx => {
  const config = ctx.request.body

  if (config.isAdmin) {
    adminAddUserToGroup({
      GroupName: 'Admin',
      UserPoolId: '***REMOVED***',
      Username: config.id
    })
  } else {
    adminRemoveUserFromGroup({
      GroupName: 'Admin',
      UserPoolId: '***REMOVED***',
      Username: config.id
    })
  }

  if (config.isSalesmen) {
    adminAddUserToGroup({
      GroupName: 'Salesmen',
      UserPoolId: '***REMOVED***',
      Username: config.id
    })
  } else {
    adminRemoveUserFromGroup({
      GroupName: 'Salesmen',
      UserPoolId: '***REMOVED***',
      Username: config.id
    })
  }
  ctx.status = 200
  await users.invalidateUsers()
  ctx.socketIo.emit('invalidateUsers')
})

router.delete('/:id', async ctx => {
  await adminDeleteUser({
    UserPoolId: '***REMOVED***',
    Username: ctx.params.id
  })
  ctx.status = 200
  await users.invalidateUsers()
  ctx.socketIo.emit('invalidateUsers')
})

router.get('/:id/reset', async ctx => {
  ctx.body = await adminResetUserPassword({
    UserPoolId: '***REMOVED***',
    Username: ctx.params.id
  })
  ctx.status = 200
})

module.exports = router.routes()
