"use server";

import { db } from "@/database/drizzle";
import { genres } from "@/database/schema";
import { eq } from "drizzle-orm";

// Create Genre
export async function createGenre(formData: FormData) {
    try {
        const nameEnglish = formData.get("nameEnglish") as string;
        const nameArabic = formData.get("nameArabic") as string;
        const status = formData.get("status") === "on" || formData.get("status") === "true";

        if (!nameEnglish) return { error: "Name in English is required" };
        if (!nameArabic) return { error: "Name in Arabic is required" };

        const existingGenre = await db
            .select()
            .from(genres)
            .where(eq(genres.nameEnglish, nameEnglish))
            .limit(1);

        if (existingGenre.length > 0) {
            return { success: false, error: "Genre already exists" };
        }

        await db.insert(genres).values({
            nameEnglish,
            nameArabic,
            status,
        });

        return { success: "Genre created successfully" };
    } catch (error) {
        console.error("Error creating genre:", error);
        return { error: "An unexpected error occurred." };
    }
}

// Update Genre
export async function updateGenre(id : string ,formData: FormData) {
    try {

        const nameEnglish = formData.get("nameEnglish") as string;
        const nameArabic = formData.get("nameArabic") as string;
        const status = formData.get("status") === "on" || formData.get("status") === "true";


        const existingGenre = await db.select().from(genres).where(eq(genres.id, id)).limit(1);
        if (existingGenre.length === 0) {
            return { success: false, error: "Genre not found" };
        }

        await db
            .update(genres)
            .set({ nameEnglish, nameArabic, status })
            .where(eq(genres.id, id));

        return { success: "Genre updated successfully" };
    } catch (error) {
        console.error("Error updating genre:", error);
        return { error: "An unexpected error occurred." };
    }
}

// Delete Genre
export async function deleteGenre(id: string) {
    try {
        if (!id) return { error: "Genre ID is required" };

        const existingGenre = await db.select().from(genres).where(eq(genres.id, id)).limit(1);
        if (existingGenre.length === 0) {
            return { success: false, error: "Genre not found" };
        }

        await db.delete(genres).where(eq(genres.id, id));

        return { success: "Genre deleted successfully" };
    } catch (error) {
        console.error("Error deleting genre:", error);
        return { error: "An unexpected error occurred." };
    }
}

// Get All Genres
export async function getGenres() {
    try {
        const allGenres = await db.select().from(genres);
        return { success: true, data: allGenres };
    } catch (error) {
        console.error("Error fetching genres:", error);
        return { error: "An unexpected error occurred." };
    }
}
export async function getGenre(id: string) {
    try {
        if (!id) return { error: "Genre ID is required" };
        const genre = await db.select().from(genres).where(eq(genres.id, id)).limit(1);
        if (genre.length === 0) {
            return { success: false, error: "Genre not found" };
        }
        return { success: true, data: genre[0] };
    } catch (error) {
        console.error("Error fetching genre by ID:", error);
        return { error: "An unexpected error occurred." };
    }
}