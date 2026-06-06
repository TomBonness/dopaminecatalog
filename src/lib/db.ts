import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";

const hasCredentials =
  Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ||
  Boolean(process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI) ||
  Boolean(process.env.AWS_CONTAINER_CREDENTIALS_FULL_URI) ||
  Boolean(process.env.AWS_ROLE_ARN);

let docClient: DynamoDBDocumentClient | null = null;

if (hasCredentials) {
  try {
    const client = new DynamoDBClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        sessionToken: process.env.AWS_SESSION_TOKEN
      }
    });
    docClient = DynamoDBDocumentClient.from(client);
  } catch (err) {
    console.warn("Failed to initialize DynamoDB client, using local storage fallback mode:", err);
  }
}

export { docClient };
export default docClient;
