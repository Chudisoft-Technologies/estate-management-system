import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, BookingStatus } from '@prisma/client';
import { authenticate } from '../auth/auth';

const prisma = new PrismaClient();
const allowedRoles = ['admin', 'user'];

/**
 * @swagger
 * tags:
 *   - name: BookingStatus
 *     description: Booking status management
 *
 * /booking-statuses:
 *   get:
 *     tags:
 *       - BookingStatus
 *     summary: Retrieve a list of booking statuses or a specific booking status by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: ID of the booking status to retrieve
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
 *         description: Field to sort by (e.g., "status", "createdAt")
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Order of sorting
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Booking status details or a list of booking statuses
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access Denied
 *       404:
 *         description: Booking status not found
 *   post:
 *     tags:
 *       - BookingStatus
 *     summary: Create a new booking status
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *             required:
 *               - status
 *     responses:
 *       201:
 *         description: Booking status created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access Denied
 *   put:
 *     tags:
 *       - BookingStatus
 *     summary: Update an existing booking status
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking status updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access Denied
 *   delete:
 *     tags:
 *       - BookingStatus
 *     summary: Delete a booking status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the booking status to delete
 *     responses:
 *       200:
 *         description: Booking status deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Access Denied
 */

export async function GET(request: NextRequest) {
  const token = await authenticate(request);
  if (token !== null) return token;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const bookingstatus = await prisma.bookingStatus.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (bookingstatus) {
      return NextResponse.json(bookingstatus);
    } else {
      return NextResponse.json({ message: 'BookingStatus not found' }, { status: 404 });
    }
  }

  // Existing code for handling lists, pagination, filtering, and sorting
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'asc'; // or 'desc'
  const searchWord = searchParams.get('searchWord');
  const fromDate = searchParams.get('fromDate') ? new Date(searchParams.get('fromDate')!) : null;
  const toDate = searchParams.get('toDate') ? new Date(searchParams.get('toDate')!) : null;
  const costMin = parseFloat(searchParams.get('costMin') || '0');
  const costMax = parseFloat(searchParams.get('costMax') || 'Infinity');

  const where = {
    AND: [
      searchWord ? { name: { contains: searchWord } } : {},
      costMin ? { cost: { gte: costMin } } : {},
      costMax !== Infinity ? { cost: { lte: costMax } } : {},
      fromDate ? { createdAt: { gte: fromDate } } : {},
      toDate ? { updatedAt: { lte: toDate } } : {},
    ],
  };

  const bookingstatuses = await prisma.bookingStatus.findMany({
    where,
    orderBy: { [sortBy]: order },
    skip: (page - 1) * limit,
    take: limit,
  });

  const total = await prisma.bookingStatus.count({ where });

  return NextResponse.json({
    data: bookingstatuses,
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
  const newBookingStatus = await prisma.bookingStatus.create({
    data,
  });
  return NextResponse.json(newBookingStatus, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const token = await authenticate(request);
  if (token !== null) return token;
  
  const { id, ...data } = await request.json();
  const updatedBookingStatus = await prisma.bookingStatus.update({
    where: { id },
    data,
  });
  return NextResponse.json(updatedBookingStatus);
}

export async function DELETE(request: NextRequest) {
  const token = await authenticate(request);
  if (token !== null) return token;
  
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get('id') || '');
  const deletedBookingStatus = await prisma.bookingStatus.delete({
    where: { id },
  });
  return NextResponse.json(deletedBookingStatus);
}
