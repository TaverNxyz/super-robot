import { useState, useEffect } from 'react';
import { Check, Clock, Copy, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { toast } from './ui/use-toast';
import { CRYPTO_DETAILS, CryptoType } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface TransactionTrackerProps {
  address: string;
  amount: number;
  cryptoType: CryptoType;
}

const TransactionTracker = ({ address, amount, cryptoType }: TransactionTrackerProps) => {
  const [progress, setProgress] = useState(0);
  const [confirmations, setConfirmations] = useState(0);
  const [status, setStatus] = useState<'pending' | 'confirming' | 'completed'>('pending');

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          setStatus('completed');
          return 100;
        }
        const newProgress = oldProgress + 10;
        if (newProgress === 60) {
          setStatus('confirming');
          setConfirmations(Math.floor(CRYPTO_DETAILS[cryptoType].confirmations / 2));
        }
        if (newProgress === 80) {
          setConfirmations(CRYPTO_DETAILS[cryptoType].confirmations);
        }
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cryptoType]);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address copied",
      description: "The payment address has been copied to your clipboard"
    });
  };

  return (
    <div className="space-y-6 p-6 bg-[#0A0A0A] rounded-lg border border-[#222] animate-fade-in">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{CRYPTO_DETAILS[cryptoType].icon}</span>
          <h3 className="text-lg font-semibold text-white">
            {CRYPTO_DETAILS[cryptoType].name} Payment
          </h3>
        </div>
        <p className="text-sm text-gray-400">
          Send exactly {amount} {cryptoType} to the address below
        </p>
      </div>

      <div className="flex items-center justify-between p-3 bg-[#111] rounded-lg group hover:bg-[#151515] transition-colors">
        <code className="text-sm text-[#1EAEDB] break-all">{address}</code>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyAddress}
          className="text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Transaction Status</span>
          <span className="text-white">
            {status === 'pending' && 'Waiting for payment'}
            {status === 'confirming' && `${confirmations}/${CRYPTO_DETAILS[cryptoType].confirmations} confirmations`}
            {status === 'completed' && 'Payment completed'}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex items-center gap-2 text-sm">
        {status === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
        {status === 'confirming' && <Clock className="h-4 w-4 text-blue-500 animate-spin" />}
        {status === 'completed' && <Check className="h-4 w-4 text-green-500" />}
        <span className={cn(
          "text-gray-400",
          status === 'confirming' && "animate-pulse"
        )}>
          {status === 'pending' && 'Awaiting payment...'}
          {status === 'confirming' && 'Confirming on blockchain...'}
          {status === 'completed' && 'Transaction confirmed!'}
        </span>
      </div>

      <Button
        variant="outline"
        className="w-full"
        asChild
      >
        <a 
          href={CRYPTO_DETAILS[cryptoType].explorer}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          View on {CRYPTO_DETAILS[cryptoType].name} Explorer
        </a>
      </Button>
    </div>
  );
};

export default TransactionTracker;