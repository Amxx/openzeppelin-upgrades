import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Manifest, getAdminAddress } from '@openzeppelin/upgrades-core';

import {
  ContractFactory,
  ContractInstance,
  UpgradeProxyFunction,
  Options,
  withDefaults,
} from './types/index';

import {
  attach,
  deployImpl,
  getTransparentUpgradeableProxyFactory,
  getProxyAdminFactory,
} from './utils';

export function makeUpgradeProxy(hre: HardhatRuntimeEnvironment): UpgradeProxyFunction {
  return async function upgradeProxy(
    proxyAddress: string,
    factory: ContractFactory,
    opts: Options = {},
  ): Promise<ContractInstance> {
    const requiredOpts: Required<Options> = withDefaults(opts);

    const { provider } = hre.network;
    const manifest = await Manifest.forNetwork(provider);

    // Autodetect proxy type
    const adminAddress = await getAdminAddress(provider, proxyAddress);
    if (requiredOpts.kind === 'auto') {
      requiredOpts.kind = adminAddress === '0x0000000000000000000000000000000000000000' ? 'uups' : 'transparent';
    }

    switch (requiredOpts.kind) {
      case 'uups': {
        // Use TransparentUpgradeableProxyFactory to get proxiable interface
        const TransparentUpgradeableProxyFactory = await getTransparentUpgradeableProxyFactory(hre, factory.signer);
        const proxy = attach(TransparentUpgradeableProxyFactory, proxyAddress);
        const nextImpl = await deployImpl(hre, factory, requiredOpts, { proxyAddress, manifest });
        await proxy.upgradeTo(nextImpl);
        break;
      }

      case 'transparent': {
        const AdminFactory = await getProxyAdminFactory(hre, factory.signer);
        const admin = attach(AdminFactory, adminAddress);
        const manifestAdmin = await manifest.getAdmin();
        if (admin.address !== manifestAdmin?.address) {
          throw new Error('Proxy admin is not the one registered in the network manifest');
        }
        const nextImpl = await deployImpl(hre, factory, requiredOpts, { proxyAddress, manifest });
        await admin.upgrade(proxyAddress, nextImpl);
        break;
      }
    }

    return attach(factory, proxyAddress);
  };
}
