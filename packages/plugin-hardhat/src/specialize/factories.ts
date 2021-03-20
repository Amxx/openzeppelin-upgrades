import { Environment, ContractFactory, Deployer } from './types';

interface Artefact { abi: any; bytecode: string; }

export interface FactoryGetter {
  (env: Environment, deployer?: Deployer): Promise<ContractFactory>;
}

export function makeFactoryGetter(artifact: Artefact): FactoryGetter {
  return function (env: Environment, deployer?: Deployer): Promise<ContractFactory> {
    return env.ethers.getContractFactory(artifact.abi, artifact.bytecode, deployer);
  }
}
