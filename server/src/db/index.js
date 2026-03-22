import mongoose from "mongoose"
import { Redis } from "@upstash/redis"

const redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
})

const databse_connection_infrastructure = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log(`connected to db`)

        await redisClient.ping()
        console.log(`redis ping`)

    } catch (error) {
        console.log('ERROR:', error)
        process.exit(1)
    }
}

export { databse_connection_infrastructure, 
    redisClient, 
};