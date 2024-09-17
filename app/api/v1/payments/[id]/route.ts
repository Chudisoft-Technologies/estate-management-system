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
    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (payment) {
      return NextResponse.json(payment);
    } else {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    const errorMessage = (error as Error).message || "Error retrieving payment";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

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
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedPayment);
  } catch (error) {
    const errorMessage = (error as Error).message || "Error updating payment";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await authenticate(request);

  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    await prisma.payment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Payment deleted successfully" });
  } catch (error) {
    const errorMessage = (error as Error).message || "Error deleting payment";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
