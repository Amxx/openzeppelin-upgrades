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

export const upgradeProxy: UpgradeProxyFunction = async function(
  proxyAddress: string,
  factory: ContractFactory,
  opts: Options = {},
): Promise<ContractInstance> {
  const requiredOpts: Required<Options> = withDefaults(opts);
  const env: Environment = requiredOpts;

  const { provider } = env.network;
  const manifest = await Manifest.forNetwork(provider);

  if (requiredOpts.kind === 'auto') {
    try {
      const { kind } = await manifest.getProxyFromAddress(proxyAddress);
      requiredOpts.kind = kind;
    } catch (e) {
      if (e instanceof Error) {
        requiredOpts.kind = 'transparent';
      } else {
        throw e;
      }
    }
  }

  const adminAddress = await getAdminAddress(provider, proxyAddress);
  const adminBytecode = await provider.send('eth_getCode', [adminAddress]);

  if (adminBytecode === '0x') {
    // No admin contract: use TransparentUpgradeableProxyFactory to get proxiable interface
    const TransparentUpgradeableProxyFactory = getTransparentUpgradeableProxyFactory(Contract);
    const proxy = new TransparentUpgradeableProxyFactory(proxyAddress);
    const nextImpl = await deployImpl(Contract, requiredOpts, { proxyAddress, manifest });
    await proxy.upgradeTo(nextImpl);
  } else {
    // Admin contract: redirect upgrade call through it
    const AdminFactory = getProxyAdminFactory(Contract);
    const admin = new AdminFactory(adminAddress);
    const manifestAdmin = await manifest.getAdmin();
    if (admin.address !== manifestAdmin?.address) {
      throw new Error('Proxy admin is not the one registered in the network manifest');
    }

    const nextImpl = await deployImpl(Contract, requiredOpts, { proxyAddress, manifest });
    await admin.upgrade(proxyAddress, nextImpl);
  }

  factory.address = proxyAddress;
  return attach(factory, proxyAddress);
}
