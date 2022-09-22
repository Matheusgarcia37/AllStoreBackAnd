import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express';
const prisma = new PrismaClient()

class ProductsController {
    async product(req: Request, res: Response) {
        req.body = JSON.parse(req.body.data);
        const { name, description, featured, price, stock, storeId, tags } = req.body;
        
        const files = req.files as Express.Multer.File[];
        console.log(req.body, files);
    
        try {
            const store = await prisma.store.findUnique({
                where: {
                    id: storeId,
                }
            });
            if (!store) {
                return res.status(400).json({
                    error: 'Store not found'
                });
            }
            const productExist = await prisma.product.findFirst({
                where: {
                    name,
                    Store: {
                        id: storeId
                    }
                },
            });
            if (productExist) {
                return res.status(400).json({
                    error: 'Product already exists'
                });
            }
            const priceNumber = Number(price);

            const productData = {
                name,
                description,
                price: priceNumber,
                featured: featured,
                stock: Math.floor(Number(stock)),
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

            if(files) {
                (productData as any).Upload = {
                    create: files.map((file: any) => ({
                        name: (file as any).originalname, 
                        key: (file as any).key,
                        url: (file as any).location,
                        updatedAt: new Date(),
                    }))
                }
            }
            const product = await prisma.product.create({
                data: productData
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

        req.body = JSON.parse(req.body.data);
        const { name, description, price, featured, tags, stock } = req.body;

        const files = req.files as Express.Multer.File[];
        try {
            const product = await prisma.product.findUnique({
                where: {
                    id
                },
                include: {
                    Tag: true,
                    Store: true
                }
            });
            if (!product) {
                return res.status(400).json({
                    error: 'Product not found'
                });
            }
            const priceNumber = Number(price);
            const productExist = await prisma.product.findFirst({
                where: {
                    name,
                    Store: {
                        id: product.Store.id
                    }
                }
            });
            if (productExist && productExist.id !== id) {
                return res.status(400).json({
                    error: 'Product already exists'
                });
            }
            //desconectar todas as tags antigas, e conectar as novas
            const productAlterData =  {
                name,
                description,
                price: priceNumber,
                featured: featured,
                stock: Math.floor(Number(stock)),
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
            console.log(files)
            if(files) {
                (productAlterData as any).Upload = {
                    deleteMany: {},
                    create: (files as any).map((file: any) => ({
                        name: (file as any).originalname,
                        key: (file as any).key,
                        url: (file as any).location,
                        updatedAt: new Date(),
                    }))
                }
            }
            const productAlter = await prisma.product.update({
                where: {
                    id
                },
                data: productAlterData
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
        const { storeId, skip, limit, tagSelected, search} = req.body;
        let products = null;
        if(tagSelected && tagSelected.value !== null){
            products = await prisma.$transaction([
                prisma.product.count({
                    where: {
                        Store: {
                            id: storeId
                        },
                        name: {
                            contains: search
                        },
                        Tag: {  
                            some: {
                                name: {contains: tagSelected ? tagSelected.name : ''}
                            }
                        }
                    }
                }),
                prisma.product.findMany({
                    where: {
                        Store: {
                            id: storeId
                        },
                        name: {
                            contains: search
                        },
                        Tag: {
                            some: {
                                name: {contains: tagSelected ? tagSelected.name : ''}
                            }
                        }
                    },
                    include: {
                        Tag: true,
                        Upload: true
                    },
                    skip: skip,
                    take: limit,
                    orderBy: {
                        updatedAt: 'desc'
                    }
                })
            ]);
        } else {
            products = await prisma.$transaction([
                prisma.product.count({
                    where: {
                        Store: {
                            id: storeId
                        },
                        name: {
                            contains: search
                        },
                    }
                }),
                prisma.product.findMany({
                    where: {
                        Store: {
                            id: storeId
                        },
                        name: {
                            contains: search
                        },
                    },
                    include: {
                        Tag: true,
                        Upload: true
                    },
                    skip: skip,
                    take: limit,
                    orderBy: {
                        updatedAt: 'desc'
                    }
                })
            ]);
        }
       
        return res.json(products);
    }

    async getFeaturedProducts(req: Request, res: Response) {
        const { storeId } = req.body;
        const products = await prisma.product.findMany({
            where: {
                Store: {
                    id: storeId
                },
                featured: true,
            },
            include: {
                Tag: true,
                Upload: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })
        return res.json(products);
    }

    async getBydId(req: Request, res: Response) {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: {
                id
            },
            include: {
                Tag: true,
                Upload: true
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