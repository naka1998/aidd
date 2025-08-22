import { Router, Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { authenticateToken, AuthenticatedRequest } from '../middleware/validation';
import { CreateOrderRequest, ApiResponse } from '../types';

const router = Router();

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  try {
    const { items }: CreateOrderRequest = req.body;
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ユーザー認証が必要です',
      });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        error: '注文アイテムが必要です',
      });
      return;
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        res.status(400).json({
          success: false,
          error: '無効な注文アイテムです',
        });
        return;
      }

      const product = await Product.get(item.productId) as any;
      if (!product) {
        res.status(404).json({
          success: false,
          error: `商品ID ${item.productId} が見つかりません`,
        });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          error: `商品 "${product.name}" の在庫が不足しています`,
        });
        return;
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const order = new Order({
      userId,
      items: validatedItems,
      totalAmount,
      status: 'pending',
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: '注文が正常に作成されました',
      data: {
        id: order.id,
        userId: order.userId,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: '注文の作成中にエラーが発生しました',
    });
  }
});

router.get('/user/:userId', authenticateToken, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  try {
    const { userId } = req.params;
    const requestUserId = req.userId;
    if (!requestUserId) {
      res.status(401).json({
        success: false,
        error: 'ユーザー認証が必要です',
      });
      return;
    }

    if (userId !== requestUserId) {
      res.status(403).json({
        success: false,
        error: '他のユーザーの注文にはアクセスできません',
      });
      return;
    }

    const orders = await Order.query('userId').eq(userId).exec() as any;

    res.json({
      success: true,
      data: orders.map((order: any) => ({
        id: order.id,
        userId: order.userId,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      error: '注文履歴の取得中にエラーが発生しました',
    });
  }
});

router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ユーザー認証が必要です',
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        error: '注文IDが必要です',
      });
      return;
    }

    const order = await Order.get(id) as any;

    if (!order) {
      res.status(404).json({
        success: false,
        error: '注文が見つかりません',
      });
      return;
    }

    if (order.userId !== userId) {
      res.status(403).json({
        success: false,
        error: '他のユーザーの注文にはアクセスできません',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: order.id,
        userId: order.userId,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: '注文の取得中にエラーが発生しました',
    });
  }
});

router.patch('/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'ユーザー認証が必要です',
      });
      return;
    }

    if (!['pending', 'confirmed', 'shipped', 'delivered'].includes(status)) {
      res.status(400).json({
        success: false,
        error: '無効なステータスです',
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        error: '注文IDが必要です',
      });
      return;
    }

    const order = await Order.get(id) as any;

    if (!order) {
      res.status(404).json({
        success: false,
        error: '注文が見つかりません',
      });
      return;
    }

    if (order.userId !== userId) {
      res.status(403).json({
        success: false,
        error: '他のユーザーの注文は更新できません',
      });
      return;
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: '注文ステータスが正常に更新されました',
      data: {
        id: order.id,
        status: order.status,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: '注文ステータスの更新中にエラーが発生しました',
    });
  }
});

export default router;