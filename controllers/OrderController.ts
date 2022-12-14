import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

class OrderController {
    async order(req: Request, res: Response){
       const { productId, clientId, value } = req.body;
         try {
            const openOrder = await prisma.orders.findFirst({
                where: {
                    User: {
                        id: clientId
                    },
                    finished: false
                }
            });
            if(openOrder){
                return res.status(400).json({ error: "Você ainda não finalizou seu carrinho" });
            }
            const order = await prisma.orders.create({
                data: {
                    User: {
                        connect: {
                            id: clientId
                        }
                    },
                    finished: false,
                    updatedAt: new Date(),
                }
            });
            if(order)
                await prisma.ordersOnProduct.create({
                    data: {
                        quantity: 1,
                        Orders: {
                            connect: {
                                id: order.id
                            }
                        },
                        Product: {
                            connect: {
                                id: productId
                            }
                        },
                        updatedAt: new Date(),
                    }
                });
            return res.status(200).json(order);
         } catch (error: any) {
            return res.status(400).json({ error: error.message });
         }
    }

    async getCurrentOrder(req: Request, res: Response){
        const { userId } = req.params;
        try {
            const order = await prisma.orders.findFirst({
                where: {
                    User: {
                        id: userId,
                    },
                    finished: false
                },
                include: {
                  Products: {
                    include: {
                        Product: {
                            include: {
                                Upload: true
                            }
                        },
                    }
                  },
                }
            });
            return res.status(200).json(order);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async addProduct(req: Request, res: Response){
        const { orderId, productId } = req.body;
        try {
            const getProduct = await prisma.product.findFirst({
                where: {
                    id: productId
                }
            });

            //verificar se o produto tem estoque suficiente
            if(getProduct) {
                if(getProduct.stock < 1) {
                    return res.status(400).json({ error: "Produto sem estoque" });
                }
            } else {
                return res.status(400).json({ error: "Produto não encontrado" });
            }

            const existOrder = await prisma.ordersOnProduct.findFirst({
                where: {
                    orderId: orderId,
                    productId: productId,
                    Orders: {
                        finished: false,
                    }
                },
            });

            if(existOrder){

                await prisma.ordersOnProduct.update({
                    where: {
                        orderId_productId: {
                            orderId: orderId,
                            productId: productId,
                        }
                    },
                    data: {
                        quantity: {
                            increment: 1
                        },
                        updatedAt: new Date(),
                    }
                });
                return res.status(200).json({ message: "Produto adicionado ao carrinho" });
            }
            const order = await prisma.ordersOnProduct.create({
                data: {
                    quantity: 1,
                    Orders: {
                        connect: {
                            id: orderId
                        }
                    },
                    Product: {
                        connect: {
                            id: productId
                        }
                    },
                    updatedAt: new Date(),
                }
            });
            return res.status(200).json(order);
        } catch (error: any) {
            console.log(error);
            return res.status(400).json({ error: error.message });
        }
    }

    async removeProduct(req: Request, res: Response){
        const { orderId, productId } = req.body;
        try {
            const order = await prisma.ordersOnProduct.deleteMany({
                where: {
                    orderId: orderId,
                    productId: productId,
                }
            });
            return res.status(200).json(order);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async finishOrder(req: Request, res: Response){
        const { orderId } = req.body;
        try {
            const getOrderToFinish = await prisma.orders.findFirst({
                where: {
                    id: orderId,
                    finished: false,
                },
                include: {
                    Products: {
                        include: {
                            Product: true
                        }
                    },
                }
            });

            if(getOrderToFinish){
                getOrderToFinish.Products.forEach((OrderProduct: any) => {
                    if(OrderProduct.Product.stock < OrderProduct.quantity){
                        return res.status(400).json({ error: `Produto ${OrderProduct.Product.name} sem estoque` });
                    }
                });
            } else {
                return res.status(400).json({ error: "Pedido não encontrado" });
            }

            const order = await prisma.orders.update({
                where: {
                    id: orderId
                },
                data: {
                    finished: true,
                    updatedAt: new Date(),
                    createdAt: new Date(),
                }
            });

            return res.status(200).json(order);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async approveOrder(req: Request, res: Response){
        const { orderId } = req.body;
        try {
            //verificar se os produtos tem estoque suficiente
            const getOrderToApprove = await prisma.orders.findFirst({
                where: {
                    id: orderId,
                    finished: true,
                },
                include: {
                    Products: {
                        include: {
                            Product: true
                        }
                    },

                }
            });

            if(getOrderToApprove){
                getOrderToApprove.Products.forEach((OrderProduct: any) => {
                    if(OrderProduct.Product.stock < OrderProduct.quantity){
                        return res.status(400).json({ error: `Produto ${OrderProduct.Product.name} sem estoque` });
                    }
                });
            } else {
                return res.status(400).json({ error: "Pedido não encontrado" });
            }

            const order = await prisma.orders.update({
                where: {
                    id: orderId
                },
                data: {
                    approved: true,
                    updatedAt: new Date(),
                }
            });

            //atualizar estoque
            getOrderToApprove.Products.forEach(async (OrderProduct: any) => {
                await prisma.product.update({
                    where: {
                        id: OrderProduct.Product.id
                    },
                    data: {
                        stock: Number(OrderProduct.Product.stock) - Number(OrderProduct.quantity),
                        updatedAt: new Date(),
                    }
                });
            });
            return res.status(200).json(order);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async cancelOrder(req: Request, res: Response){
        const { orderId } = req.body;
        try {
            const order = await prisma.orders.update({
                where: {
                    id: orderId
                },
                data: {
                    approved: false,
                    updatedAt: new Date(),
                }
            });
            return res.status(200).json(order);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });  
        }
    }

    async incrementProducts(req: Request, res: Response){
        const { orderId, productId } = req.body;
        try {
            const orderToUpdate = await prisma.ordersOnProduct.findFirst({
                where: {
                    orderId: orderId,
                    productId: productId,
                    Orders: {
                        finished: false,
                    }
                },
                include: {
                    Product: true
                }
            });

            //verificar se o produto tem estoque suficiente
            if(orderToUpdate && orderToUpdate.Product) {
                const currentQuantity = orderToUpdate.quantity + 1;
                if(currentQuantity > orderToUpdate.Product.stock){
                    return res.status(400).json({ error: "Não há estoque suficiente para este produto" });
                }
            }
            
            const order = await prisma.ordersOnProduct.updateMany({
                where: {
                    orderId: orderId,
                    productId: productId,
                },
                data: {
                    quantity: {
                        increment: 1,
                    },
                    updatedAt: new Date(),
                }
            });
            return res.status(200).json(order);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async decrementProducts(req: Request, res: Response){
        const { orderId, productId } = req.body;
        //verificar se a quantidade é maior que 1

        try {
            const verifyOrder = await prisma.ordersOnProduct.findFirst({
                where: {
                    orderId: orderId,
                    productId: productId,
                },
            });

            if(verifyOrder?.quantity === 1){
                await prisma.ordersOnProduct.deleteMany({
                    where: {
                        orderId: orderId,
                        productId: productId,
                    }
                });
                return res.status(200).json({ message: "Produto removido do carrinho" });
            }

            const order = await prisma.ordersOnProduct.updateMany({
                where: {
                    orderId: orderId,
                    productId: productId,
                },
                data: {
                    quantity: {
                        decrement: 1,
                    },
                    updatedAt: new Date(),
                }
            });
            return res.status(200).json(order);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    async getOrders(req: Request, res: Response){
        const { userId } = req.params;
        try {
            const orders = await prisma.orders.findMany({
                where: {
                    User: {
                        id: userId,
                        typeOfUser: "user"
                    },
                    finished: true
                },
                include: {
                    Products: {
                        include: {
                            Product: {
                                include: {
                                    Upload: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    updatedAt: "desc"
                }
            });
            return res.status(200).json(orders);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
    
    async getOrdersFromStore(req: Request, res: Response){
        const { storeId, skip, limit , status, startDate, endDate} = req.body;
        //set start hour for start date
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        //set end hour for end date
        const end = new Date(endDate);
        end.setHours(23,59,59,999);

        try {
            const orders = await prisma.$transaction(
                [
                    prisma.orders.count({
                        where: {
                            User: {
                                Store: {
                                    id: storeId
                                }
                            },
                            finished: true,
                            approved: status === "Todos" ? undefined : status,
                            createdAt: {
                                gte: start,
                                lte: end
                            }
                        },
                    }),
                    prisma.orders.findMany({
                        where: {
                            User: {
                                Store: {
                                    id: storeId
                                }
                            },
                            finished: true,
                            approved: status === "Todos" ? undefined : status,
                            createdAt: {
                                gte: start,
                                lte: end
                            }
                        },
                        include: {
                            Products: {
                                include: {
                                    Product: {
                                        include: {
                                            Upload: true
                                        }
                                    }
                                }
                            },
                            User: {
                                include: {
                                    Person: true
                                }
                            }
                        },
                        orderBy: {
                            updatedAt: "desc"
                        },
                        skip: skip,
                        take: limit       
                    })
                ]
            );
            return res.status(200).json(orders);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

}

export default new OrderController();