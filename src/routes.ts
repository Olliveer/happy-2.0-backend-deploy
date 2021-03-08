import { Router } from "express";
import multer from "multer";
import config from './config/multer';
import OrphanagesController from "./controllers/OrphanagesController";
import UsersController from "./controllers/UsersController";
import auth from "./middlewares/auth";

const routes = Router();

process.on("unhandledRejection", (err) => console.error(err));

// MVC

// Model
// Views
// Controllers

//AUTH ROUTES
routes.post("/login", UsersController.authenticate);
routes.post("/forgot", UsersController.forgot);
routes.post("/reset", UsersController.reset);

routes.post("/orphanages", multer(config).array("images"), OrphanagesController.create);
routes.get("/orphanages/:id", OrphanagesController.show);
routes.get("/orphanages", OrphanagesController.index);



//ADMIN ROUTES
routes.use(auth);
routes.post("/orphanage/delete/:id", OrphanagesController.delete);
routes.get("/pending", OrphanagesController.indexPending);
routes.put("/pending/:id", OrphanagesController.pending);
routes.put("/orphanage/edit", multer(config).array("images"), OrphanagesController.update);
routes.get("/users", UsersController.index);
routes.get("/users/:id", UsersController.show);
routes.post("/register", UsersController.create);
routes.put("/user", UsersController.update);
routes.post("/user/delete/:id", UsersController.delete);





export default routes;
