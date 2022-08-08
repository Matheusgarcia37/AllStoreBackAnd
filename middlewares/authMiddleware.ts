import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface TokenPayLoad {
    id: string;
    username: string;
    iat: number;
    exp: number;
}
interface RequestAuxProps {
    userId: string;
    username: string;
}
export default function authMiddleware(
    req: any, res: Response, next: NextFunction
) {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({
            error: "Token not provided"
        });
    }

    const [, token] = authorization.split(" ");

    if (!token) {
        return res.status(401).json({
            error: "Token not provided"
        });
    }

    try {
        const data = jwt.verify(token, process.env.APP_SECRET || "");

        const { id, username } = data as TokenPayLoad;
        req.userId = id;
        req.username = username;
    
        return next();
    } catch (error: any) {
        return res.status(401).json({
            error: "Token invalid"
        });
    }
   
}