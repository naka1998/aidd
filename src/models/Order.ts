import dynamoose from '../config/database';
import { OrderItem, OrderStatus } from '../types';

export interface IOrder {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new dynamoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const orderSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true,
      default: () => {
        const { v4: uuidv4 } = require('uuid');
        return uuidv4();
      },
    },
    userId: {
      type: String,
      required: true,
      index: {
        name: 'UserOrderIndex',
        type: 'global',
      },
    },
    items: {
      type: Array,
      schema: [orderItemSchema],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'pending',
      enum: ['pending', 'confirmed', 'shipped', 'delivered'],
    },
  },
  {
    timestamps: true,
  }
);

export const Order = dynamoose.model('Order', orderSchema);