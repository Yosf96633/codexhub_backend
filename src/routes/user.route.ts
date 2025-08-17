import { Router } from "express";
import { createUser  , loginUser} from "../controllers/user.controller";
const router = Router();

router.route('/sign-up').post(createUser);
router.route('/login').post(loginUser)


export default router;