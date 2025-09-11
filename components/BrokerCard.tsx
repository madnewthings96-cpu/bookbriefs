import React from 'react';
import { Broker } from '../types';

interface BrokerCardProps {
  broker: Broker;
}

const BrokerCard: React.FC<BrokerCardProps> = ({ broker }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col justify-between p-4 h-full">
      <div className="flex justify-center items-center h-20 mb-4 bg-gray-50 rounded-md p-2">
          <img src={broker.logoUrl} alt={`${broker.name} logo`} className="max-h-full max-w-full object-contain" />
      </div>
      <div className="text-sm space-y-2 mb-4 flex-grow">
        <div className="flex justify-between">
          <span className="text-gray-500">Min. Deposit:</span>
          <span className="font-semibold text-gray-800">${broker.minDeposit}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Commission:</span>
          <span className="font-semibold text-gray-800">{typeof broker.commission === 'number' ? `$${broker.commission.toFixed(2)}` : broker.commission}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">EUR/USD Spread:</span>
          <span className="font-bold text-gray-800 bg-gray-200 px-2 py-0.5 rounded text-xs">{broker.eurUsdSpread.toFixed(1)}</span>
        </div>
      </div>
      <a
        href={broker.liveAccountUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-emerald-500 text-white text-center font-bold py-2 px-4 rounded-md hover:bg-emerald-600 transition-colors duration-300"
      >
        Open Live Account
      </a>
    </div>
  );
};

export default BrokerCard;
