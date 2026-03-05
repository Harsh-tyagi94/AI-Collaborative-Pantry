import mongoose from "mongoose"
import { Redis } from "@upstash/redis"

const redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
})

const databse_connection_infrastructure = async () => {
    try {
        const db_connect = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log(`connected to db: ${db_connect.connection.host}`)

        const redis_ping = await redisClient.ping()
        console.log(`redis ping: ${redis_ping}`)

    } catch (error) {
        console.log('ERROR:', error)
        process.exit(1)
    }
}

export { databse_connection_infrastructure, 
    redisClient, 
};