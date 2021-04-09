import { IncomingMessage } from 'http'
import { ServerSidePlugin } from 'ssr-glue'
import { EventDispatcher } from 'EventDispatcher'
import { ServerSidePluginContainer } from './plugin'
import { ServerSideEventMap, ServerSidePluginHookContext } from 'ssr-glue'

export type ServerAppOptions = {
  plugins: ServerSidePlugin[]
}

export class ServerSideApplication {
  private pluginContainer: ServerSidePluginContainer
  readonly eventBus: EventDispatcher<ServerSideEventMap>

  constructor({ plugins = [] }: Partial<ServerAppOptions>) {
    this.eventBus = new EventDispatcher<ServerSideEventMap>()
    this.pluginContainer = new ServerSidePluginContainer(plugins, this.getHookContext())
    this.pluginContainer.triggerOnCreated()
  }

  /**
   * Render the application to HTML.
   * @param baseHtml
   * @param request
   */
  async render(baseHtml: string, request: IncomingMessage): Promise<string> {
    await this.pluginContainer.triggerOnRequest(request)

    return this.pluginContainer.transformHtml(baseHtml)
  }

  getHookContext(): ServerSidePluginHookContext {
    return {
      eventBus: this.eventBus,
    }
  }
}
