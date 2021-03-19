import { ValidationOptions, withValidationDefaults } from '@openzeppelin/upgrades-core';

export type Options = DeployOptions & ValidationOptions;

export type ProxyKind = 'auto' | 'uups' | 'transparent';
export type ProxyInitializer = string | false;

export interface DeployOptions {
  deployer?: Deployer;
  initializer?: ProxyInitializer;
  kind?: ProxyKind;
}

export function withDeployDefaults(opts: DeployOptions): Required<DeployOptions> {
  return {
    deployer: opts.deployer ?? defaultDeployer,
    initializer: opts.initializer ?? 'initialize',
    kind: opts.kind ?? 'auto',
  };
}

export function withDefaults(opts: Options): Required<Options> {
  return {
    ...withDeployDefaults(opts),
    ...withValidationDefaults(opts),
  };
}

import { ContractFactory, ContractInstance, Deployer } from './template';
import { getTruffleConfig } from './truffle';

const defaultDeployer: Deployer = {
  get provider() {
    return getTruffleConfig().provider;
  },
  async deploy(factory: ContractFactory, ...args: unknown[]): Promise<ContractInstance> {
    return factory.new(...args);
  },
};
