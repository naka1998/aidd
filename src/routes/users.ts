import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { validateCreateUser, validateUpdateUserAddress, authenticateToken } from '../middleware/validation';
import { CreateUserRequest, LoginRequest, UpdateUserAddressRequest, ApiResponse } from '../types';

const router = Router();

router.post('/register', validateCreateUser, async (req: Request<object, ApiResponse, CreateUserRequest>, res: Response<ApiResponse>) => {
  try {
    const { email, name, password, address, postalCode } = req.body;

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
      address,
      postalCode,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'ユーザーが正常に登録されました',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        address: user.address,
        postalCode: user.postalCode,
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
          address: user.address,
          postalCode: user.postalCode,
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

router.put('/address', authenticateToken, validateUpdateUserAddress, async (req: Request<object, ApiResponse, UpdateUserAddressRequest>, res: Response<ApiResponse>) => {
  try {
    const { address, postalCode } = req.body;
    const userId = (req as any).userId;

    const user = await User.get(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません',
      });
      return;
    }

    await User.update({ id: userId }, { address, postalCode });

    const updatedUser = await User.get(userId);

    res.json({
      success: true,
      message: '住所と郵便番号を更新しました',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        address: updatedUser.address,
        postalCode: updatedUser.postalCode,
      },
    });
  } catch (error) {
    console.error('User address update error:', error);
    res.status(500).json({
      success: false,
      error: '住所更新中にエラーが発生しました',
    });
  }
});

export default router;