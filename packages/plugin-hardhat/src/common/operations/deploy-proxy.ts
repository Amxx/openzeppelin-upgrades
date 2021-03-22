import { fetchOrDeployAdmin } from '@openzeppelin/upgrades-core';

import {
  Plugin,
  Options,
} from '../types';

import {
  deployImpl,
} from './deploy-impl';

export async function deployProxy<E,D,F,I extends { address: string, deployTransaction?: unknown }>(
  plugin: Plugin<E,D,F,I>,
  env: E,
  factory: F,
  args: unknown[],
  opts: Required<Options<E,D,F,I>>,
): Promise<I> {
  const provider = plugin.getProvider(env);
  const impl = await deployImpl(plugin, env, factory, opts);
  const data = getInitializerData(factory, args, opts.implementation);

  let proxy: I;
  switch (opts.kind) {
    case 'auto':
    case 'uups': {
      const proxyFactory = await plugin.getProxyFactory(env);
      proxy = await plugin.deployContract(
        opts.deployer,
        proxyFactory,
        impl,
        data,
      );
      break;
    }

    case 'transparent': {
      const adminFactory = await plugin.getProxyAdminFactory(env);
      const adminAddress = await fetchOrDeployAdmin(
        provider,
        () => plugin.deployContract(
          opts.deployer,
          adminFactory
        ),
      );
      const proxyFactory = await plugin.getTransparentUpgradeableProxyFactory(env);
      proxy = await plugin.deployContract(
        opts.deployer,
        proxyFactory,
        impl,
        adminAddress,
        data,
      );
      break;
    }
  }
  return {
    ...plugin.attachContract(factory, proxy.address),
    deployTransaction: proxy.deployTransaction,
  };
}

function getInitializerData<E,D,F,I>(
  factory: F,
  args: unknown[],
  implementation: Options<E,D,F,I>['implementation']
): string {
  // throw new Error('getInitializerData not implemented yet');
  // if (implementation.initializer === false) {
    return '0x';
  // }
  //
  // try {
  //   const fragment = factory.interface.getFunction(implementation.initializer);
  //   return factory.interface.encodeFunctionData(fragment, args);
  // } catch (e: unknown) {
  //   if (e instanceof Error) {
  //     if (implementation.initializer === 'initialize' && args.length === 0 && e.message.includes('no matching function')) {
  //       return '0x';
  //     }
  //   }
  //   throw e;
  // }
}
