import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../auth/auth";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const token = await authenticate(request);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    try {
      const bookingstatus = await prisma.bookingStatus.findUnique({
        where: { id: parseInt(id) },
      });

      if (bookingstatus) {
        return NextResponse.json(bookingstatus);
      } else {
        return NextResponse.json(
          { message: "BookingStatus not found" },
          { status: 404 }
        );
      }
    } catch (error) {
      const errorMessage =
        (error as Error).message || "Error retrieving booking status";
      return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
  }

  // Handle list retrieval with pagination, filtering, and sorting
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const order = searchParams.get("order") || "asc";
  const searchWord = searchParams.get("searchWord");
  const fromDate = searchParams.get("fromDate")
    ? new Date(searchParams.get("fromDate")!)
    : null;
  const toDate = searchParams.get("toDate")
    ? new Date(searchParams.get("toDate")!)
    : null;
  const costMin = parseFloat(searchParams.get("costMin") || "0");
  const costMax = parseFloat(searchParams.get("costMax") || "Infinity");

  const where = {
    AND: [
      searchWord ? { name: { contains: searchWord } } : {},
      costMin ? { cost: { gte: costMin } } : {},
      costMax !== Infinity ? { cost: { lte: costMax } } : {},
      fromDate ? { createdAt: { gte: fromDate } } : {},
      toDate ? { updatedAt: { lte: toDate } } : {},
    ],
  };

  try {
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
  } catch (error) {
    const errorMessage =
      (error as Error).message || "Error retrieving booking statuses";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = await authenticate(request);

  try {
    const data = await request.json();
    const newBookingStatus = await prisma.bookingStatus.create({
      data,
    });
    return NextResponse.json(newBookingStatus, { status: 201 });
  } catch (error) {
    const errorMessage =
      (error as Error).message || "Error creating booking status";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const token = await authenticate(request);

  try {
    const { id, ...data } = await request.json();
    if (!id) {
      return NextResponse.json(
        { message: "ID is required for updating" },
        { status: 400 }
      );
    }

    const updatedBookingStatus = await prisma.bookingStatus.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedBookingStatus);
  } catch (error) {
    const errorMessage =
      (error as Error).message || "Error updating booking status";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const token = await authenticate(request);

  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "");

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    const deletedBookingStatus = await prisma.bookingStatus.delete({
      where: { id },
    });
    return NextResponse.json(deletedBookingStatus);
  } catch (error) {
    const errorMessage =
      (error as Error).message || "Error deleting booking status";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
