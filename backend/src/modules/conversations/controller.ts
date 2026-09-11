import { Request, Response, NextFunction } from 'express';
import { conversationService, ConversationService } from './service';
import { sendCreated, sendSuccess, sendCollection, sendNoContent } from '../../common/responses';
import { AuditService } from '../audit';
import { UserRole } from '@prisma/client';
import {
  CreateConversationInput,
  ListInboxQuery,
  SendMessageInput,
  AssignConversationInput,
  EmergencyActionInput,
  ListMessagesQuery,
} from './schemas';

export class ConversationController {
  constructor(private readonly service: ConversationService = conversationService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const travelerId = req.user!.userId;
      const input = req.body as CreateConversationInput;
      const context = AuditService.contextFromRequest(req);

      const conversation = await this.service.createConversation(travelerId, input, context);

      sendCreated(res, conversation);
    } catch (err) {
      next(err);
    }
  };

  getMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const travelerId = req.user!.userId;
      const query = req.query as unknown as ListInboxQuery;

      const result = await this.service.getMine(travelerId, query);

      sendCollection(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  getInbox = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conciergeId = req.user!.userId;
      const query = req.query as unknown as ListInboxQuery;

      const result = await this.service.getInbox(conciergeId, query);

      sendCollection(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role as UserRole;
      const { id } = req.params;

      const conversation = await this.service.getConversationById(userId, userRole, id);

      sendSuccess(res, conversation);
    } catch (err) {
      next(err);
    }
  };

  claim = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conciergeId = req.user!.userId;
      const { id } = req.params;
      const context = AuditService.contextFromRequest(req);

      const claimed = await this.service.claimConversation(conciergeId, id, context);

      sendSuccess(res, claimed);
    } catch (err) {
      next(err);
    }
  };

  release = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conciergeId = req.user!.userId;
      const { id } = req.params;
      const context = AuditService.contextFromRequest(req);

      const released = await this.service.releaseConversation(conciergeId, id, context);

      sendSuccess(res, released);
    } catch (err) {
      next(err);
    }
  };

  adminReassign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = req.user!.userId;
      const { id } = req.params;
      const { conciergeId } = req.body as AssignConversationInput;
      const context = AuditService.contextFromRequest(req);

      const reassigned = await this.service.adminReassign(
        adminId,
        id,
        conciergeId || null,
        context,
      );

      sendSuccess(res, reassigned);
    } catch (err) {
      next(err);
    }
  };

  flagEmergency = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorId = req.user!.userId;
      const actorRole = req.user!.role as UserRole;
      const { id } = req.params;
      const { notes } = req.body as EmergencyActionInput;
      const context = AuditService.contextFromRequest(req);

      const updated = await this.service.flagEmergency(actorId, actorRole, id, notes, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  resolveEmergency = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorId = req.user!.userId;
      const actorRole = req.user!.role as UserRole;
      const { id } = req.params;
      const { notes } = req.body as EmergencyActionInput;
      const context = AuditService.contextFromRequest(req);

      const updated = await this.service.resolveEmergency(actorId, actorRole, id, notes, context);

      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  };

  // ── Messages Handlers ─────────────────────────────────

  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const senderId = req.user!.userId;
      const senderRole = req.user!.role as UserRole;
      const { id } = req.params;
      const input = req.body as SendMessageInput;
      const context = AuditService.contextFromRequest(req);

      const message = await this.service.sendMessage(
        senderId,
        senderRole,
        id,
        input,
        context,
      );

      sendCreated(res, message);
    } catch (err) {
      next(err);
    }
  };

  listMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role as UserRole;
      const { id } = req.params;
      const query = req.query as unknown as ListMessagesQuery;

      const result = await this.service.listMessages(userId, userRole, id, query);

      sendCollection(res, result.data, result.pagination);
    } catch (err) {
      next(err);
    }
  };

  markRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      await this.service.markRead(userId, id);

      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };
}

export const conversationController = new ConversationController();
