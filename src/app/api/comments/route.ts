// ============================================================
// API de Comentarios por Clase
// GET  /api/comments?courseId=xxx&lessonId=yyy
// POST /api/comments — Crear comentario (requiere auth)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET — Obtener comentarios de una clase
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");
  const lessonId = searchParams.get("lessonId");

  if (!courseId || !lessonId) {
    return NextResponse.json(
      { error: "courseId y lessonId son requeridos" },
      { status: 400 }
    );
  }

  try {
    const comments = await db.comment.findMany({
      where: { courseId, lessonId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, photoURL: true },
        },
      },
    });
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Error al obtener comentarios" },
      { status: 500 }
    );
  }
}

// POST — Crear un comentario
export async function POST(request: NextRequest) {
  try {
    const { courseId, lessonId, content, userId, userName, userPhoto } =
      await request.json();

    if (!courseId || !lessonId || !content?.trim()) {
      return NextResponse.json(
        { error: "courseId, lessonId y content son requeridos" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para comentar" },
        { status: 401 }
      );
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { error: "El comentario no puede exceder 1000 caracteres" },
        { status: 400 }
      );
    }

    // Asegurar que el usuario exista en DB (puede estar recién registrado)
    await db.user.upsert({
      where: { id: userId },
      update: { name: userName || undefined, photoURL: userPhoto || undefined },
      create: {
        id: userId,
        email: `${userId}@firebase.local`, // fallback email
        name: userName || "Usuario",
        photoURL: userPhoto || undefined,
      },
    });

    const comment = await db.comment.create({
      data: {
        userId,
        courseId,
        lessonId,
        content: content.trim(),
      },
      include: {
        user: {
          select: { id: true, name: true, photoURL: true },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Error al crear comentario" },
      { status: 500 }
    );
  }
}
