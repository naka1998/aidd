import dynamoose from '../config/database';

export interface IUser {
  id: string;
  email: string;
  name: string;
  password: string;
  address: string;
  postalCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true,
      default: () => {
        const { v4: uuidv4 } = require('uuid');
        return uuidv4();
      },
    },
    email: {
      type: String,
      required: true,
      index: {
        name: 'EmailIndex',
        type: 'global',
      },
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
      validate: (v: string) => /^\d{7}$/.test(v),
    },
  },
  {
    timestamps: true,
  }
);

export const User = dynamoose.model('User', userSchema);