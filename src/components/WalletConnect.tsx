import React from 'react';
import { Wallet, ShieldCheck, Power, CircleDot } from 'lucide-react';
import { shortenAddress, formatNight } from '../utils/contract';
import type { WalletState } from '../hooks/useMidnight';

interface WalletConnectProps {
  wallet: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
  isLoading: boolean;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  wallet,
  onConnect,
  onDisconnect,
  isLoading,
}) => {
  if (!wallet.isConnected) {
    return (
      <button
        onClick={onConnect}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/20 transition-all duration-200 active:scale-95 disabled:opacity-50"
      >
        <Wallet className="w-4 h-4" />
        <span>{isLoading ? 'Connecting...' : 'Connect Lace Wallet'}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Network Badge */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
        <CircleDot className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span className="text-slate-300 font-mono">Midnight Preprod</span>
      </div>

      {/* Wallet Balance & Address */}
      <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-inner">
        <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>{formatNight(wallet.balance)} NIGHT</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-700" />
        <span className="text-xs font-mono text-slate-300">
          {shortenAddress(wallet.address, 4)}
        </span>
      </div>

      {/* Disconnect button */}
      <button
        onClick={onDisconnect}
        title="Disconnect Wallet"
        className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 border border-slate-700/60 transition-colors"
      >
        <Power className="w-4 h-4" />
      </button>
    </div>
  );
};
