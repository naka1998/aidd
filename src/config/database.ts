import dynamoose from 'dynamoose';
import { config } from 'dotenv';

config();

const isDevelopment = process.env.NODE_ENV !== 'production';

// For local development, use DynamoDB Local if configured
if (isDevelopment && process.env.DYNAMODB_ENDPOINT) {
  dynamoose.aws.ddb.local(process.env.DYNAMODB_ENDPOINT);
}

// Configure AWS settings if not using local DynamoDB
if (!isDevelopment || !process.env.DYNAMODB_ENDPOINT) {
  const awsConfig: any = {
    region: process.env.AWS_REGION || 'us-east-1',
  };
  
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    awsConfig.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    awsConfig.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  }
  
  dynamoose.aws.ddb.set(awsConfig);
}

export default dynamoose;