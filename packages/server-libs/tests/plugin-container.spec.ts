import { mockPlugins } from './mock'
import { IncomingMessage } from 'http'
import { ServerSidePluginContainer } from '../src'
import { EventDispatcher } from 'EventDispatcher'
import { ServerSideEventMap } from 'ssr-glue'

const { barPluginCreatedHandler, onRequestHandler, onCreatedHandler, fooPlugin, barPlugin } = mockPlugins()

const eventBus = new EventDispatcher<ServerSideEventMap>()

const pluginContainer = new ServerSidePluginContainer([fooPlugin(), barPlugin()], { eventBus })

test('trigger `OnCreated` hooks', () => {
  pluginContainer.triggerOnCreated()

  expect(onCreatedHandler).toHaveBeenCalledWith('onCreated')
  expect(onCreatedHandler).toHaveBeenCalledTimes(2)
  expect(barPluginCreatedHandler).toHaveBeenCalledWith({ foo: 'bar', type: 'barPluginCreated' })
})

test('trigger `OnRequest` hooks', () => {
  const request = { url: 'https://www.example.com/' } as IncomingMessage
  pluginContainer.triggerOnRequest(request)

  expect(onRequestHandler).toHaveBeenCalledWith(request)
  expect(onRequestHandler).toHaveBeenCalledTimes(1)
})

test('transform html hooks', async () => {
  const result = await pluginContainer.transformHtml('foo | bar')

  expect(result).toEqual('new foo | new bar')
})
