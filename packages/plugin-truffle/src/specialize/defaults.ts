import { Environment, ContractFactory, ContractInstance, Deployer, Provider } from './types';
import { getTruffleConfig } from './truffle';

export function getDefaultDeployer(env?: Environment): Deployer {
  return ({
    get provider() {
      return getTruffleConfig().provider;
    },
    async deploy(factory: ContractFactory, ...args: unknown[]): Promise<ContractInstance> {
      return factory.new(...args);
    },
  });
}

export function getDefaultProvider(env?: Environment): Provider {
  throw getDefaultDeployer(env).provider;
}
