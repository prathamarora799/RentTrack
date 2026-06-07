import mongoose from 'mongoose'

// Singleton Pattern — only one database connection is allowed
class Database {
  private static instance: Database
  private isConnected: boolean = false

  // Private so no one can do new Database() outside this class
  private constructor() {}

  // Everyone calls this to get the same Database object
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  // Connect to MongoDB — skips if already connected
  public async connect(uri: string): Promise<void> {
    if (this.isConnected) {
      console.log('[DB] Already connected — reusing connection')
      return
    }
    try {
      await mongoose.connect(uri)
      this.isConnected = true
      console.log('[DB] MongoDB connected ✅ (Singleton Pattern)')
    } catch (err) {
      console.error(`[DB] Connection failed: ${err}`)
      throw err
    }
  }
}

export default Database