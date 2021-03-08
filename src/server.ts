import 'dotenv/config';
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import routes from "./routes";
import path from "path";
import cors from "cors";

import "./database/connection";
import errorHandler from "./errors/handler";
import { AppError } from "./errors/AppError";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(routes);
app.use('/files',
    express.static(path.resolve(__dirname, '..', 'tmp', 'uploads')))
// app.use(errorHandler);

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message
        })
    }

    return res.status(500).json({
        status: 'Error',
        message: `Internal server error ${err.message}`
    })
})

app.listen(process.env.PORT || 3333);
