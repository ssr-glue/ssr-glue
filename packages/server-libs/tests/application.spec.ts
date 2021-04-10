import { mockPlugins } from './mock'
import { IncomingMessage } from 'http'
import { ServerSideApplication } from '../src'

const { requestHandler, createdHandler, bootHandler, fooPlugin, barPlugin } = mockPlugins()

const app = new ServerSideApplication({ plugins: [fooPlugin(), barPlugin()] })

it('should trigger `created` hooks', () => {
  expect(createdHandler).toHaveBeenCalledWith('onCreated')
  expect(createdHandler).toHaveBeenCalledTimes(2)
})

it('should trigger `boot` hooks', async () => {
  await app.boot()
  expect(bootHandler).toHaveBeenCalledWith('booting')
  expect(bootHandler).toHaveBeenCalledTimes(1)
})

it('should render html', async () => {
  const request = { url: 'https://www.example.com/' } as IncomingMessage
  const result = await app.render('foo | bar', request)

  expect(requestHandler).toHaveBeenCalledWith(request)
  expect(requestHandler).toHaveBeenCalledTimes(1)

  expect(result).toEqual('new foo | new bar')
})
