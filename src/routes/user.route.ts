import { Router } from "express";
import { createUser } from "../controllers/user.controller";
const router = Router();

router.route('/sign-up').post(createUser);


export default router;