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

export const validatePostalCode = (postalCode: string): boolean => {
  const postalCodeRegex = /^\d{7}$/;
  return postalCodeRegex.test(postalCode);
};

export const validateAddress = (address: string): boolean => {
  return address.trim().length > 0 && address.length <= 255;
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
  const { email, name, password, address, postalCode } = req.body;

  if (!email || !name || !password || !address || !postalCode) {
    res.status(400).json({
      success: false,
      error: 'メール、名前、パスワード、住所、郵便番号は必須です',
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

  if (!validateAddress(address)) {
    res.status(400).json({
      success: false,
      error: '住所は必須で、255文字以内で入力してください',
    });
    return;
  }

  if (!validatePostalCode(postalCode)) {
    res.status(400).json({
      success: false,
      error: '郵便番号は7桁の数字で入力してください',
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

export const validateUpdateUserAddress = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  const { address, postalCode } = req.body;

  if (!address || !postalCode) {
    res.status(400).json({
      success: false,
      error: '住所と郵便番号は必須です',
    });
    return;
  }

  if (!validateAddress(address)) {
    res.status(400).json({
      success: false,
      error: '住所は必須で、255文字以内で入力してください',
    });
    return;
  }

  if (!validatePostalCode(postalCode)) {
    res.status(400).json({
      success: false,
      error: '郵便番号は7桁の数字で入力してください',
    });
    return;
  }

  next();
};