"use server"

import { uploadImage, uploadVideo } from "@/lib/cloudinary";
import { movies } from "@/database/schema";
import { db } from "@/database/drizzle";
import { eq } from "drizzle-orm";

export async function createMovie(formData: FormData) {
    try {
        const titleEnglish = formData.get("titleEnglish") as string;
        const titleArabic = formData.get("titleArabic") as string;
        const year = Number.parseInt(formData.get("year") as string);
        const plotEnglish = formData.get("plotEnglish") as string;
        const plotArabic = formData.get("plotArabic") as string;
        const status = formData.get("status") as "draft" | "published";
        const budget = formData.get("budget") ? Number.parseInt(formData.get("budget") as string) : undefined;

        const rawGenres = formData.get("genres");
        let genreIds: string[] = [];
        if (typeof rawGenres === "string") {
            try {
                genreIds = JSON.parse(rawGenres);
            } catch (error) {
                console.error("Error parsing genres:", error);
            }
        }

        let posterUrl = null;
        let coverUrl = null;

        const posterFile = formData.get("poster") as File;
        if (posterFile && posterFile.size > 0) {
            const result = await uploadImage(posterFile);
            posterUrl = result.url;
        }

        const coverFile = formData.get("cover") as File;
        if (coverFile && coverFile.size > 0) {
            const result = await uploadImage(coverFile);
            coverUrl = result.url;
        }

        const videosData = JSON.parse((formData.get("videos") as string) || "[]");
        const videos = [];

        for (const videoData of videosData) {
            if (videoData.fileIndex !== undefined) {
                const fileKey = `videoFile-${videoData.fileIndex}`;
                const videoFile = formData.get(fileKey) as File;
                if (videoFile && videoFile.size > 0) {
                    try {
                        const result = await uploadVideo(videoFile);
                        videos.push({
                            title: videoData.title,
                            url: result.url,
                            isTrailer: videoData.isTrailer,
                        });
                    } catch (error) {
                        console.error("Upload failed:", error);
                    }
                }
            } else if (videoData.url) {
                videos.push({
                    title: videoData.title,
                    url: videoData.url,
                    isTrailer: videoData.isTrailer,
                });
            }
        }

        // @ts-ignore
        await db.insert(movies).values({
            titleEnglish,
            titleArabic,
            year,
            budget,
            genres: genreIds,
            plotEnglish,
            plotArabic,
            poster: posterUrl,
            cover: coverUrl,
            videos,
            status,
        });
        return {success : true}
    } catch (e) {
        console.error("Error creating movie:", e);
        return {error : "Error creating movie:"}
    }
}

export async function updateMovie(id: string, formData: FormData) {
    try {
        const updates: any = {};
        formData.forEach((value, key) => {
            if (key === "genres" && typeof value === "string") {
                try {
                    updates[key] = JSON.parse(value);
                } catch (error) {
                    console.error("Error parsing genres:", error);
                }
            } else if (key === "budget" || key === "year") {
                updates[key] = Number(value);
            } else {
                updates[key] = value;
            }
        });

        // @ts-ignore
        await db.update(movies).set(updates).where(eq(movies.id, id));
        return{ success : true }
    } catch (e) {
        console.error("Error updating movie:", e);
        return {error : "Error updating movie:"}
    }
}

export async function deleteMovie(id: string) {
    try {
        await db.delete(movies).where(eq(movies.id, id));
        return {success : true}
    } catch (e) {
        console.error("Error deleting movie:", e);
        return {error : "Error deleting movie:"}
    }
}

export async function getMovie(id: string) {
    try {
        if (!id){
            return {success: false, error: "Movie ID is required"};
        }
        const movie = await db.select().from(movies).where(eq(movies.id,id))
        return {success: true, data: movie[0] };
    } catch (e) {
        console.error("Error fetching movie:", e)
        return { error: "Failed to fetch movie" }
    }
}

export async function getMovies() {
    try {
        return { success: true, data:await db.select().from(movies) };
    } catch (e) {
        console.error("Error fetching movie:", e)
        return { error: "Failed to fetch movie"}
        }
}
