import { mockPlugins } from './mock'
import { IncomingMessage } from 'http'
import { ServerSidePluginContainer } from '../src'
import { EventDispatcher } from 'EventDispatcher'
import { ServerSideEventMap } from 'ssr-glue'

const { barPluginCreatedHandler, requestHandler, createdHandler, fooPlugin, barPlugin } = mockPlugins()

const eventBus = new EventDispatcher<ServerSideEventMap>()

const pluginContainer = new ServerSidePluginContainer([fooPlugin(), barPlugin()], { eventBus })

test('trigger `OnCreated` hooks', () => {
  pluginContainer.triggerCreated()

  expect(createdHandler).toHaveBeenCalledWith('onCreated')
  expect(createdHandler).toHaveBeenCalledTimes(2)
  expect(barPluginCreatedHandler).toHaveBeenCalledWith({ foo: 'bar', type: 'barPluginCreated' })
})

test('trigger `OnRequest` hooks', () => {
  const request = { url: 'https://www.example.com/' } as IncomingMessage
  pluginContainer.triggerRequest(request)

  expect(requestHandler).toHaveBeenCalledWith(request)
  expect(requestHandler).toHaveBeenCalledTimes(1)
})

test('transform html hooks', async () => {
  const result = await pluginContainer.triggerTransformHtml('foo | bar')

  expect(result).toEqual('new foo | new bar')
})
