import type { Deployment } from '@openzeppelin/upgrades-core';
import type { ContractFactory, ContractInstance, Deployer } from '../types/index';

export async function deploy(factory: ContractFactory, deployer: Deployer): Promise<Deployment> {
  const { address, transactionHash: txHash } = await deployer.deploy(factory);
  if (txHash === undefined) {
    throw new Error('Transaction hash is undefined');
  }
  return { address, txHash };
}

export function attach(factory: ContractFactory, address: string): ContractInstance {
  return new factory(address);
}
