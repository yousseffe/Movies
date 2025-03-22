declare global {
  interface AuthCredentials {
    name: string;
    email: string;
    password: string;
  }

  interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: "admin" | "user";
    isVerified: boolean;
    verificationToken?: string;
    verificationTokenExpiry?: Date;
    resetPasswordToken?: string;
    resetPasswordTokenExpiry?: Date;
    createdAt: Date;
    updatedAt: Date;
    profilePicture?: string;
  }

  interface Movie {
    id: string;
    titleEnglish: string;
    titleArabic: string;
    year: number;
    budget?: number;
    plotEnglish: string;
    plotArabic: string;
    genres: string[];
    poster?: string;
    cover?: string;
    videos: string[];
    status: "draft" | "published";
    createdAt: Date;
    updatedAt: Date;
  }

  interface Genre {
    id: string;
    nameEnglish: string;
    nameArabic: string;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  interface MovieRequest {
    id: string;
    title: string;
    description: string;
    movieId: string;
    userId: string;
    status: "pending" | "approved" | "rejected";
    adminResponse?: string;
    createdAt: Date;
    updatedAt: Date;
  }

  interface UserWatchlist {
    userId: string;
    movieId: string;
  }

  interface UserAllowedMovie {
    userId: string;
    movieId: string;
  }
}

// This line is necessary to ensure the file is treated as a module
export {};
