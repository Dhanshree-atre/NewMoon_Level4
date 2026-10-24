import React from 'react';
import {
  Shield,
  Layers,
  KeyRound,
  FileCheck2,
  FileText,
  CircleDot,
} from 'lucide-react';
import { WalletConnect } from './WalletConnect';
import type { WalletState } from '../hooks/useMidnight';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'admin' | 'claim' | 'audit' | 'privacy';
  setActiveTab: (tab: 'admin' | 'claim' | 'audit' | 'privacy') => void;
  wallet: WalletState;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  isLoading: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  wallet,
  onConnectWallet,
  onDisconnectWallet,
  isLoading,
}) => {
  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#070913]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                  MidnightPay
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-semibold">
                  ZK-Payroll
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Confidential On-Chain Compensation Protocol
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Admin Payroll</span>
            </button>

            <button
              onClick={() => setActiveTab('claim')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'claim'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Claim Payout</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'audit'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Audit & Compliance</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'privacy'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Privacy Model</span>
            </button>
          </nav>

          {/* Right: Wallet Connect */}
          <WalletConnect
            wallet={wallet}
            onConnect={onConnectWallet}
            onDisconnect={onDisconnectWallet}
            isLoading={isLoading}
          />
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden px-4 py-2 border-t border-slate-800/80 bg-slate-900/90 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap ${
              activeTab === 'admin' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Admin Payroll
          </button>
          <button
            onClick={() => setActiveTab('claim')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap ${
              activeTab === 'claim' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Claim Payout
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap ${
              activeTab === 'audit' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Audit & Compliance
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap ${
              activeTab === 'privacy' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Privacy Model
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060812] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-400">MidnightPay Protocol</span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-mono text-cyan-400">
              <CircleDot className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
              Preprod Testnet
            </span>
            <span>•</span>
            <span>Midnight Builder Challenge (Rise In)</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Dhanshree-atre/NewMoon_Level4"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub Repo</span>
            </a>
            <span className="text-slate-700">|</span>
            <span className="text-slate-500 font-mono">Compact 0.26 / Runtime 0.19</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
