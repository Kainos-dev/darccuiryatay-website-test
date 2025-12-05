// app/api/admin/subrubros/[id]/route.js
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

// GET - Obtener un subrubro específico
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const subrubro = await prisma.subrubro.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true
            }
        });

        if (!subrubro) {
            return NextResponse.json(
                { error: 'Subrubro no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(subrubro);
    } catch (error) {
        console.error('Error fetching subrubro:', error);
        return NextResponse.json(
            { error: 'Error obteniendo subrubro' },
            { status: 500 }
        );
    }
}

// PUT - Actualizar subrubro
export async function PUT(request, { params }) {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();

        // Verificar que existe
        const existing = await prisma.subrubro.findUnique({
            where: { id }
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Subrubro no encontrado' },
                { status: 404 }
            );
        }

        // Actualizar
        const subrubro = await prisma.subrubro.update({
            where: { id },
            data: {
                name: body.name,
                slug: body.slug,
                rubro: body.rubro,
                parentId: body.parentId || null,
                order: body.order,
                active: body.active
            },
            include: {
                parent: true,
                children: true
            }
        });

        return NextResponse.json(subrubro);
    } catch (error) {
        console.error('Error updating subrubro:', error);
        return NextResponse.json(
            { error: 'Error actualizando subrubro' },
            { status: 500 }
        );
    }
}

// DELETE - Eliminar subrubro
export async function DELETE(request, { params }) {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Verificar si tiene hijos
        const children = await prisma.subrubro.findMany({
            where: { parentId: id }
        });

        if (children.length > 0) {
            return NextResponse.json(
                { error: 'No se puede eliminar: tiene sub-subrubros' },
                { status: 400 }
            );
        }

        // Eliminar
        await prisma.subrubro.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Subrubro eliminado' });
    } catch (error) {
        console.error('Error deleting subrubro:', error);
        return NextResponse.json(
            { error: 'Error eliminando subrubro' },
            { status: 500 }
        );
    }
}