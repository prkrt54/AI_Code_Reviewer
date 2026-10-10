import mongoose from 'mongoose';



const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [ true, 'Project name is required' ],
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [ true, 'Project owner is required' ],
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    code: {
        type: String,
        default: ""
    },
    review: {
        type: String,
        default: ""
    }
}, {
    timestamps: true, // kb creta hua tha upadate kb hua tha ye store karega
})

const projectModel = mongoose.model('Project', projectSchema)

export default projectModel