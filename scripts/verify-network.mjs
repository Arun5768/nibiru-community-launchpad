import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const RPC_URL = 'https://evm-rpc.testnet-2.nibiru.fi';
const outputArg = process.argv.indexOf('--output');
const outputPath = outputArg >= 0 ? process.argv[outputArg + 1] : null;

async function rpc(method, params = []) {
  const startedAt = Date.now();
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: method, method, params }),
  });
  if (!response.ok)
    throw new Error(`${method} returned HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error(`${method}: ${payload.error.message}`);
  return { result: payload.result, latencyMs: Date.now() - startedAt };
}

const checkedAt = new Date().toISOString();
const [chainId, blockNumber, clientVersion, gasPrice] = await Promise.all([
  rpc('eth_chainId'),
  rpc('eth_blockNumber'),
  rpc('web3_clientVersion'),
  rpc('eth_gasPrice'),
]);

const evidence = {
  schema: 'nibiru-community-launchpad/network-check@1',
  checkedAt,
  endpoint: RPC_URL,
  assertions: {
    endpointResponded: true,
    chainIdMatchesTestnet2: Number.parseInt(chainId.result, 16) === 6911,
    blockNumberIsPositive: Number.parseInt(blockNumber.result, 16) > 0,
  },
  observed: {
    chainId: Number.parseInt(chainId.result, 16),
    latestBlock: Number.parseInt(blockNumber.result, 16),
    clientVersion: clientVersion.result,
    gasPriceGwei: Number(BigInt(gasPrice.result)) / 1_000_000_000,
    latencyMs: {
      chainId: chainId.latencyMs,
      blockNumber: blockNumber.latencyMs,
      clientVersion: clientVersion.latencyMs,
      gasPrice: gasPrice.latencyMs,
    },
  },
};

if (!Object.values(evidence.assertions).every(Boolean)) {
  console.error(JSON.stringify(evidence, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(evidence, null, 2));
}

if (outputPath) {
  const absolute = resolve(outputPath);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
}
