import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '../config/env';
import { authenticateSocket, AuthenticatedSocket } from './auth';
import { attachRedisAdapter } from './redis-adapter';
import { RoomManager } from './rooms';
import { registerChatHandlers } from './handlers/chat.handler';
import { setWebSocketBroadcaster } from '../modules/conversations/service';
import { createModuleLogger } from '../config/logger';

const log = createModuleLogger('ws-server');

let ioInstance: SocketIOServer | null = null;

export function setupWebSocketServer(httpServer: HttpServer): SocketIOServer {
  const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  // Attach Redis pub/sub adapter for horizontal multi-node fan-out
  attachRedisAdapter(io);

  // Authenticate socket handshake using JWT
  io.use(authenticateSocket);

  // Hook up server-to-room broadcaster for domain services
  setWebSocketBroadcaster((room: string, event: string, payload: any) => {
    io.to(room).emit(event, payload);
  });

  io.on('connection', async (rawSocket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const { userId, role } = socket.data.user;

    log.info({ userId, role, socketId: socket.id }, 'WebSocket client connected');

    // Auto-join personal and staff rooms
    await RoomManager.joinDefaultRooms(socket);

    // Register event handlers
    registerChatHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      log.info({ userId, socketId: socket.id, reason }, 'WebSocket client disconnected');
    });
  });

  ioInstance = io;
  log.info('WebSocket Server successfully initialized');
  return io;
}

export function getWebSocketServer(): SocketIOServer | null {
  return ioInstance;
}
