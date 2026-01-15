declare module "better-sqlite3" {
  interface DatabaseOptions {
    readonly?: boolean;
    fileMustExist?: boolean;
    timeout?: number;
    verbose?: (message: string) => void;
  }

  interface Database {
    readonly name: string;
  }

  interface DatabaseConstructor {
    new (filename: string, options?: DatabaseOptions): Database;
  }

  const Database: DatabaseConstructor;
  export default Database;
}
