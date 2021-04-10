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
    this.pluginContainer.triggerCreated()
  }

  /**
   * Boot the application, should be called after application was created.
   */
  async boot(): Promise<void> {
    await this.pluginContainer.triggerBoot()
  }

  /**
   * Render the application to HTML.
   * @param baseHtml
   * @param request
   */
  async render(baseHtml: string, request: IncomingMessage): Promise<string> {
    await this.pluginContainer.triggerRequest(request)

    return this.pluginContainer.triggerTransformHtml(baseHtml)
  }

  getHookContext(): ServerSidePluginHookContext {
    return {
      eventBus: this.eventBus,
    }
  }
}
