import {
    createProject,
    getAllProjects,
    getProjectById,
    createProjectInvitation,
    getPendingInvitations,
    updateInvitationStatus,
} from "../services/project.service.js";




export async function createProjectController(req, res) {

    const { projectName } = req.body;

    const newProject = await createProject(projectName, req.userId);

    return res.status(201).json({
        status: "success",
        data: newProject,
    });
}

export async function getAllProjectsController(req, res) {
    const projects = await getAllProjects(req.userId);

    return res.status(200).json({
        status: "success",
        data: projects,
    });
}

export async function getProjectController(req, res) {
    const project = await getProjectById(req.params.projectId, req.userId);

    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json({
        status: "success",
        data: project,
    });
}

export async function createInvitationController(req, res) {
    try {
        const invitation = await createProjectInvitation(
            req.params.projectId,
            req.userId,
            req.body.email
        );

        return res.status(201).json({
            status: "success",
            data: invitation,
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

export async function getPendingInvitationsController(req, res) {
    const invitations = await getPendingInvitations(req.userId);

    return res.status(200).json({
        status: "success",
        data: invitations,
    });
}

export async function updateInvitationController(req, res) {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid invitation status' });
    }

    try {
        const invitation = await updateInvitationStatus(
            req.params.invitationId,
            req.userId,
            status
        );

        return res.status(200).json({
            status: "success",
            data: invitation,
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}