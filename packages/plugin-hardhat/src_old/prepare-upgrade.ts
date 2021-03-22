import { Manifest, getAdminAddress } from '@openzeppelin/upgrades-core';
import type { ContractFactory } from 'ethers';

import { Manifest } from '@openzeppelin/upgrades-core';

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

    return await deployImpl(env, factory, requiredOpts, { proxyAddress, manifest });
  };
}
