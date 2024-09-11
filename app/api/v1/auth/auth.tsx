import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ROLES, Role } from "@/constants/roles"; // Ensure the correct path

// Retrieve JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "default-secret";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// Extract all roles from the ROLES constant
const allRoles: Role[] = Object.values(ROLES);

export async function authenticate(
  request: NextRequest,
  allowedRoles: Role[] = allRoles // Default to all roles
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
    const userRole = decodedToken.role;
    console.log(userRole); // Debug: check the role in the token
    console.log("Allowed Roles:", allowedRoles); // Debug: check allowed roles

    // Check if the token role is in allowed roles
    if (!allowedRoles.includes(userRole as Role)) {
      return NextResponse.json(
        { error: "Forbidden: Access Denied" },
        { status: 403 }
      );
    }

    // Token is valid and user has correct role
    // return NextResponse.json({ user: decodedToken }, { status: 200 });
  } catch (err) {
    console.error("Authentication Error:", err); // Debug: log error details
    return NextResponse.json(
      { error: "Unauthorized: Invalid or Expired Token" },
      { status: 401 }
    );
  }
  return token;
}
