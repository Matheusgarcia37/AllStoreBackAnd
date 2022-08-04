import prisma  from '../prisma/lib/prisma'
import { Request, Response } from "express";
export class StoreController{
    async index(req: Request, res: Response){
        const stores = await prisma.store.findMany();
        res.json(stores);
    }

    async create(req: Request, res: Response){
        try {
            const store = await prisma.store.create({
                data: {
                    name: req.body.nameStore,
                    updatedAt: new Date(),
                    typeOfStore: req.body.typeOfStore,
                    Theme: {
                        create: {
                            primaryColor: req.body.primaryColor,
                            secondaryColor: req.body.secondaryColor,
                            updatedAt: new Date(),
                        }
                    },
                    User: {
                        create:{
                            username: req.body.nameUser,
                            email: req.body.email,
                            password: req.body.password,
                            updatedAt: new Date(),
                        }
                    }
                }
            });
            return res.json(store);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Error inesperado",
                error: error
            });
        }
       
    }

    async show(req: Request, res: Response){
        try {
            const store = await prisma.store.findUnique({
                where: {
                    name: req.params.NameStore
                },
                include:{
                    Theme: true,
                    User: true
                }
            });
            if(!store){
                return res.status(404).json({
                    message: "Store not found"
                });
            }
            return res.json(store);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Error inesperado",
                error: error
            });
        }
    }
}