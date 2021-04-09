import { BasePluginContainer, ClientSidePlugin, ClientSidePluginHookContext } from 'ssr-glue'

export class ClientSidePluginContainer extends BasePluginContainer<
  ClientSidePlugin,
  ClientSidePluginHookContext
> {}
