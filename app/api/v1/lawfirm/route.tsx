import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, LawFirm } from "@prisma/client";
import { authenticate } from "../auth/auth";

const prisma = new PrismaClient();
const allowedRoles = ["admin", "user"];

/**
 * @swagger
 * tags:
 *   - name: LawFirms
 *     description: Law firm management
 *
 * /law-firms:
 *   get:
 *     tags:
 *       - LawFirms
 *     summary: Retrieve a list of law firms or a specific law firm by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: ID of the law firm to retrieve
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
 *         description: Field to sort by (e.g., "name", "city")
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
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *     responses:
 *       200:
 *         description: Law firm details or a list of law firms
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access Denied
 *       404:
 *         description: Law firm not found
 *   post:
 *     tags:
 *       - LawFirms
 *     summary: Create a new law firm
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               city:
 *                 type: string
 *               address:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *             required:
 *               - name
 *               - city
 *               - address
 *               - contactEmail
 *     responses:
 *       201:
 *         description: Law firm created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access Denied
 *   put:
 *     tags:
 *       - LawFirms
 *     summary: Update an existing law firm
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
 *                 type: integer
 *               name:
 *                 type: string
 *               city:
 *                 type: string
 *               address:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Law firm updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access Denied
 *   delete:
 *     tags:
 *       - LawFirms
 *     summary: Delete a law firm
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the law firm to delete
 *     responses:
 *       200:
 *         description: Law firm deleted
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
    const lawfirm = await prisma.lawFirm.findUnique({
      where: { id: parseInt(id) },
    });

    if (lawfirm) {
      return NextResponse.json(lawfirm);
    } else {
      return NextResponse.json(
        { message: "LawFirm not found" },
        { status: 404 }
      );
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
      searchWord ? { address: { contains: searchWord } } : {},
      searchWord ? { phone: { contains: searchWord } } : {},
      searchWord ? { email: { contains: searchWord } } : {},
      fromDate ? { createdAt: { gte: fromDate } } : {},
      toDate ? { updatedAt: { lte: toDate } } : {},
    ],
  };

  const lawfirms = await prisma.lawFirm.findMany({
    where,
    orderBy: { [sortBy]: order },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.lawFirm.count({ where });

  return NextResponse.json({
    data: lawfirms,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const token = await authenticate(request);

  if (token !== null) return token;

  const data = await request.json();
  const newLawFirm = await prisma.lawFirm.create({
    data,
  });
  return NextResponse.json(newLawFirm, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const token = await authenticate(request);
  if (token !== null) return token;

  const { id, ...data } = await request.json();
  const updatedLawFirm = await prisma.lawFirm.update({
    where: { id },
    data,
  });
  return NextResponse.json(updatedLawFirm);
}

export async function DELETE(request: NextRequest) {
  const token = await authenticate(request);
  if (token !== null) return token;

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "");
  const deletedLawFirm = await prisma.lawFirm.delete({
    where: { id },
  });
  return NextResponse.json(deletedLawFirm);
}
