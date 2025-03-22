"use server"



import {db} from "@/database/drizzle";
import {movieRequests} from "@/database/schema";

export async function getMovieRequests() {
    try {
        const requests = await db.select().from(movieRequests);
        return JSON.parse(JSON.stringify(requests))
    } catch (error) {
        console.error("Failed to fetch movie requests:", error)
        return []
    }
}