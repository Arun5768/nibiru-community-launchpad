const RPC_URL = 'https://evm-rpc.testnet-2.nibiru.fi';

type RpcResponse<T> = {
  result?: T;
  error?: { message?: string };
};

async function rpc<T>(method: string, params: unknown[] = []) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`RPC returned ${response.status}`);
  const payload = (await response.json()) as RpcResponse<T>;
  if (payload.error)
    throw new Error(payload.error.message || 'RPC request failed');
  return payload.result;
}

export async function GET() {
  const startedAt = Date.now();

  try {
    const [chainIdHex, blockHex, client, gasPriceHex, syncing] =
      await Promise.all([
        rpc<string>('eth_chainId'),
        rpc<string>('eth_blockNumber'),
        rpc<string>('web3_clientVersion'),
        rpc<string>('eth_gasPrice'),
        rpc<boolean | Record<string, string>>('eth_syncing'),
      ]);

    const latestBlock = blockHex ? Number.parseInt(blockHex, 16) : null;
    const block =
      latestBlock === null
        ? null
        : await rpc<{ timestamp?: string }>('eth_getBlockByNumber', [
            blockHex,
            false,
          ]);
    const blockTimestamp = block?.timestamp
      ? Number.parseInt(block.timestamp, 16)
      : null;
    const gasPriceGwei = gasPriceHex
      ? Number(BigInt(gasPriceHex)) / 1_000_000_000
      : null;

    return Response.json({
      online: true,
      chainId: chainIdHex ? Number.parseInt(chainIdHex, 16) : null,
      expectedChainId: 6911,
      networkVerified: chainIdHex
        ? Number.parseInt(chainIdHex, 16) === 6911
        : false,
      latestBlock,
      blockAgeSeconds: blockTimestamp
        ? Math.max(0, Math.round(Date.now() / 1000 - blockTimestamp))
        : null,
      client: client || 'Nibiru EVM',
      gasPriceGwei,
      syncing: syncing !== false,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        online: false,
        message:
          error instanceof Error
            ? error.message
            : 'Unable to reach the testnet',
        checkedAt: new Date().toISOString(),
      },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { transactionHash } = (await request.json()) as {
      transactionHash?: string;
    };
    if (!transactionHash || !/^0x[a-fA-F0-9]{64}$/.test(transactionHash)) {
      return Response.json(
        { message: 'Enter a valid 66-character transaction hash.' },
        { status: 400 },
      );
    }

    const transaction = await rpc<Record<string, string> | null>(
      'eth_getTransactionByHash',
      [transactionHash],
    );
    if (!transaction) {
      return Response.json({
        found: false,
        message: 'No transaction was found on Nibiru Testnet 2.',
      });
    }

    return Response.json({
      found: true,
      transaction: {
        hash: transaction.hash,
        from: transaction.from,
        to: transaction.to,
        blockNumber: transaction.blockNumber
          ? Number.parseInt(transaction.blockNumber, 16)
          : null,
      },
    });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unable to verify the transaction.',
      },
      { status: 502 },
    );
  }
}
