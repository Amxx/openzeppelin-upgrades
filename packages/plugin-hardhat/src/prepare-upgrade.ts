import { Manifest, getAdminAddress } from '@openzeppelin/upgrades-core';

import {
  Environment,
  ContractFactory,
  PrepareUpgradeFunction,
  Options,
  withDefaults,
  deployImpl,
} from './utils';

export function makePrepareUpgrade(env: Environment): PrepareUpgradeFunction {
  return async function prepareUpgrade(
    proxyAddress: string,
    factory: ContractFactory,
    opts: Options = {},
  ): Promise<string> {
    const requiredOpts: Required<Options> = withDefaults({ deployer: factory.signer, ...opts });

    const { provider } = env.network;
    const manifest = await Manifest.forNetwork(provider);

    // Autodetect proxy type
    const adminAddress = await getAdminAddress(provider, proxyAddress);
    if (requiredOpts.kind === 'auto') {
      requiredOpts.kind = adminAddress === '0x0000000000000000000000000000000000000000' ? 'uups' : 'transparent';
    }

    return await deployImpl(env, factory, requiredOpts, { proxyAddress, manifest });
  };
}
