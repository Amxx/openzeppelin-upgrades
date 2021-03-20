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

import {
  Environment,
  ContractFactory,
  Options,
} from './types';

import { deploy } from '../specialize/deploy';
import { readValidations } from './validations';

export async function deployImpl(
  env: Environment,
  factory: ContractFactory,
  requiredOpts: Required<Options>,
  checkStorageUpgrade?: { proxyAddress: string; manifest: Manifest },
): Promise<string> {
  if (requiredOpts.kind === 'transparent') {
    requiredOpts.unsafeAllow.push('no-public-upgrade-fn');
  }

  const { provider } = env.network;
  const validations = await readValidations(env);
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
