const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubTasksSchema = new Schema({

    subtask_id: {
        type: Number,
        required: true
    },
    // task_id: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'tasks',
    //     required: true
    // },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        required: true
    },
    status: {
        type: String,
        enum: ['todo', 'inProgress', 'completed'],
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    task: {
        type: Schema.Types.ObjectId,
        ref: 'tasks'
    }
});

module.exports = SubTask = mongoose.model('subtasks', SubTasksSchema);