import { pgTable, serial, text, varchar, boolean, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: text("password").notNull(),
    role: text("role").$type<"admin" | "user">().default("user").notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    verificationToken: text("verification_token"),
    verificationTokenExpiry: timestamp("verification_token_expiry"),
    resetPasswordToken: text("reset_password_token"),
    resetPasswordTokenExpiry: timestamp("reset_password_token_expiry"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    profilePicture: text("profile_picture").default(""),
});

export const movies = pgTable("movies", {
    id: uuid("id").defaultRandom().primaryKey(),
    titleEnglish: varchar("title_english", { length: 255 }).notNull(),
    titleArabic: varchar("title_arabic", { length: 255 }).notNull(),
    year: integer("year").notNull(),
    budget: integer("budget"),
    plotEnglish: text("plot_english").notNull(),
    plotArabic: text("plot_arabic").notNull(),
    genres: jsonb("genres").notNull(),
    poster: text("poster"),
    cover: text("cover"),
    videos: jsonb("videos").notNull(),
    status: text("status").$type<"draft" | "published">().default("draft").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const genres = pgTable("genres", {
    id: uuid("id").defaultRandom().primaryKey(),
    nameEnglish: varchar("name_english", { length: 255 }).notNull().unique(),
    nameArabic: varchar("name_arabic", { length: 255 }).notNull(),
    status: boolean("status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const movieRequests = pgTable("movie_requests", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    movieId: uuid("movie_id").references(() => movies.id, { onDelete: "cascade" }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    status: text("status").$type<"pending" | "approved" | "rejected">().default("pending").notNull(),
    adminResponse: text("admin_response").default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
    watchlist: many(userWatchlist),
    allowedMovies: many(userAllowedMovies),
    requestMovies: many(movieRequests),
}));

export const userWatchlist = pgTable("user_watchlist", {
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    movieId: uuid("movie_id").references(() => movies.id, { onDelete: "cascade" }).notNull(),
});

export const userAllowedMovies = pgTable("user_allowed_movies", {
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    movieId: uuid("movie_id").references(() => movies.id, { onDelete: "cascade" }).notNull(),
});
