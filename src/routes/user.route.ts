import { Router } from "express";
import { createUser  , loginUser, logout} from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
const router = Router();

router.route('/sign-up').post(createUser);
router.route('/login').post(loginUser)
router.route("/logout").post(verifyJWT , logout)

export default router;