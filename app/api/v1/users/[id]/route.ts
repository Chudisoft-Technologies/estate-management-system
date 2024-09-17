import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../../auth/auth"; // Adjust the path as necessary

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await authenticate(request);

  // Extract ID from params and ensure it's a string
  const id = params.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (user) {
      return NextResponse.json(user);
    } else {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
  } catch (error) {
    const errorMessage = (error as Error).message || "Error retrieving user";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await authenticate(request);

  // Extract ID from params and ensure it's a string
  const id = params.id;

  try {
    const data = await request.json();
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    const errorMessage = (error as Error).message || "Error updating user";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await authenticate(request);

  // Extract ID from params and ensure it's a string
  const id = params.id;

  try {
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    const errorMessage = (error as Error).message || "Error deleting user";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
