import { Request, Response, NextFunction } from 'express';
import { authService, AuthService } from './auth.service';
import { sendCreated, sendSuccess, sendNoContent } from '../../common/responses';
import { AuditService } from '../audit';
import { authResponsePresenter, userPresenter } from './auth.presenter';
import {
  RegisterInput,
  LoginInput,
  RefreshInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ConfirmEmailVerificationInput,
  UpdateProfileInput,
} from './auth.validation';

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as RegisterInput;
      const context = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        requestId: req.id ? String(req.id) : undefined,
      };

      const { authData } = await this.service.register(input, context);

      sendCreated(res, authResponsePresenter(authData));
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as LoginInput;
      const context = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        requestId: req.id ? String(req.id) : undefined,
      };

      const result = await this.service.login(input, context);

      sendSuccess(res, authResponsePresenter(result));
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body as RefreshInput;
      const context = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        requestId: req.id ? String(req.id) : undefined,
      };

      const tokens = await this.service.refresh(refreshToken, context);

      sendSuccess(res, tokens);
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.body?.refreshToken as string | undefined;
      const sessionId = req.user?.sessionId;
      const context = {
        actorId: req.user?.userId,
        actorRole: req.user?.role,
        requestId: req.id ? String(req.id) : undefined,
        ipAddress: req.ip,
      };

      await this.service.logout(refreshToken, sessionId, context);

      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body as ForgotPasswordInput;
      const context = {
        ipAddress: req.ip,
        requestId: req.id ? String(req.id) : undefined,
      };

      await this.service.forgotPassword(email, context);

      // Always return 204 No Content to not disclose whether email exists
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = req.body as ResetPasswordInput;
      const context = {
        ipAddress: req.ip,
        requestId: req.id ? String(req.id) : undefined,
      };

      await this.service.resetPassword(input, context);

      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  sendEmailVerification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const context = {
        ipAddress: req.ip,
        requestId: req.id ? String(req.id) : undefined,
      };

      await this.service.sendEmailVerification(userId, context);

      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  confirmEmailVerification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, code } = req.body as ConfirmEmailVerificationInput;
      const context = {
        ipAddress: req.ip,
        requestId: req.id ? String(req.id) : undefined,
      };

      await this.service.confirmEmailVerification(email, code, context);

      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  };

  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const me = await this.service.getMe(userId);

      sendSuccess(res, userPresenter(me));
    } catch (err) {
      next(err);
    }
  };

  updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const input = req.body as UpdateProfileInput;
      const context = AuditService.contextFromRequest(req);

      const updated = await this.service.updateMe(userId, input, context);

      sendSuccess(res, userPresenter(updated));
    } catch (err) {
      next(err);
    }
  };
}

export const authController = new AuthController();
