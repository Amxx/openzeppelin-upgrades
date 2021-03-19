import type { Deployment } from '@openzeppelin/upgrades-core';
import type { ContractFactory, ContractInstance } from '../types/index';

export async function deploy(factory: ContractFactory): Promise<Deployment> {
  const { address, deployTransaction } = await factory.deploy();
  const txHash = deployTransaction.hash;
  return { address, txHash };
}

export function attach(factory: ContractFactory, address: string): ContractInstance {
  return factory.attach(address);
}
