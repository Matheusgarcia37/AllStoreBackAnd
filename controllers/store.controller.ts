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
            const { file } = req;
            req.body = JSON.parse(req.body.data);
            
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

            const storeData = {
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
                        password: hash,
                        updatedAt: new Date(),
                        typeOfUser: "admin"
                    }
                },
                Address: {
                    create: {
                        main: true,
                        street: req.body.street,
                        city: req.body.city,
                        state: req.body.state,
                        number: req.body.number,
                        zip: req.body.zip,
                        updatedAt: new Date(),
                    }
                },
                Contact: {
                    create: {
                        main: true,
                        email: req.body.email,
                        phone: req.body.phone,
                        updatedAt: new Date(),
                    }
                },
            };

            if(file){
                (storeData as any).Upload = {
                    create: {
                        name: (file as any).originalname, 
                        key: (file as any).key,
                        url: (file as any).location,
                        updatedAt: new Date(),
                    }
                }
            }
            const store = await prisma.store.create({
                data: storeData as any,
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
                    User: true,
                    Upload: true,
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
                    Upload: true,
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

    async update(req: Request, res: Response){
        const { id } = req.params;
        const { file } = req;
        req.body.Address = JSON.parse(req.body.Address)
        req.body.Contact = JSON.parse(req.body.Contact)

        try {
            const store = await prisma.store.findUnique({
                where: {
                    id
                },
                include:{
                    Address: true,
                    Contact: true,
                }
            })
            if(!store){
                return res.status(404).json({
                    message: "Store not found"
                });
            }
            const storeAlterData =  {
                name: req.body.name,
                updatedAt: new Date(),
                typeOfStore: req.body.typeOfStore,
                about: req.body.about,
                facebook: req.body.facebook,
                instagram: req.body.instagram,
                twitter: req.body.twitter,
                Theme: {
                    update: {
                        primaryColor: req.body.primaryColor,
                        secondaryColor: req.body.secondaryColor,
                        updatedAt: new Date(),
                    }
                },
                Address: {
                    deleteMany: {},
                    create: req.body.Address.map((address: any) => ({
                        street: address.street,
                        number: address.number,
                        city: address.city,
                        state: address.state,
                        zip: address.zip,
                        main: address.main,
                        updatedAt: new Date(),
                    }))
                },
                Contact: {
                    deleteMany: {},
                    create: req.body.Contact.map((contact: any) => ({
                        phone: contact.phone,
                        email: contact.email,
                        main: contact.main,
                        updatedAt: new Date(),
                    }))
                },
            }

            if(file){
                (storeAlterData as any).Upload = {
                    create: {
                        name: (file as any).originalname, 
                        key: (file as any).key,
                        url: (file as any).location,
                        updatedAt: new Date(),
                    }
                }
            }

            const storeAlter = await prisma.store.update({
                where: {
                    id
                },
                data: storeAlterData
            });
            return res.json(storeAlter);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Error inesperado",
                error: error
            });
        }
    }
}