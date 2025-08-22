import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';
import { validateCreateProduct } from '../middleware/validation';
import { CreateProductRequest, ApiResponse } from '../types';

const router = Router();

router.get('/', async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { category, limit = '20', offset = '0' } = req.query;

    let query: any = Product.scan();
    
    if (category && typeof category === 'string') {
      query = Product.query('category').eq(category);
    }

    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    if (limitNum > 0) {
      query = query.limit(limitNum);
    }

    if (offsetNum > 0) {
      query = query.startAt({ id: offsetNum.toString() });
    }

    const products = await query.exec();

    res.json({
      success: true,
      data: products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        imageUrl: product.imageUrl,
        createdAt: product.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: '商品の取得中にエラーが発生しました',
    });
  }
});

router.get('/:id', async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: '商品IDが必要です',
      });
      return;
    }

    const product = await Product.get(id) as any;

    if (!product) {
      res.status(404).json({
        success: false,
        error: '商品が見つかりません',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        imageUrl: product.imageUrl,
        createdAt: product.createdAt,
      },
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: '商品の取得中にエラーが発生しました',
    });
  }
});

router.post('/', validateCreateProduct, async (req: Request<object, ApiResponse, CreateProductRequest>, res: Response<ApiResponse>) => {
  try {
    const { name, description, price, stock, category, imageUrl } = req.body;

    const product = new Product({
      name,
      description,
      price,
      stock,
      category,
      imageUrl,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: '商品が正常に作成されました',
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        imageUrl: product.imageUrl,
        createdAt: product.createdAt,
      },
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: '商品の作成中にエラーが発生しました',
    });
  }
});

router.put('/:id', validateCreateProduct, async (req: Request<{ id: string }, ApiResponse, CreateProductRequest>, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category, imageUrl } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: '商品IDが必要です',
      });
      return;
    }

    const product = await Product.get(id) as any;

    if (!product) {
      res.status(404).json({
        success: false,
        error: '商品が見つかりません',
      });
      return;
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.stock = stock;
    product.category = category;
    if (imageUrl !== undefined) {
      product.imageUrl = imageUrl;
    }

    await product.save();

    res.json({
      success: true,
      message: '商品が正常に更新されました',
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        imageUrl: product.imageUrl,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: '商品の更新中にエラーが発生しました',
    });
  }
});

router.delete('/:id', async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: '商品IDが必要です',
      });
      return;
    }

    const product = await Product.get(id) as any;

    if (!product) {
      res.status(404).json({
        success: false,
        error: '商品が見つかりません',
      });
      return;
    }

    await product.delete();

    res.json({
      success: true,
      message: '商品が正常に削除されました',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: '商品の削除中にエラーが発生しました',
    });
  }
});

export default router;