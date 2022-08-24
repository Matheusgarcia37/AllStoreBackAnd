import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express';
const prisma = new PrismaClient()

class TagsController {
    async tag(req: Request, res: Response) {
        const { name, storeId } = req.body;
    
        const tagExist = await prisma.tag.findFirst({
            where: {
                name,
                Store: {
                    id: storeId
                }
            }
        })
        if(tagExist) {
            return res.status(400).json({
                error: 'Tag already exists'
            });
        }

        const tag = await prisma.tag.create({
            data: {
                name,
                updatedAt: new Date(),
                Store: {
                    connect: {
                        id: storeId
                    }
                }
            }
        });

        return res.json(tag);
    }

    async alter(req: Request, res: Response) {
        const { id, name } = req.body;
        try {
            const tag: any = await prisma.tag.findUnique({
                where: { id }
            })
            if(tag){
                tag.name = name;
                await prisma.tag.update({
                    where: {
                        id
                    },
                    data: tag
                });
                return res.status(200).json({
                    message: 'Tag alterada'
                });
            }else {
                return res.status(400).json({
                    error: 'Tag não encontrada'
                });
            }
        }catch (error) {
            console.log(error);
            return res.status(400).json({
                error: 'Tag não encontrada'
            });
        }
    }

    async index(req: Request, res: Response) {
        const { storeId } = req.params;
        const tags = await prisma.tag.findMany({
            where: {
                Store: {
                    id: storeId
                }
            }
        });
        return res.json(tags);
    }

    
    async delete(req: Request, res: Response) {
        const { id } = req.body;
        try {
            await prisma.tag.delete({
                where: {
                    id
                }
            });
            return res.status(200).json({
                message: 'Tag deletada'
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({
                error: 'Tag não encontrada'
            });
        }
    }
}

export default new TagsController();