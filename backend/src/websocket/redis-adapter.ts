import { createAdapter } from '@socket.io/redis-adapter';
import { createRedisClient } from '../config/redis';
import { Server } from 'socket.io';
import { createModuleLogger } from '../config/logger';

const log = createModuleLogger('ws-redis-adapter');

export function attachRedisAdapter(io: Server): void {
  if (process.env.NODE_ENV === 'development') {
    log.info('Running without Redis adapter in dev mode');
    return;
  }
  
  try {
    const pubClient = createRedisClient();
    const subClient = pubClient.duplicate();

    io.adapter(createAdapter(pubClient, subClient));
    log.info('Socket.io Redis adapter successfully attached for horizontal multi-node scaling');
  } catch (err: any) {
    log.error({ err: err.message }, 'Failed to attach Socket.io Redis adapter — falling back to in-memory');
  }
}
