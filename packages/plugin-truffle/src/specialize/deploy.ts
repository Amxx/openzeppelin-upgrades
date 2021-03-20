import type { Deployment } from '@openzeppelin/upgrades-core';
import type { ContractFactory, ContractInstance, Deployer } from './types';

export async function deploy(deployer: Deployer, contract: ContractClass, ...args: unknown[]): Promise<Deployment> {
  const { address, transactionHash: txHash } = await deployer.deploy(contract, ...args);
  if (txHash === undefined) {
    throw new Error('Transaction hash is undefined');
  }
  return { address, txHash };
}

export function attach(factory: ContractFactory, address: string): ContractInstance {
  return new factory(address);
}
