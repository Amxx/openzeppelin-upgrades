import chalk from 'chalk';
import type { HardhatRuntimeEnvironment } from 'hardhat/types';
import type { ContractFactory, Contract } from 'ethers';

import { Manifest, fetchOrDeployProxy, fetchOrDeployAdmin } from '@openzeppelin/upgrades-core';

import {
  attach,
  deploy,
  deployImpl,
  getProxyFactory,
  getTransparentUpgradeableProxyFactory,
  getProxyAdminFactory,
} from './utils';

export function makeDeployProxy(hre: HardhatRuntimeEnvironment): DeployProxyFunction {
  return async function deployProxy(
    factory: ContractFactory,
    args: unknown[] | Options = [],
    opts: Options = {},
  ): Promise<ContractInstance> {
    if (!Array.isArray(args)) {
      opts = args;
      args = [];
    }
    const requiredOpts: Required<Options> = withDefaults(opts);

    const { provider } = hre.network;
    const manifest = await Manifest.forNetwork(provider);
    const impl = await deployImpl(hre, ImplFactory, requiredOpts);
    const data = getInitializerData(ImplFactory, args, requiredOpts.initializer);

    if (requiredOpts.kind === 'uups' && (await manifest.getAdmin())) {
      console.log(
        chalk.keyword('orange')(
          `Warning: the manifest include records of an proxy admin. This is not nativelly compatible with UUPS proxies. Any further admin action will have no affect on this new proxy.`,
        ),
      );
    }

    let proxyAddress: string;
    switch (requiredOpts.kind) {
      case 'uups': {
        const ProxyFactory = await getProxyFactory(hre, ImplFactory.signer);
        proxyAddress = await fetchOrDeployProxy(provider, 'uups', () => deploy(ProxyFactory, impl, data));
        break;
      }

      case 'auto':
      case 'transparent': {
        const AdminFactory = await getProxyAdminFactory(hre, factory.signer);
        const adminAddress = await fetchOrDeployAdmin(provider, () => deploy(AdminFactory));
        const TransparentUpgradeableProxyFactory = await getTransparentUpgradeableProxyFactory(hre, ImplFactory.signer);
        proxyAddress = await fetchOrDeployProxy(provider, 'transparent', () =>
          deploy(TransparentUpgradeableProxyFactory, impl, adminAddress, data),
        );
        break;
      }
    }

    const { txHash } = await manifest.getProxyFromAddress(proxyAddress);

    const inst = ImplFactory.attach(proxyAddress);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Won't be readonly because inst was created through attach.
    inst.deployTransaction = await inst.provider.getTransaction(txHash);
    return inst;
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
