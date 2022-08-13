import prisma  from '../prisma/lib/prisma'
import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
export class StoreController{
    async index(req: Request, res: Response){
        const stores = await prisma.store.findMany();
        res.json(stores);
    }

    async create(req: Request, res: Response){
        try {
            const hash = await bcrypt.hash(req.body.password, 8);
            //verifico se existe uma loja com o mesmo nome
            const storeExist = await prisma.store.findFirst({
                where: {
                    name: req.body.nameStore
                }
            });
            if(storeExist){
                return res.status(400).json({
                    error: 'Loja já existe'
                });
            }
            //verifico se existe um usuário com o mesmo name
            const userExist = await prisma.user.findFirst({
                where: {
                    username: req.body.nameUser
                }
            });
            if(userExist){
                return res.status(400).json({
                    error: 'Usuário já existe'
                });
            }
            const store = await prisma.store.create({
                data: {
                    name: req.body.nameStore,
                    updatedAt: new Date(),
                    typeOfStore: req.body.typeOfStore,
                    about: req.body.about,
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
                            password: hash,
                            updatedAt: new Date(),
                            typeOfUser: "admin"
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

    async getById(req: Request, res: Response){
        try {
            const store = await prisma.store.findUnique({
                where: {
                    id: req.params.id
                },
                include:{
                    Theme: true,
                    Address: true,
                    Contact: true,
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