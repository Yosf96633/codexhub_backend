import { connect } from "mongoose";

export const connectDB = async () => {
      try {
         await connect(`${process.env.MONGO_URI}/Code-X`)
         console.log('MongoDB connect successfully')
      } catch (error) {
        console.log('Error while connecting MongoDB. Error-> ' , error)
      }
}