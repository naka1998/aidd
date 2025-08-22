import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { validateCreateUser } from '../middleware/validation';
import { CreateUserRequest, LoginRequest, ApiResponse } from '../types';

const router = Router();

router.post('/register', validateCreateUser, async (req: Request<object, ApiResponse, CreateUserRequest>, res: Response<ApiResponse>) => {
  try {
    const { email, name, password } = req.body;

    const existingUser = await User.query('email').eq(email).exec();
    if (existingUser.length > 0) {
      res.status(400).json({
        success: false,
        error: 'このメールアドレスは既に使用されています',
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      name,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'ユーザーが正常に登録されました',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('User registration error:', error);
    res.status(500).json({
      success: false,
      error: 'ユーザー登録中にエラーが発生しました',
    });
  }
});

router.post('/login', async (req: Request<object, ApiResponse, LoginRequest>, res: Response<ApiResponse>) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'メールアドレスとパスワードは必須です',
      });
      return;
    }

    const users = await User.query('email').eq(email).exec();
    if (users.length === 0) {
      res.status(401).json({
        success: false,
        error: 'メールアドレスまたはパスワードが正しくありません',
      });
      return;
    }

    const user = users[0] as any;
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'メールアドレスまたはパスワードが正しくありません',
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

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '24h' });

    res.json({
      success: true,
      message: 'ログインに成功しました',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({
      success: false,
      error: 'ログイン中にエラーが発生しました',
    });
  }
});

export default router;