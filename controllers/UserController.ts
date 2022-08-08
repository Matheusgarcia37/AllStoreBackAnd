import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient()

class UserController {
    async store(req: Request, res: Response) {
        const { username, password, email, storeId, typeOfUser } = req.body;
    
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
                email: email,
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
            const user: any = await prisma.user.findUnique({
                where: { id }
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
}

export default new UserController();