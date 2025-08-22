import dynamoose from '../config/database';

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true,
      default: () => {
        const { v4: uuidv4 } = require('uuid');
        return uuidv4();
      },
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      index: {
        name: 'CategoryIndex',
        type: 'global',
      },
    },
    imageUrl: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = dynamoose.model('Product', productSchema);