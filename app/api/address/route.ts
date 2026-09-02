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

function formatNibi(value: string) {
  const wei = BigInt(value);
  const decimals = BigInt('1000000000000000000');
  const whole = wei / decimals;
  const fraction = (wei % decimals)
    .toString()
    .padStart(18, '0')
    .slice(0, 6)
    .replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

export async function POST(request: Request) {
  try {
    const { address } = (await request.json()) as { address?: string };
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return Response.json(
        { message: 'Enter a valid 42-character EVM address.' },
        { status: 400 },
      );
    }

    const [balanceHex, nonceHex, code] = await Promise.all([
      rpc<string>('eth_getBalance', [address, 'latest']),
      rpc<string>('eth_getTransactionCount', [address, 'latest']),
      rpc<string>('eth_getCode', [address, 'latest']),
    ]);

    return Response.json({
      verified: true,
      address,
      balanceNibi: balanceHex ? formatNibi(balanceHex) : '0',
      nonce: nonceHex ? Number.parseInt(nonceHex, 16) : 0,
      accountType: code && code !== '0x' ? 'Smart contract' : 'Wallet',
      bytecodeBytes:
        code && code !== '0x' ? Math.max(0, (code.length - 2) / 2) : 0,
      explorerUrl: `https://testnet.nibiscan.io/address/${address}`,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unable to inspect the address.',
      },
      { status: 502 },
    );
  }
}
