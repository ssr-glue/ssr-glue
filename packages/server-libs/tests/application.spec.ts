import { mockPlugins } from './mock'
import { IncomingMessage } from 'http'
import { ServerSideApplication } from '../src'

const { onRequestHandler, onCreatedHandler, fooPlugin, barPlugin } = mockPlugins()

const app = new ServerSideApplication({ plugins: [fooPlugin(), barPlugin()] })

it('should trigger `OnCreated` hooks', () => {
  expect(onCreatedHandler).toHaveBeenCalledWith('onCreated')
  expect(onCreatedHandler).toHaveBeenCalledTimes(2)
})

it('should render html', async () => {
  const request = { url: 'https://www.example.com/' } as IncomingMessage
  const result = await app.render('foo | bar', request)

  expect(onRequestHandler).toHaveBeenCalledWith(request)
  expect(onRequestHandler).toHaveBeenCalledTimes(1)

  expect(result).toEqual('new foo | new bar')
})
