import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express';
const prisma = new PrismaClient()

class ProductsController {
    async product(req: Request, res: Response) {
        const { name, description, price, storeId, tags } = req.body;

        try {
            const store = await prisma.store.findUnique({
                where: {
                    id: storeId
                }
            });
            if (!store) {
                return res.status(400).json({
                    error: 'Store not found'
                });
            }
            const productExist = await prisma.product.findUnique({
                where: {
                    name
                }
            });
            if (productExist) {
                return res.status(400).json({
                    error: 'Product already exists'
                });
            }
            const priceNumber = Number(price);
            const product = await prisma.product.create({
                data: {
                    name,
                    description,
                    price: priceNumber,
                    updatedAt: new Date(),
                    Store: {
                        connect: {
                            id: storeId
                        }
                    },
                    Tag: {
                        connect: tags.map((tag: string) => ({
                            id: tag
                        }))
                    }
                }
            });

            return res.json(product);

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Error inesperado",
                error: error
            });
        }
    }

    async alter(req: Request, res: Response) {
        const { id } = req.params;
        const { name, description, price, tags } = req.body;
        try {
            const product = await prisma.product.findUnique({
                where: {
                    id
                },
                include: {
                    Tag: true
                }
            });
            if (!product) {
                return res.status(400).json({
                    error: 'Product not found'
                });
            }
            const priceNumber = Number(price);
            const productExist = await prisma.product.findUnique({
                where: {
                    name
                }
            });
            if (productExist && productExist.id !== id) {
                return res.status(400).json({
                    error: 'Product already exists'
                });
            }
            //desconectar todas as tags antigas, e conectar as novas
            const productAlter = await prisma.product.update({
                where: {
                    id
                },
                data: {
                    name,
                    description,
                    price: priceNumber,
                    updatedAt: new Date(),
                    Tag: {
                        disconnect: product.Tag.map((tag: any) => ({
                            id: tag.id
                        })),
                        connect: tags.map((tag: string) => ({
                            id: tag
                        }))
                    }
                }
            });
            return res.json(productAlter);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Error inesperado",
                error: error
            });
        }
    }
                   
    async index(req: Request, res: Response) {
        const { storeId, skip, limit} = req.body;
        const name = '';
        const products = await prisma.$transaction([
            prisma.product.count({
                where: {
                    Store: {
                        id: storeId
                    },
                    name: {
                        contains: name
                    }
                }
            }),
            prisma.product.findMany({
                where: {
                    Store: {
                        id: storeId
                    },
                    name: {
                        contains: name
                    }
                },
                include: {
                    Tag: true,
                },
                skip: skip,
                take: limit,
                orderBy: {
                    updatedAt: 'desc'
                }
            })
        ]);
        return res.json(products);
    }

    async getBydId(req: Request, res: Response) {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: {
                id
            },
            include: {
                Tag: true
            }
        });

        if (!product) {
            return res.status(400).json({
                error: 'Product not found'
            });
        }
        return res.json(product);
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        try {
            await prisma.product.delete({
                where: {
                    id
                }
            });
            return res.status(200).json({
                message: 'Produto deletado'
            });
        } catch (error) {
            console.log(error);
            res.status(400).json({
                error: 'Produto não encontrado'
            });
        }
    }
}

export default new ProductsController();