import { withValidationDefaults } from '@openzeppelin/upgrades-core';
import {
  Plugin,
  Options,
  DeployOptions,
  Provider,
  ProxyKind,
  ProxyInitializer,
} from './types';

export function withDefaults<E,D,F,I>(
  plugin: Plugin<E,D,F,I>,
  opts: Options<E,D,F,I>,
  env: E
): Required<Options<E,D,F,I>>
{
  return {
    ...withDeployDefaults(plugin, opts, env),
    ...withValidationDefaults(opts),
  };
}

export function withDeployDefaults<E,D,F,I>(
  plugin: Plugin<E,D,F,I>,
  opts: DeployOptions<E,D,F,I>,
  env: E
): Required<DeployOptions<E,D,F,I>>
{
  const deployer:    D                = opts?.deployer          ?? plugin.getDeployer(env);
  const provider:    Provider         = opts?.network?.provider ?? plugin.getProvider(env);
  const kind:        ProxyKind        = opts?.kind              ?? 'auto';
  const initializer: ProxyInitializer = opts?.initializer       ?? 'initialize';
  const implArgs:    unknown[]        = opts?.implArgs          ?? [];
  return {
    deployer,
    network: { provider },
    kind,
    initializer,
    implArgs,
  };
}
