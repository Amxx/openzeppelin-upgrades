import { withValidationDefaults } from '@openzeppelin/upgrades-core';
import { getDefaultDeployer, getDefaultProvider } from '../specialize/defaults';
import { Environment, Deployer, Provider, Options, DeployOptions } from './types';

export function withDeployDefaults(opts: DeployOptions, env?: Environment): Required<DeployOptions> {
  const deployer: Deployer = opts?.deployer ?? getDefaultDeployer(env);
  const provider: Provider = opts?.network?.provider ?? deployer?.provider ?? getDefaultProvider(env);

  return {
    deployer,
    network: { provider },
    initializer: opts.initializer ?? 'initialize',
    kind: opts.kind ?? 'auto',
  };
}

export function withDefaults(opts: Options, env?: Environment): Required<Options> {
  return {
    ...withDeployDefaults(opts, env),
    ...withValidationDefaults(opts),
  };
}
