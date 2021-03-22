import type { Deployment } from '@openzeppelin/upgrades-core';
import type { ContractFactory, ContractInstance, Deployer } from './types';

export async function deploy(factory: ContractFactory, deployer?: Deployer): Promise<Deployment> {
  const { address, deployTransaction } = await (deployer ? factory.connect(deployer) : factory).deploy();
  const txHash = deployTransaction.hash;
  return { address, txHash };
}

export function attach(factory: ContractFactory, address: string): ContractInstance {
  return factory.attach(address);
}
