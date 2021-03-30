import chalk from 'chalk';
import { Manifest, fetchOrDeployProxy, fetchOrDeployAdmin } from '@openzeppelin/upgrades-core';

import {
  Plugin,
  Options,
} from '../types';

import {
  deployImpl,
} from './deploy-impl';

export async function deployProxy<E,D,F,I extends { address: string, txHash?: string }>(
  plugin: Plugin<E,D,F,I>,
  env: E,
  factory: F,
  args: unknown[],
  opts: Required<Options<E,D,F,I>>,
): Promise<I> {
  const provider = plugin.getProvider(env);
  const manifest = await Manifest.forNetwork(provider);
  const impl = await deployImpl(plugin, env, factory, opts);
  const data = opts.initializer ? encodeCall(plugin, factory, opts.initializer, ...args) : '0x';

  if (opts.kind === 'uups' && (await manifest.getAdmin())) {
    console.log(
      chalk.keyword('orange')(
        `Warning: the manifest include records of an proxy admin. This is not nativelly compatible with UUPS proxies. Any further admin action will have no affect on this new proxy.`,
      ),
    );
  }

  let proxyAddress: string;
  switch (opts.kind) {
    case 'uups': {
      const ProxyFactory = await plugin.getProxyFactory(env);
      proxyAddress = await fetchOrDeployProxy(provider, 'uups', async () => {
        const { address, txHash } = await plugin.deployContract(
          opts.deployer,
          ProxyFactory,
          impl,
          data,
        );
        return { address, txHash };
      });
      break;
    }

    case 'auto':
    case 'transparent': {
      const AdminFactory = await plugin.getProxyAdminFactory(env);
      const adminAddress = await fetchOrDeployAdmin(provider, async () => {
        const { address, txHash } = await plugin.deployContract(
          opts.deployer,
          AdminFactory,
        );
        return { address, txHash };
      });
      const TransparentUpgradeableProxyFactory = await plugin.getTransparentUpgradeableProxyFactory(env);
      proxyAddress = await fetchOrDeployProxy(provider, 'transparent', async () => {
        const { address, txHash } = await plugin.deployContract(
          opts.deployer,
          TransparentUpgradeableProxyFactory,
          impl,
          adminAddress,
          data,
        );
        return { address, txHash };
      });
      break;
    }
  }

  const { txHash } = await manifest.getProxyFromAddress(proxyAddress);

  return {
    ...plugin.attachContract(factory, proxyAddress),
    txHash,
    transactionHash: txHash,
  };
}

function encodeCall<E,D,F,I>(plugin: Plugin<E,D,F,I>, factory: F, signature: string, ...args: unknown[]): string {
  try {
    return plugin.encodeCall(factory, signature, ...args);
  } catch (e: unknown) {
    if (e instanceof Error) {
      if (signature === 'initialize' && args.length === 0 && e.message.includes('no matching function')) {
        return '0x';
      }
    }
    throw e;
  }
}
