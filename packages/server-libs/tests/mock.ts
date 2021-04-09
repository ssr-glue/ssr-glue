import { ServerSidePlugin } from 'ssr-glue'

declare module 'ssr-glue' {
  interface ServerSideEventMap {
    barPluginCreated: (event: { foo: string }) => boolean
  }
}

export function mockPlugins() {
  const onCreatedHandler = jest.fn()
  const onRequestHandler = jest.fn()
  const barPluginCreatedHandler = jest.fn()

  function fooPlugin(): ServerSidePlugin {
    return {
      name: 'server:foo',
      onCreated() {
        this.eventBus.on('barPluginCreated', (event) => {
          barPluginCreatedHandler(event)
          return true
        })

        onCreatedHandler('onCreated')
      },
      onRequest(request) {
        onRequestHandler(request)
      },
      async transformHtml(html: string) {
        return html.replace('foo', 'new foo')
      },
    }
  }

  function barPlugin(): ServerSidePlugin {
    return {
      name: 'server:foo',
      onCreated() {
        onCreatedHandler('onCreated')

        this.eventBus.trigger('barPluginCreated', { foo: 'bar' })
      },
      transformHtml(html: string) {
        return html.replace('bar', 'new bar')
      },
    }
  }

  return {
    barPluginCreatedHandler,
    onCreatedHandler,
    onRequestHandler,
    fooPlugin,
    barPlugin,
  }
}
