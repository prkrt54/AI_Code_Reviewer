import mongoose from "mongoose";
import projectModel from "../models/project.model.js";
import userModel from "../models/user.model.js";
import projectInvitationModel from "../models/project-invitation.model.js";



export async function createProject(projectName, ownerId) {
    const project = await projectModel.create({ name: projectName, owner: ownerId });
    return project;
}


export async function getAllProjects(ownerId) {
    const projects = await projectModel.find({
        $or: [{ owner: ownerId }, { members: ownerId }]
    });
    return projects;
}

export async function getProjectById(projectId, ownerId) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return null;
    }

    return projectModel.findOne({
        _id: projectId,
        $or: [{ owner: ownerId }, { members: ownerId }]
    });
}

function isValidObjectId(value) {
    return mongoose.Types.ObjectId.isValid(value);
}

export async function createProjectInvitation(projectId, inviterId, inviteeEmail) {
    if (!isValidObjectId(projectId) || !isValidObjectId(inviterId)) {
        throw new Error('Invalid project or user');
    }

    const normalizedEmail = typeof inviteeEmail === 'string'
        ? inviteeEmail.trim().toLowerCase()
        : '';

    if (!normalizedEmail) {
        throw new Error('Invitee email is required');
    }

    const project = await projectModel.findOne({ _id: projectId, owner: inviterId }).select('owner members');
    if (!project) {
        throw new Error('Project not found');
    }

    const invitee = await userModel.findOne({ email: normalizedEmail }).select('_id email name');
    if (!invitee) {
        throw new Error('Registered user not found');
    }

    if (String(invitee._id) === String(project.owner)) {
        throw new Error('Project owner cannot be invited');
    }

    if (project.members.some((memberId) => String(memberId) === String(invitee._id))) {
        throw new Error('User is already a project member');
    }

    const existingInvitation = await projectInvitationModel.findOne({
        project: projectId,
        invitee: invitee._id,
        status: 'pending',
    });
    if (existingInvitation) {
        throw new Error('A pending invitation already exists');
    }

    try {
        return await projectInvitationModel.create({
            project: projectId,
            inviter: inviterId,
            invitee: invitee._id,
        });
    } catch (error) {
        if (error?.code === 11000) {
            throw new Error('A pending invitation already exists');
        }
        throw error;
    }
}

export async function getPendingInvitations(userId) {
    return projectInvitationModel.find({
        invitee: userId,
        status: 'pending',
    })
        .populate('project', 'name')
        .populate('inviter', 'name email')
        .sort({ createdAt: -1 });
}

export async function updateInvitationStatus(invitationId, userId, status) {
    if (!isValidObjectId(invitationId) || !isValidObjectId(userId)) {
        throw new Error('Invalid invitation or user');
    }

    const invitation = await projectInvitationModel.findOne({
        _id: invitationId,
        invitee: userId,
        status: 'pending',
    });
    if (!invitation) {
        throw new Error('Pending invitation not found');
    }

    if (status === 'accepted') {
        const project = await projectModel.findOneAndUpdate(
            { _id: invitation.project },
            { $addToSet: { members: userId } },
            { new: true }
        ).select('owner members');
        if (!project) {
            throw new Error('Project not found');
        }
    }

    invitation.status = status;
    await invitation.save();
    return invitation;
}