import { HardhatRuntimeEnvironment } from 'hardhat/types';

import {
  ContractFactory,
  Options,
} from '../types/index';

import {
  Manifest,
  assertUpgradeSafe,
  assertStorageUpgradeSafe,
  getStorageLayout,
  fetchOrDeploy,
  getVersion,
  getUnlinkedBytecode,
  getImplementationAddress,
  getStorageLayoutForAddress,
} from '@openzeppelin/upgrades-core';

import { deploy } from './deploy';
import { readValidations } from './validations';

export async function deployImpl(
  hre: HardhatRuntimeEnvironment,
  factory: ContractFactory,
  requiredOpts: Required<Options>,
  checkStorageUpgrade?: { proxyAddress: string; manifest: Manifest },
): Promise<string> {
  if (requiredOpts.kind === 'transparent') {
    requiredOpts.unsafeAllow.push('no-public-upgrade-fn');
  }

  const { provider } = hre.network;
  const validations = await readValidations(hre);
  const unlinkedBytecode = getUnlinkedBytecode(validations, factory.bytecode);
  const version = getVersion(unlinkedBytecode, factory.bytecode);
  const layout = getStorageLayout(validations, version);
  assertUpgradeSafe(validations, version, requiredOpts);

  if (checkStorageUpgrade) {
    const currentImplAddress = await getImplementationAddress(provider, checkStorageUpgrade.proxyAddress);
    const deploymentLayout = await getStorageLayoutForAddress(
      checkStorageUpgrade.manifest,
      validations,
      currentImplAddress,
    );
    assertStorageUpgradeSafe(deploymentLayout, layout, requiredOpts.unsafeAllowCustomTypes);
  }

  return await fetchOrDeploy(version, provider, async () => {
    const deployment = await deploy(factory);
    return { ...deployment, layout };
  });
}
