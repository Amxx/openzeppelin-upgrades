import { fetchOrDeployAdmin } from '@openzeppelin/upgrades-core';

import {
  Environment,
  ContractFactory,
  ContractInstance,
  DeployProxyFunction,
  Options,
  withDefaults,
  attach,
  deploy,
  deployImpl,
  getProxyFactory,
  getTransparentUpgradeableProxyFactory,
  getProxyAdminFactory,
} from './utils';

export function makeDeployProxy(env: Environment): DeployProxyFunction {
  return async function deployProxy(
    factory: ContractFactory,
    args: unknown[] | Options = [],
    opts: Options = {},
  ): Promise<ContractInstance> {
    if (!Array.isArray(args)) {
      opts = args;
      args = [];
    }
    const requiredOpts: Required<Options> = withDefaults({ deployer: factory.signer, ...opts });

    const { provider } = env.network;
    const impl = deployImpl(env, factory, requiredOpts);
    const data = getInitializerData(factory, args, requiredOpts.initializer);

    let proxy: ContractInstance;
    switch (requiredOpts.kind) {
      case 'auto':
      case 'uups': {
        const ProxyFactory = await getProxyFactory(env, factory.signer);
        proxy = await ProxyFactory.deploy(impl, data);
        break;
      }

      case 'transparent': {
        const AdminFactory = await getProxyAdminFactory(env, factory.signer);
        const adminAddress = await fetchOrDeployAdmin(provider, () => deploy(AdminFactory));
        const TransparentUpgradeableProxyFactory = await getTransparentUpgradeableProxyFactory(env, factory.signer);
        proxy = await TransparentUpgradeableProxyFactory.deploy(impl, adminAddress, data);
        break;
      }
    }

    const instance = attach(factory, proxy.address);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Won't be readonly because inst was created through attach.
    instance.deployTransaction = proxy.deployTransaction;
    return instance;
  };

  function getInitializerData(factory: ContractFactory, args: unknown[], initializer: string | false): string {
    if (initializer === false) {
      return '0x';
    }

    try {
      const fragment = factory.interface.getFunction(initializer);
      return factory.interface.encodeFunctionData(fragment, args);
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (initializer === 'initialize' && args.length === 0 && e.message.includes('no matching function')) {
          return '0x';
        }
      }
      throw e;
    }
  }
}
