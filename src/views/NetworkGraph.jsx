import React from 'react';

export default function NetworkGraph() {
  return (
    <div className="p-8 flex flex-col items-center justify-center h-full text-center">
      <div className="relative w-40 h-40 mb-6">
        {/* Pulsing circle animation placeholder */}
        <div className="absolute inset-0 rounded-full bg-finagler-accent/10 animate-ping"></div>
        <div className="absolute inset-0 rounded-full bg-finagler-harmony/20 blur-lg"></div>
        <div className="relative w-40 h-40 rounded-full border-2 border-finagler-accent flex items-center justify-center text-finagler-glow">
          <span className="text-lg font-semibold tracking-widest">Graph</span>
        </div>
      </div>

      <h1 className="text-2xl font-light text-finagler-glow mb-2">
        Network Graph (Coming Soon)
      </h1>
      <p className="text-slate-400 max-w-md">
        Visualization of domain relationships, consent flows, and trust paths will appear here
        in <span className="text-finagler-harmony">v0.3</span>.  
        The console’s awareness field is preparing to map the living structure of DIS.
      </p>
    </div>
  );
}
