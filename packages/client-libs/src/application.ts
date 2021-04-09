import { EventDispatcher } from 'EventDispatcher'
import { ClientSidePluginContainer } from './plugin'
import { ClientSidePlugin, ClientSideEventMap, ClientSidePluginHookContext } from 'ssr-glue'

export type ClientAppOptions = {
  plugins: ClientSidePlugin[]
}

export class ClientSideApplication {
  private pluginContainer: ClientSidePluginContainer
  readonly eventBus: EventDispatcher<ClientSideEventMap>

  constructor({ plugins = [] }: Partial<ClientAppOptions>) {
    this.eventBus = new EventDispatcher<ClientSideEventMap>()
    this.pluginContainer = new ClientSidePluginContainer(plugins, this.getHookContext())

    this.pluginContainer.triggerOnCreated()
  }

  getHookContext(): ClientSidePluginHookContext {
    return {
      eventBus: this.eventBus,
    }
  }
}
