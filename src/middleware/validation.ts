import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../types';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'アクセストークンが必要です',
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({
      success: false,
      error: 'サーバー設定エラー',
    });
    return;
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      res.status(403).json({
        success: false,
        error: '無効なトークンです',
      });
      return;
    }

    const payload = decoded as { userId: string };
    req.userId = payload.userId;
    next();
  });
};

export const validateCreateUser = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    res.status(400).json({
      success: false,
      error: 'メール、名前、パスワードは必須です',
    });
    return;
  }

  if (!validateEmail(email)) {
    res.status(400).json({
      success: false,
      error: '有効なメールアドレスを入力してください',
    });
    return;
  }

  if (!validatePassword(password)) {
    res.status(400).json({
      success: false,
      error: 'パスワードは6文字以上である必要があります',
    });
    return;
  }

  next();
};

export const validateCreateProduct = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  const { name, description, price, stock, category } = req.body;

  if (!name || !description || price === undefined || stock === undefined || !category) {
    res.status(400).json({
      success: false,
      error: '商品名、説明、価格、在庫、カテゴリーは必須です',
    });
    return;
  }

  if (typeof price !== 'number' || price <= 0) {
    res.status(400).json({
      success: false,
      error: '価格は正の数値である必要があります',
    });
    return;
  }

  if (typeof stock !== 'number' || stock < 0) {
    res.status(400).json({
      success: false,
      error: '在庫は0以上の数値である必要があります',
    });
    return;
  }

  next();
};