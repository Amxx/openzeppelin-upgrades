import {
  Plugin,
  Options,
} from '../types';

export async function deployImpl<E,D,F,I extends { address: string }>(
  plugin: Plugin<E,D,F,I>,
  env: E,
  factory: F,
  opts: Required<Options<E,D,F,I>>
): Promise<string> {
  // TODO implement checks
  const { address } = await plugin.deployContract(
    opts.deployer,
    factory,
    ...opts.implementation.constructor,
  );
  return address;
}
