import type { Deployment } from '@openzeppelin/upgrades-core';
import type { ContractFactory, ContractInstance } from '../types/index';

export async function deploy(factory: ContractFactory, ...args: unknown[]): Promise<Deployment> {
  const { address, deployTransaction } = await factory.deploy(...args);
  const txHash = deployTransaction.hash;
  return { address, txHash };
}

export function attach(factory: ContractFactory, address: string): ContractInstance {
  return factory.attach(address);
}
