import { Router } from "express";
import {
    createProjectController,
    getAllProjectsController,
    getProjectController,
    createInvitationController,
    getPendingInvitationsController,
    updateInvitationController,
} from "../controllers/project.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();



router.use(authMiddleware);

router.post("/create", createProjectController)

router.get('/get-all', getAllProjectsController)

router.get('/invitations/pending', getPendingInvitationsController)

router.post('/:projectId/invitations', createInvitationController)

router.patch('/invitations/:invitationId', updateInvitationController)

router.get('/:projectId', getProjectController)

export default router;