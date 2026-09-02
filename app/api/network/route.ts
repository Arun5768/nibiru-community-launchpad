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
      rpcUrl: RPC_URL,
      chainName: 'nibiru-testnet-2',
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

    const [transaction, receipt, latestBlockHex] = await Promise.all([
      rpc<Record<string, string> | null>('eth_getTransactionByHash', [
        transactionHash,
      ]),
      rpc<Record<string, unknown> | null>('eth_getTransactionReceipt', [
        transactionHash,
      ]),
      rpc<string>('eth_blockNumber'),
    ]);
    if (!transaction) {
      return Response.json({
        found: false,
        state: 'not_found',
        diagnosis: 'This hash is not currently visible on Nibiru Testnet 2.',
        nextSteps: [
          'Confirm the wallet was connected to chain ID 6911.',
          'Check that the transaction was broadcast and copy the hash again.',
          'If it was just sent, wait briefly and retry.',
        ],
        explorerUrl: `https://testnet.nibiscan.io/tx/${transactionHash}`,
      });
    }

    const blockNumber = transaction.blockNumber
      ? Number.parseInt(transaction.blockNumber, 16)
      : null;
    const latestBlock = latestBlockHex
      ? Number.parseInt(latestBlockHex, 16)
      : (blockNumber ?? 0);
    const rawReceiptStatus = receipt?.status;
    const receiptStatus =
      typeof rawReceiptStatus === 'string'
        ? Number.parseInt(rawReceiptStatus, 16)
        : null;
    const state =
      !receipt || blockNumber === null
        ? 'pending'
        : receiptStatus === 1
          ? 'success'
          : 'reverted';
    const gasUsed =
      typeof receipt?.gasUsed === 'string' ? BigInt(receipt.gasUsed) : null;
    const effectiveGasPrice =
      typeof receipt?.effectiveGasPrice === 'string'
        ? BigInt(receipt.effectiveGasPrice)
        : transaction.gasPrice
          ? BigInt(transaction.gasPrice)
          : null;
    const formatUnit = (value: bigint, decimals = 18, precision = 8) => {
      const base = BigInt(10) ** BigInt(decimals);
      const whole = value / base;
      const fraction = (value % base)
        .toString()
        .padStart(decimals, '0')
        .slice(0, precision)
        .replace(/0+$/, '');
      return fraction ? `${whole}.${fraction}` : whole.toString();
    };
    const diagnosis =
      state === 'success'
        ? 'The transaction completed successfully on Nibiru Testnet 2.'
        : state === 'pending'
          ? 'The transaction is visible but has not been included in a block yet.'
          : 'The transaction was included, but contract execution reverted.';
    const nextSteps =
      state === 'success'
        ? [
            'Confirm the resulting state in the explorer or your application.',
            'Keep the hash as reproducible evidence.',
          ]
        : state === 'pending'
          ? [
              'Check for an earlier pending nonce from the same wallet.',
              'Wait for inclusion before attempting the same action again.',
            ]
          : [
              'Confirm the contract address, function, and public inputs.',
              'Capture the exact UI or RPC error and reproduce on Testnet 2.',
              'Use a trace-capable tool or contract tests for the exact revert cause.',
            ];

    return Response.json({
      found: true,
      state,
      diagnosis,
      nextSteps,
      explorerUrl: `https://testnet.nibiscan.io/tx/${transactionHash}`,
      transaction: {
        hash: transaction.hash,
        from: transaction.from,
        to: transaction.to || null,
        blockNumber,
        confirmations:
          blockNumber === null ? 0 : Math.max(0, latestBlock - blockNumber + 1),
        valueNibi: transaction.value
          ? formatUnit(BigInt(transaction.value))
          : '0',
        gasLimit: transaction.gas ? Number.parseInt(transaction.gas, 16) : null,
        gasUsed: gasUsed === null ? null : Number(gasUsed),
        effectiveGasPriceGwei:
          effectiveGasPrice === null
            ? null
            : formatUnit(effectiveGasPrice, 9, 6),
        transactionCostNibi:
          gasUsed !== null && effectiveGasPrice !== null
            ? formatUnit(gasUsed * effectiveGasPrice)
            : null,
        logsCount: Array.isArray(receipt?.logs) ? receipt.logs.length : 0,
        contractAddress:
          typeof receipt?.contractAddress === 'string'
            ? receipt.contractAddress
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
