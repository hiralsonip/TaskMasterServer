const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TasksSchema = new Schema({
  task_id: {
    type: Schema.Types.ObjectId,
    ref: "task",
  },
  user_id: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ["high", "medium", "low"],
    required: true,
  },
  status: {
    type: String,
    enum: ["todo", "inProgress", "completed"],
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  subtasks: [
    {
      type: Schema.Types.ObjectId,
      ref: "subtasks",
    },
  ],
});

module.exports = Tasks = mongoose.model("tasks", TasksSchema);
