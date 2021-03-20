import { Manifest, getAdminAddress } from '@openzeppelin/upgrades-core';

import {
  Environment,
  ContractFactory,
  ContractInstance,
  UpgradeProxyFunction,
  Options,
  withDefaults,
  attach,
  deployImpl,
  getTransparentUpgradeableProxyFactory,
  getProxyAdminFactory,
} from './utils';

export function makeUpgradeProxy(env: Environment): UpgradeProxyFunction {
  return async function upgradeProxy(
    proxyAddress: string,
    factory: ContractFactory,
    opts: Options = {},
  ): Promise<ContractInstance> {
    const requiredOpts: Required<Options> = withDefaults({ deployer: factory.signer, ...opts });

    const { provider } = env.network;
    const manifest = await Manifest.forNetwork(provider);

    // Autodetect proxy type
    const adminAddress = await getAdminAddress(provider, proxyAddress);
    if (requiredOpts.kind === 'auto') {
      requiredOpts.kind = adminAddress === '0x0000000000000000000000000000000000000000' ? 'uups' : 'transparent';
    }

    switch (requiredOpts.kind) {
      case 'uups': {
        // Use TransparentUpgradeableProxyFactory to get proxiable interface
        const TransparentUpgradeableProxyFactory = await getTransparentUpgradeableProxyFactory(env, factory.signer);
        const proxy = attach(TransparentUpgradeableProxyFactory, proxyAddress);
        const nextImpl = await deployImpl(env, factory, requiredOpts, { proxyAddress, manifest });
        await proxy.upgradeTo(nextImpl);
        break;
      }

      case 'transparent': {
        const AdminFactory = await getProxyAdminFactory(env, factory.signer);
        const admin = attach(AdminFactory, adminAddress);
        const manifestAdmin = await manifest.getAdmin();
        if (admin.address !== manifestAdmin?.address) {
          throw new Error('Proxy admin is not the one registered in the network manifest');
        }
        const nextImpl = await deployImpl(env, factory, requiredOpts, { proxyAddress, manifest });
        await admin.upgrade(proxyAddress, nextImpl);
        break;
      }
    }

    return attach(factory, proxyAddress);
  };
}
