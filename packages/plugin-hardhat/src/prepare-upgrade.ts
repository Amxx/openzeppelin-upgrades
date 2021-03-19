import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Manifest, getAdminAddress } from '@openzeppelin/upgrades-core';

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

    // Autodetect proxy type
    const adminAddress = await getAdminAddress(provider, proxyAddress);
    if (requiredOpts.kind === 'auto') {
      requiredOpts.kind = adminAddress === '0x0000000000000000000000000000000000000000' ? 'uups' : 'transparent';
    }

    return await deployImpl(hre, factory, requiredOpts, { proxyAddress, manifest });
  };
}
