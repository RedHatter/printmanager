const Router = require('koa-router')
const AWS = require('aws-sdk')
const { promisify } = require('util')

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

router.get('/', async ctx => {
  const config = ctx.request.body

  const user = await adminCreateUser({
    UserPoolId: 'us-west-2_***REMOVED***',
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

  if (config.admin) {
    adminAddUserToGroup({
      GroupName: 'Admin',
      UserPoolId: 'us-west-2_***REMOVED***',
      Username: user.User.Username
    })
  }

  if (config.salesmen) {
    adminAddUserToGroup({
      GroupName: 'Salesmen',
      UserPoolId: 'us-west-2_***REMOVED***',
      Username: user.User.Username
    })
  }

  ctx.body = user.User
  ctx.socketIo.emit('invalidateUsers')
})

router.post('/:id', async ctx => {
  const config = ctx.request.body

  if (config.admin) {
    adminAddUserToGroup({
      GroupName: 'Admin',
      UserPoolId: 'us-west-2_***REMOVED***',
      Username: config.id
    })
  } else {
    adminRemoveUserFromGroup({
      GroupName: 'Admin',
      UserPoolId: 'us-west-2_***REMOVED***',
      Username: config.id
    })
  }

  if (config.salesmen) {
    adminAddUserToGroup({
      GroupName: 'Salesmen',
      UserPoolId: 'us-west-2_***REMOVED***',
      Username: config.id
    })
  } else {
    adminRemoveUserFromGroup({
      GroupName: 'Salesmen',
      UserPoolId: 'us-west-2_***REMOVED***',
      Username: config.id
    })
  }
  ctx.status = 200
  ctx.socketIo.emit('invalidateUsers')
})

router.delete('/user/:id', async ctx => {
  adminDeleteUser({
    UserPoolId: 'us-west-2_***REMOVED***',
    Username: ctx.params.id
  })
  ctx.status = 200
  ctx.socketIo.emit('invalidateUsers')
})

router.get('/user/:id/reset', async ctx => {
  ctx.body = await adminResetUserPassword({
    UserPoolId: 'us-west-2_***REMOVED***',
    Username: ctx.params.id
  })
  ctx.status = 200
})

module.exports = router.routes()
