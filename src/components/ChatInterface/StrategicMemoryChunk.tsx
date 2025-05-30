import React from 'react';
import { StrategicMemoryChunk } from '../../services/StrategicMemoryChunk';

interface StrategicMemoryChunkProps {
  chunk: StrategicMemoryChunk;
}

const StrategicMemoryChunkComponent: React.FC<StrategicMemoryChunkProps> = ({ chunk }) => {
  return (
    <div className="strategic-memory-chunk p-2 border border-base-content/20 rounded">
      <p className="text-sm text-base-content/70">
        {new Date(chunk.timestamp).toLocaleString()}: {chunk.content}
      </p>
    </div>
  );
};

export default StrategicMemoryChunkComponent;