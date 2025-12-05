import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

// GET - Obtener todos los subrubros
export async function GET(request) {
    try {
        const subrubros = await prisma.subrubro.findMany({
            include: {
                parent: true,
                children: true
            },
            orderBy: [
                { rubro: 'asc' },
                { order: 'asc' }
            ]
        });

        return NextResponse.json(subrubros);
    } catch (error) {
        console.error('Error fetching subrubros:', error);
        return NextResponse.json(
            { error: 'Error obteniendo subrubros' },
            { status: 500 }
        );
    }
}

// POST - Crear nuevo subrubro
export async function POST(request) {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const body = await request.json();
        console.log("🚀 ~ POST ~ body:", body)

        // Validaciones
        if (!body.name || !body.slug || !body.rubro) {
            return NextResponse.json(
                { error: 'Faltan campos requeridos' },
                { status: 400 }
            );
        }

        // Verificar que no exista un subrubro con ese slug en ese rubro
        const existingSlug = await prisma.subrubro.findUnique({
            where: {
                slug_rubro: {
                    slug: body.slug,
                    rubro: body.rubro
                }
            }
        });

        if (existingSlug) {
            return NextResponse.json(
                { error: 'Ya existe un subrubro con ese slug en este rubro' },
                { status: 400 }
            );
        }

        // Crear subrubro
        const subrubro = await prisma.subrubro.create({
            data: {
                name: body.name,
                slug: body.slug,
                rubro: body.rubro,
                parentId: body.parentId || null,
                order: body.order || 0,
                active: true
            },
            include: {
                parent: true
            }
        });

        return NextResponse.json(subrubro, { status: 201 });
    } catch (error) {
        console.error('Error creating subrubro:', error);
        return NextResponse.json(
            { error: 'Error creando subrubro' },
            { status: 500 }
        );
    }
}