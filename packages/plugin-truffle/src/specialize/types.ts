import { Deployer } from './truffle';
import { EthereumProvider as Provider } from '@openzeppelin/upgrades-core';

export interface Environment {
  network: { provider: Provider };
  deployer: Deployer;
};

export {
  ContractClass as ContractFactory,
  ContractInstance as ContractInstance,
  Deployer as Deployer,
  // TruffleProvider as Provider,
} from './truffle';

export {
  EthereumProvider as Provider,
} from '@openzeppelin/upgrades-core';
