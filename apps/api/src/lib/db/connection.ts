import mongoose from 'mongoose';

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnecting: boolean = false;
  private maxRetries: number = 5;
  private retryIntervalMs: number = 5000;
  private retryCount: number = 0;
  private isShutdownRegistered: boolean = false;

  private constructor() {
    this.setupEventListeners();
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  private setupEventListeners(): void {
    mongoose.connection.on('connected', () => {
      console.log('✅ [MongoDB] Connection established successfully.');
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ [MongoDB] Connection disconnected.');
    });

    mongoose.connection.on('error', (err: Error) => {
      console.error('❌ [MongoDB] Connection error:', err.message);
    });

    if (!this.isShutdownRegistered) {
      this.registerGracefulShutdown();
      this.isShutdownRegistered = true;
    }
  }

  private registerGracefulShutdown(): void {
    const handleShutdown = async (signal: string) => {
      console.log(`\n🛑 [MongoDB] Received ${signal}. Closing connection gracefully...`);
      try {
        await mongoose.connection.close();
        console.log('🔒 [MongoDB] Connection closed successfully.');
      } catch (err) {
        console.error('❌ [MongoDB] Error closing connection:', err);
      }
    };

    process.once('SIGINT', () => handleShutdown('SIGINT'));
    process.once('SIGTERM', () => handleShutdown('SIGTERM'));
  }

  /**
   * Connect to MongoDB with exponential / periodic retry logic.
   *
   * @param uri - MongoDB connection string URI
   */
  public async connect(uri?: string): Promise<typeof mongoose> {
    const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/arthora';

    // Return existing connected instance
    if (mongoose.connection.readyState === 1) {
      return mongoose;
    }

    if (this.isConnecting) {
      console.log('⏳ [MongoDB] Connection already in progress, awaiting resolution...');
      return new Promise((resolve, reject) => {
        const check = setInterval(() => {
          if (mongoose.connection.readyState === 1) {
            clearInterval(check);
            resolve(mongoose);
          }
        }, 100);
        setTimeout(() => {
          clearInterval(check);
          reject(new Error('MongoDB connection wait timed out'));
        }, 15000);
      });
    }

    this.isConnecting = true;

    while (this.retryCount < this.maxRetries) {
      try {
        console.log(`🔌 [MongoDB] Connecting to database (Attempt ${this.retryCount + 1}/${this.maxRetries})...`);
        const conn = await mongoose.connect(mongoUri, {
          autoIndex: true,
          serverSelectionTimeoutMS: 5000,
        });
        this.isConnecting = false;
        this.retryCount = 0;
        return conn;
      } catch (error) {
        this.retryCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(
          `❌ [MongoDB] Connection failed (Attempt ${this.retryCount}/${this.maxRetries}): ${errorMessage}`,
        );

        if (this.retryCount >= this.maxRetries) {
          this.isConnecting = false;
          throw new Error(
            `Failed to connect to MongoDB after ${this.maxRetries} attempts. Last error: ${errorMessage}`,
          );
        }

        console.log(`⏱️ [MongoDB] Retrying connection in ${this.retryIntervalMs / 1000}s...`);
        await new Promise((res) => setTimeout(res, this.retryIntervalMs));
      }
    }

    this.isConnecting = false;
    throw new Error('Could not establish MongoDB connection.');
  }

  /**
   * Disconnects from MongoDB.
   */
  public async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }

  /**
   * Returns current ready state of the Mongoose connection.
   */
  public isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

export const dbConnection = DatabaseConnection.getInstance();
export const connectDB = (uri?: string) => dbConnection.connect(uri);
export const disconnectDB = () => dbConnection.disconnect();
export default dbConnection;
