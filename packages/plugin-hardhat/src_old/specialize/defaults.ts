import { Environment, Deployer, Provider } from './types';

export function getDefaultDeployer(env?: Environment): Deployer {
  throw new Error('Could not retreive default signer for hardhat environment');
}

export function getDefaultProvider(env?: Environment): Provider {
  throw new Error('Could not retreive default signer for hardhat environment');
}
