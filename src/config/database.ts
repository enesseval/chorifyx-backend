import mongoose from "mongoose";

const connectDB = async () => {
   try {
      const mongoUri = process.env.MONGO_URI;
      if (!mongoUri) throw new Error("MONGO_URI is not defined in the environment variables.");

      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB bağlantısı başarılı: ${conn.connection.host}`);
   } catch (error) {
      console.error(`MongoDB bağlantı hatası: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
   }
};
export default connectDB;
