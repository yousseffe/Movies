"use server"
import { z } from "zod"
// import { getServerSession } from "next-auth/next"
import connectToDatabase from "@/lib/mongodb"
import MovieRequest from "@/models/MovieRequest"
import User from "@/models/User"
import {authOptions} from "@/lib/authOptions";

const requestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Please provide more details about the movie"),
})

export async function createMovieRequest(data: z.infer<typeof requestSchema>) {
  try {
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return { error: "You must be logged in to request a movie" }
    // }

    const validatedData = requestSchema.parse(data)

    await connectToDatabase()

    const request = new MovieRequest({
      title: validatedData.title,
      description: validatedData.description,
      // @ts-ignore
      user: session.user.id,
    })

    await request.save()

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }

    console.error("Movie request error:", error)
    return { error: "Failed to submit request. Please try again." }
  }
}

export async function getMovieRequests() {
  try {
    // const session = await getServerSession(authOptions)
    // @ts-ignore
    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized")
    }
    console.log("Fetching movie requests...")
    await connectToDatabase()
    console.log("connect to dataabse")
    // @ts-ignore
    const requests = await MovieRequest.find().populate("user" , "name email").sort({ createdAt: -1 })
    return JSON.parse(JSON.stringify(requests))
  } catch (error) {
    console.error("Failed to fetch movie requests:", error)
    return []
  }
}

export async function updateMovieRequest(id: string, data: { status: string; adminResponse: string }) {
  try {
    // const session = await getServerSession(authOptions)
    // @ts-ignore
    if (!session || session.user.role !== "admin") {
      return { error: "Unauthorized" }
    }

    await connectToDatabase()
// @ts-ignore
    const request = await MovieRequest.findById(id)

    if (!request) {
      return { error: "Request not found" }
    }

    // Update the request status and admin response
    request.status = data.status
    request.adminResponse = data.adminResponse
    await request.save()
    // If the request is approved and has a movieId, update the user's permissions
    if (data.status == "approved" && request.movie) {
      // Find the user
      // @ts-ignore
      const user = await User.findById(request.user)
      if (user) {
        if(user.requestMovies.includes(request.movie)){
          user.allowedMovies = user.allowedMovies || [] // Ensure the array exists
          if (!user.allowedMovies.includes(request.movie)) {
          user.allowedMovies.push(request.movie)
          user.requestMovies = user.requestMovies = user.requestMovies.filter(
              // @ts-ignore
            (id: string) => id.toString() !== request.movie.toString()
          )
          await user.save()
        }
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to update movie request:", error)
    return { error: "Failed to update request" }
  }
}

export async function requestMovie(movieId: string , movieName: string) {
  try {
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return { error: "You must be logged in to request movie access" }
    // }

    await connectToDatabase()

    const request = new MovieRequest({
      title: "Request for full movie access",
      description: `User has requested access to the full movie with ID: ${movieId} and name: ${movieName}`,
      // @ts-ignore
      user: session.user.id,
      movie: movieId,
      status: "pending",
    })
    await request.save()
    // @ts-ignore
    const user = await User.findById(session.user.id)
    if (!user) {
      return { error: "User not found" }
    }
    // @ts-ignore
    user.requestMovies.push(movieId)
    user.markModified("requestMovies")
      await user.save()
    return { success: true }
  } catch (error) {
    console.error("Movie request error:", error)
    return { error: "Failed to submit request. Please try again." }
  }
}

export async function checkMovieAccess(movieId: string) {
  try {
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return { hasAccess: false }
    // }

    await connectToDatabase()

    // Check if the user is an admin (admins have access to all movies)
    // @ts-ignore
    if (session.user.role === "admin") {
      return { hasAccess: true }
    }

    // Check if the user has an approved request for this movie
    // @ts-ignore
    const user = await User.findById(session.user.id)
    if (!user) {
      return { hasAccess: false }
    }

    // Check if the movie is in the user's allowedMovies array
    // @ts-ignore
    const hasAccess = user.allowedMovies && user.allowedMovies.includes(movieId)
    return { hasAccess }
  } catch (error) {
    console.error("Error checking movie access:", error)
    return { hasAccess: false }
  }
}

export async function checkRequested(movieId: string) {
  try {
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return { hasAccess: false }
    // }
    await connectToDatabase()
    // @ts-ignore
    const user = await User.findById(session.user.id)
    if (!user) {
      return { hasAccess: false }
    }
    // @ts-ignore
    const requested = user.requestMovies && user.requestMovies?.includes(movieId)
    return { hasAccess: requested }
  } catch (error) {
    console.error("Error checking requested movie:", error)
    return { hasAccess: false }
  }
}

