import { PrismaClient, User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "../auth/auth";
import { hashPassword } from "@/utils/auth";
import { error } from "console";
import { ROLES } from "@/constants/roles";
const prisma = new PrismaClient();
const allowedRoles = ["admin", "user"];

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management
 *
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Retrieve a list of users or a specific user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: ID of the user to retrieve
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number to retrieve
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by (e.g., "name", "email")
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Order of sorting
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by name
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email
 *     responses:
 *       200:
 *         description: User details or a list of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access Denied
 *       404:
 *         description: User not found
 *   post:
 *     tags:
 *       - Users
 *     summary: Create a new user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *               - username
 *               - phone
 *               - password
 *     responses:
 *       201:
 *         description: User created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access Denied
 *   put:
 *     tags:
 *       - Users
 *     summary: Update an existing user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access Denied
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access Denied
 */

export async function GET(request: NextRequest) {
  const token = await authenticate(request);
  if (token !== null) return token;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (user) {
      return NextResponse.json(user);
    } else {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
  }

  // Existing code for handling lists, pagination, filtering, and sorting
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const order = searchParams.get("order") || "asc"; // or 'desc'
  const searchWord = searchParams.get("searchWord");
  const fromDate = searchParams.get("fromDate")
    ? new Date(searchParams.get("fromDate")!)
    : null;
  const toDate = searchParams.get("toDate")
    ? new Date(searchParams.get("toDate")!)
    : null;

  const where = {
    AND: [
      searchWord ? { name: { contains: searchWord } } : {},
      searchWord ? { email: { contains: searchWord } } : {},
      searchWord ? { phone: { contains: searchWord } } : {},
      searchWord ? { state: { contains: searchWord } } : {},
      searchWord ? { contactAddress: { contains: searchWord } } : {},
      searchWord ? { occupation: { contains: searchWord } } : {},
      fromDate ? { createdAt: { gte: fromDate } } : {},
      toDate ? { updatedAt: { lte: toDate } } : {},
    ],
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: { [sortBy]: order },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.user.count({ where });

  return NextResponse.json({
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const token = await authenticate(request, [ROLES.ADMIN]);

  const data = await request.json();
  let role = token === null ? ROLES.USER : data.role;

  if (!data.email || !data.password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    // Extract device information from the User-Agent header
    const userAgent = request.headers.get("user-agent") || "unknown"; // Get the User-Agent header
    const deviceInfo = userAgent; // For simplicity, just using the User-Agent string as device info

    // Extracting IP address and GPS from the request or data
    const ipAddress = request.headers.get("x-forwarded-for") || ""; // Example: You might get it from headers
    const gps = data.gps || ""; // Example: GPS data might come from the request

    // Setting default values if they are not provided
    data.role = role; // Assign role
    data.password = await hashPassword(data.password); // Hashing the password

    // Creating a new user with additional fields
    const newUser = await prisma.user.create({
      data: {
        ...data,
        ipAddress,
        gps,
        deviceInfo,
      },
    });

    return NextResponse.json(
      { user: newUser, message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Error registering user" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const token = await authenticate(request);
  if (token !== null) return token;

  const { id, ...data } = await request.json();
  const updatedUser = await prisma.user.update({
    where: { id },
    data,
  });
  return NextResponse.json(updatedUser);
}

export async function DELETE(request: NextRequest) {
  const token = await authenticate(request);
  if (token !== null) return token;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";
  const deletedUser = await prisma.user.delete({
    where: { id },
  });
  return NextResponse.json(deletedUser);
}
