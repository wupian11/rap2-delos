// const debug = true
import * as Koa from 'koa'
import * as session from 'koa-session'
import * as logger from 'koa-logger'
import * as serve from 'koa-static'
import * as body from 'koa-body'
import * as cors from 'kcors'
import router from '../routes'
import config from '../config'

const app = new Koa()
let appAny: any = app
appAny.counter = { users: {}, mock: 0 }

app.keys = config.keys
app.use(session(config.session, app))
app.use(logger())
app.use(async(ctx, next) => {
  await next()
  if (ctx.path === '/favicon.ico') return
  ctx.session.views = (ctx.session.views || 0) + 1
  let app: any = ctx.app
  if (ctx.session.fullname) app.counter.users[ctx.session.fullname] = true
})
app.use(cors({
  credentials: true,
}))
app.use(async(ctx, next) => {
  await next()
  if (typeof ctx.body === 'object' && ctx.body.data !== undefined) {
    ctx.type = 'json'
    // ctx.body.path = ctx.path
    ctx.body = JSON.stringify(ctx.body, undefined, 2)
  }
})
app.use(async(ctx, next) => {
  await next()
  if (ctx.request.query.callback) {
    let body = typeof ctx.body === 'object' ? JSON.stringify(ctx.body, undefined, 2) : ctx.body
    ctx.body = ctx.request.query.callback + '(' + body + ')'
    ctx.type = 'application/x-javascript'
  }
})

app.use(serve('public'))
app.use(serve('test'))
app.use(body())
app.use(router.routes())

export default app