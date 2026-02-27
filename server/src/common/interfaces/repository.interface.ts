/**
 * Generic Repository Interface
 * Provides a contract for basic CRUD operations
 */
export interface IRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

/**
 * Extended Repository Interface for entities with additional query capabilities
 */
export interface IExtendedRepository<T> extends IRepository<T> {
  findByCondition(condition: Partial<T>): Promise<T[]>;
  findOne(condition: Partial<T>): Promise<T | null>;
}
