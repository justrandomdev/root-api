/* eslint-disable  @typescript-eslint/no-explicit-any */
import Redis from "ioredis";

interface IKVStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<any>;
  setTtl(key: string, value: string, ttl: number): Promise<any>;
  disconnect(): void;
}

interface ILogger {
  info(message?: any, ...optionalParams: any[]): void;
  debug(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
  trace(message?: any, ...optionalParams: any[]): void;
}

interface IKVFactory {
  createClient(logger: ILogger | Console): any;
}

/**
  Redis options class that is used to configure the Redis client
*/
class RedisOptions {
  public host: string;
  public port: number;
  public password?: string;
  public maxRetriesPerRequest: number;
  public retryTimeout: number;
  public logger: ILogger | Console;

  /**
   * constructor
   * @param {string} host - The Redis server host
   * @param {number} port - The Redis server port
   * @param {string} password - The Redis server password
   * @param {number} maxRetriesPerRequest - The number of connection retries
   * @param {number} retryTimeout - Overall time to retry before giving up
   * @param {ILogger | Console} logger - Any logger that has the same interface as the console object
   */
  constructor(
    host = "redis",
    port = 6379,
    maxRetriesPerRequest = 5,
    retryTimeout = 2000,
    logger: ILogger | Console,
    pass?: string
  ) {
    this.host = host;
    this.port = port;
    this.password = pass;
    this.maxRetriesPerRequest = maxRetriesPerRequest;
    this.retryTimeout = retryTimeout;
    this.logger = logger || console;
  }

  retryStrategy(times: number): boolean | number {
    if (times === this.maxRetriesPerRequest) {
      this.logger.error(
        `Redis maximum retry connection limit of ${times} reached`
      );
      return false;
    } else {
      const delay = Math.min(times * 50, this.retryTimeout);
      return delay;
    }
  }
}

/**
 Cache factory class that is used to create the cache client. Unfortunately Typescript does not support interface's and static methods. 
*/
const KVFactory: IKVFactory = {
  /**
    CreateClient will create and return a configured redis instance
    @param {object} logger - Any logger that has the same interface as the console object
    @returns Redis client
  */
  createClient(logger: ILogger | Console) {
    const options = new RedisOptions(
      process.env.REDIS_HOST,
      process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : undefined,
      process.env.REDIS_MAX_RETRIES
        ? parseInt(process.env.REDIS_MAX_RETRIES)
        : undefined,
      process.env.REDIS_RETRY_TIMEOUT
        ? parseInt(process.env.REDIS_RETRY_TIMEOUT)
        : undefined,
      logger,
      process.env.REDIS_PASS
    );

    const redis = new Redis(options as any);

    //ioredis-mock doesn't support select. Dont select db when running tests
    if (!(redis as any).data) {
      redis.select(process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 2);
    }
    //Add event handlers for logging
    redis.on("connect", () => {
      logger.info(`Redis client connected to ${options.host}:${options.port}`);
    });
    redis.on("error", (err) => {
      logger.info(`Redis client ${err}`);
    });
    redis.on("close", () => {
      logger.info("Redis client connection closed");
    });

    return redis;
  },
};

/**
 The Redis Client is a simple wrapper around the ioredis wrapper that implements a basic KV store interface.
*/
export class RedisClient implements IKVStore {
  private _namespace: string;
  private _ttl: number;
  private _cache: Redis.Redis;

  /**
    constructor
    @param {string} namespace - Namespace is used to make the Redis keys unique. Typically this value would be a service name combined with an environment name.
    @param {number} ttl - The TTL is used to specify how long the stored values will remain in Redis. The TTL is provided in seconds.
    @param {object} logger - Any logger that has the same interface as the console object 
  */
  constructor(namespace: string, ttl: number, logger: ILogger | Console) {
    this._namespace = namespace;
    this._ttl = ttl;
    this._cache = KVFactory.createClient(logger);
  }

  get(key: string): Promise<string | null> {
    const itemKey = this._namespace + "-" + key;
    return this._cache.get(itemKey);
  }

  set(key: string, value: string): Promise<any> {
    const itemKey = this._namespace + "-" + key;
    return this._cache.setex(itemKey, this._ttl, value);
  }

  setTtl(key: string, value: string, ttl: number): Promise<any> {
    const itemKey = this._namespace + "-" + key;
    return this._cache.setex(itemKey, ttl, JSON.stringify(value));
  }

  disconnect(): void {
    this._cache.disconnect();
  }
}
