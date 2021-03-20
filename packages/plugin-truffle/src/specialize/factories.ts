import { TruffleContract, getTruffleProvider, getTruffleDefaults } from './truffle';
import { Environment, ContractFactory, Deployer } from './types';

interface Artefact { abi: any; bytecode: string; }

export interface FactoryGetter {
  (env: Environment, deployer?: Deployer): Promise<ContractFactory>;
}

export function makeFactoryGetter(artifacts: Artefact): FactoryGetter {
  return function (env: Environment, deployer?: Deployer): Promise<ContractFactory> {
    const contract = TruffleContract(artifacts);
    contract.setProvider(deployer?.provider ?? getTruffleProvider()); // template?.currentProvider ??
    contract.defaults(getTruffleDefaults()); // template?.class_defaults ??
    return Promise.resolve(contract);
  };
}
