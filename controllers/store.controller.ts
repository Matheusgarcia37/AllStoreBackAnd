import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
export class StoreController{
    async index(req: Request, res: Response){
        const prisma = new PrismaClient();
        const stores = await prisma.store.findMany();
        res.json(stores);
    }

    async create(req: Request, res: Response){
        const prisma = new PrismaClient();
        const store = await prisma.store.create({
            data: {
                name: req.body.name,
                themeId: null,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
        res.json(store);
    }
}