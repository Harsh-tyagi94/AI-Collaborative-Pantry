import { Router } from "express";
import { getAboutMe, getUserHistory, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router()

userRouter.route('/').get((req, res) => {
    res.send('user route is working')
})

userRouter.route('/signup').post(registerUser)
userRouter.route('/login').post(loginUser)
userRouter.route('/logout').post(verifyJWT, logoutUser);
userRouter.route("/history").get(verifyJWT, getUserHistory);
userRouter.route("/aboutme").get(verifyJWT, getAboutMe);

export default userRouter;