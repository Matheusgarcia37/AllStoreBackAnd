import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient()

class UserController {
    async store(req: Request, res: Response) {
        const { username, password, storeId, typeOfUser } = req.body;
    
        const userExist = await prisma.user.findFirst({
            where: {
                username
            }
        })
        if(userExist) {
            return res.status(400).json({
                error: 'User already exists'
            });
        }

        //hash password
        const hash = await bcrypt.hash(password, 8);

        const user = await prisma.user.create({
            data: {
                username,
                password: hash,
                updatedAt: new Date(),
                typeOfUser: typeOfUser,
                Store: {
                    connect: {
                        id: storeId
                    }
                }
            }
        });

        return res.json(user);
    }

    async alter(req: Request, res: Response) {
        const { id, username, password } = req.body;
        try {
            const user: any = await prisma.user.findUnique({
                where: { id }
            })
            if(user){
                user.username = username;
                user.password = await bcrypt.hash(password, 8);
                await prisma.user.update({
                    where: {
                        id
                    },
                    data: user
                });
                return res.status(200).json({
                    message: 'Usuário alterado'
                });
            }else {
                return res.status(400).json({
                    error: 'Usuário não encontrado'
                });
            }
        }catch (error) {
            console.log(error);
            return res.status(400).json({
                error: 'Usuário não encontrado'
            });
        }
    }

    async index(req: Request, res: Response) {
        const users = await prisma.user.findMany();
        return res.json(users);
    }

    async getUserById(req: Request, res: Response) {
        const { id } = req.body;
        try {
            const user: any = await prisma.user.findFirst({
                where: { id, typeOfUser: 'admin' },
                include: {
                    Upload: true,
                    Orders: {
                        where: {
                            finished: false
                        },
                        include: {
                            Products: {
                                include: {
                                    Product: true,
                                }
                            }
                        }
                    }
                }
            })
            if(user){
                delete user.password;
                return res.status(200).json(user);
            }else {
                return res.status(400).json({
                    error: 'Usuário não encontrado'
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                error: 'Usuário não encontrado'
            });
        }
    }
    
    async delete(req: Request, res: Response) {
        const { id } = req.body;
        try {
            await prisma.user.delete({
                where: {
                    id
                }
            });
            return res.status(200).json({
                message: 'Usuário deletado'
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({
                error: 'Usuário não encontrado'
            });
        }
    }

    async changeImageProfile(req: Request, res: Response) {
        const file = req.file;
        const { id } = req.params;
        try {
            const user: any = await prisma.user.findUnique({
                where: { id },
                include: { 
                    Upload: true
                }
            })
            if(user){
                const newUser = await prisma.user.update({
                    where: {
                        id
                    },
                    data: {
                        Upload: {
                            create: {
                                name: (file as any).originalname,
                                key: (file as any).key,
                                url: (file as any).location,
                                updatedAt: new Date(),
                            }
                        }
                    },
                    include: {
                        Upload: true
                    }
                });
                if(newUser && newUser.Upload) {
                    return res.status(200).json({
                        image: newUser.Upload.url
                    });
                } else {
                    return res.status(400).json({
                        error: 'Erro ao alterar imagem'
                    });
                }
            }else {
                return res.status(400).json({
                    error: 'Usuário não encontrado'
                });
            }
        }
        catch (error) {
            console.log(error);
            return res.status(400).json({
                error: 'Usuário não encontrado'
            });
        }
    }

    async storeUserClient(req: Request, res: Response) {
        const { username, password, storeId } = req.body;
        console.log(req.body)
    
        const userExist = await prisma.user.findFirst({
            where: {
                username
            }
        })
        if(userExist) {
            return res.status(400).json({
                error: 'User already exists'
            });
        }

        //hash password
        const hash = await bcrypt.hash(password, 8);

        try{
            const user = await prisma.user.create({
                data: {
                    username,
                    password: hash,
                    updatedAt: new Date(),
                    typeOfUser: 'user',
                    Store: {
                        connect: {
                            id: storeId
                        }
                    }
                }
            });
    
            return res.json(user);
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                error: 'Erro ao criar usuário'
            });
        }
    }
}

export default new UserController();