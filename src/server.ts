import 'dotenv/config'
import app from './app'

app.listen({ port: 3333 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }

  app.log.info(`server running at ${address}`)
})
