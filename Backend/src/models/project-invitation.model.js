import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project is required'],
    },
    inviter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Inviter is required'],
    },
    invitee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Invitee is required'],
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
        required: true,
    },
}, {
    timestamps: true,
});

invitationSchema.index(
    { project: 1, invitee: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'pending' } }
);

const projectInvitationModel = mongoose.model('ProjectInvitation', invitationSchema);

export default projectInvitationModel;
