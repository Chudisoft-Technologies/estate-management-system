import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"; // You can use any JWT library for decoding/validating tokens

// Ensure you have the JWT_SECRET defined in your environment variables
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

export async function authenticate(
  request: NextRequest,
  allowedRoles: string[] = []
) {
  // Retrieve token from the Authorization header
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized: No Token Provided" },
      { status: 401 }
    );
  }

  try {
    // Decode and verify the token with your JWT secret
    const decodedToken = jwt.verify(token, JWT_SECRET) as any;

    // Check if the token contains a valid role
    const userRole = decodedToken.role; // Assuming the role is stored in the token under 'role'
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: "Forbidden: Access Denied" },
        { status: 403 }
      );
    }

    // Token is valid and user has correct role
    return decodedToken; // Return the decoded token object
  } catch (err) {
    // Handle invalid or expired token errors
    return NextResponse.json(
      { error: "Unauthorized: Invalid or Expired Token" },
      { status: 401 }
    );
  }
}
