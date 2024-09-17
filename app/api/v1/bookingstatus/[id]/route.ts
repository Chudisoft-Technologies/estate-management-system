import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../../auth/auth"; // Adjust the path as necessary

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await authenticate(request);

  // Extract ID from params
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    const bookingstatus = await prisma.bookingStatus.findUnique({
      where: { id },
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

// Implement POST, PUT, DELETE as needed, similar to GET
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await authenticate(request);

  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    const data = await request.json();
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
