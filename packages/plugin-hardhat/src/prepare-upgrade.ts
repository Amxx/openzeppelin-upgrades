import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Manifest, getAdminAddress } from '@openzeppelin/upgrades-core';
import type { ContractFactory } from 'ethers';

import { Manifest } from '@openzeppelin/upgrades-core';

import {
  ContractFactory,
  PrepareUpgradeFunction,
  Options,
  withDefaults,
} from './types/index';

import { deployImpl } from './utils';

export function makePrepareUpgrade(hre: HardhatRuntimeEnvironment): PrepareUpgradeFunction {
  return async function prepareUpgrade(
    proxyAddress: string,
    factory: ContractFactory,
    opts: Options = {},
  ): Promise<string> {
    const requiredOpts: Required<Options> = withDefaults(opts);

    const { provider } = hre.network;
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

    return await deployImpl(hre, factory, requiredOpts, { proxyAddress, manifest });
  };
}
