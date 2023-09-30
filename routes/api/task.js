const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
var cookie = require("cookie-parser");
const jsonwt = require("jsonwebtoken");
const passport = require("passport");
const moment = require("moment");
require("../../strategies/jsonwtStrategy")(passport);

router.use(cookie());

// Get settings
const settings = require("../../config/settings");

const Task = require("../../models/Task");
const req = require("express/lib/request");
const res = require("express/lib/response");
const SubTask = require("../../models/SubTask");

router.use(cookie());

// Test api
router.get("/get", (req, res) => {
    res.send("Krimi Patel");
});

// Display all Tasks
// URL : task/getAllTask
router.get(
    "/getAllTask",
    // passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const tasks = await Task.find({})
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        res.json({
            status: 200,
            success: true,
            data: tasks,
        });
    }
);

// Display a single Task
// URL : task/getTask   
router.get("/getTask/:id",
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {

        const task = await Task
            .findById(req.params.id)
            .populate({
                path: "subtasks", // Populate the subtasks field
                model: "subtasks"
            })
            .exec();

        res.json({
            status: 200,
            success: true,
            data: task,
        });
    }
);

async function addSubTask(subtaskData) {
    try {
        const subtask = await SubTask.create(subtaskData);
        return subtask;
    } catch (error) {
        throw error;
    }
}

// Add Task
// URL : task/add-task
// Add task and sub task together
router.post(
    "/add-task",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            // console.log(req.user.id);
            if (
                !req.body ||
                !req.body.task_id ||
                !req.body.title ||
                !req.body.description ||
                !req.body.priority ||
                !req.body.status ||
                !req.body.start_date ||
                !req.body.end_date
            ) {
                res.status(400).send("Invalid request body");
            } else {
                const task = await Task.create({
                    task_id: req.body.task_id,
                    title: req.body.title,
                    description: req.body.description,
                    priority: req.body.priority,
                    status: req.body.status,
                    start_date: req.body.start_date,
                    end_date: req.body.end_date,
                    user_id: req.user.id,
                    subtasks: [],
                });

                if (req.body.subtasks && req.body.subtasks.length > 0) {
                    const subtasks = [];
                    for (const subtaskData of req.body.subtasks) {
                        subtaskData.task = task._id;
                        const subtask = await addSubTask(subtaskData);
                        subtasks.push(subtask);
                    }
                    task.subtasks = subtasks;

                    // add sub task array in task
                    Task.findOneAndUpdate(
                        { _id: task._id },
                        { subtasks: subtasks },
                        { new: true }
                    ).exec();
                }

                res.status(200).json({
                    status: 200,
                    message: "Task added successfully",
                    data: task,
                    subtask: task.subtasks,
                });
            }
        } catch (err) {
            res.status(500).send(err.message);
        }
    }
);

// Display all Tasks with Subtasks
// URL: task/getAllTask
router.get(
    "/getAllUserTask",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        const page = parseInt(req.query.page);
        const perPage = parseInt(req.query.perPage);
        const priority = req.query.priority;
        const endDate = req.query.endDate;
        const sort_field = req.query.sort_field;
        const status = req.query.status;

        try {
            const userId = req.user.id; // Get the current user's ID
            console.log(userId);
            let query = { user_id: userId };
            if (priority) {
                query.priority = priority;
            }

            if (status) {
                query.status = status;
            }

            if (endDate) {
                // Additional condition to filter tasks based on end date
                const today = moment()
                    .startOf("day")
                    .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
                query.end_date = { $lte: today };
            }

            const tasks = await Task.find(query) // Find tasks with the current user's ID
                .sort({ [sort_field]: -1 })
                .skip((page - 1) * perPage)
                .limit(perPage)
                .populate({
                    path: "subtasks", // Populate the subtasks field
                    model: "subtasks", // Specify the model name
                }) // Populate the subtasks field
                .exec();

            if (tasks.length === 0) {
                return res.json({
                    status: 200,
                    success: true,
                    message: "No tasks found for the current user",
                });
            }

            console.log(tasks.length);
            res.json({
                status: 200,
                success: true,
                count: tasks.length,
                data: tasks,
            });
        } catch (err) {
            res.status(500).send(err.message);
        }
    }
);

// Add Task
// URL: task/addTask
router.post(
    "/addTask",
    passport.authenticate('jwt', { session: false }),
    express.json(), // Add this line
    async (req, res) => {
        console.log(req.body);
        if (
            //!req.body.task_id || Remove this line
            //!req.body.user_id ||
            !req.body.title ||
            !req.body.description ||
            !req.body.priority ||
            !req.body.status ||
            !req.body.start_date ||
            !req.body.end_date
        ) {
            const missingFields = [];
            // if (!req.body.task_id) missingFields.push("task_id"); Remove this line
            // Add similar lines for other required fields

            res.status(400).json({
                error: "Invalid request body",
                missingFields: missingFields,
            });
        } else {
            Task.create({
                // task_id: req.task.task_id,
                //user_id: req.body.user_id,
                title: req.body.title,
                description: req.body.description,
                priority: req.body.priority,
                status: req.body.status,
                start_date: req.body.start_date,
                end_date: req.body.end_date,
                user_id: req.user.id,
                // user_id: req.user.id
            })
                .then((task) =>
                    res.status(200).json({
                        staus: 200,
                        message: "Task added successfully",
                        data: task,
                    })
                )
                .catch((err) => res.status(500).send(err.message));
        }
    }
);

// Update Task
// URL : task/updateTask
router.put("/updateTask/:_id",
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {

        console.log("hiral");
        console.log(req.body.title);

        const updateFields = {};
        if (req.body.user_id) {
            updateFields.user_id = req.body.user_id;
        }
        if (req.body.title) {
            updateFields.title = req.body.title;
        }
        if (req.body.description) {
            updateFields.description = req.body.description;
        }
        if (req.body.priority) {
            updateFields.priority = req.body.priority;
        }
        if (req.body.status) {
            updateFields.status = req.body.status;
        }
        if (req.body.start_date) {
            updateFields.start_date = req.body.start_date;
        }
        if (req.body.end_date) {
            updateFields.end_date = req.body.end_date;
        }

        Task
            .updateOne({ _id: req.params._id }, { $set: updateFields })
            .exec()
            .then((task =>
                res.status(200)
                    .json({
                        status: 200,
                        message: 'Task updated successfully',
                        data: task
                    })))
            .catch((err) => res.status(500).send(err.message));

    });

// Delete Task
// URL : task/deleteTask
// router.delete("/deleteTask/:task_id",
//     passport.authenticate('jwt', { session: false }),
//     async (req, res) => {

//         Task
//             .deleteOne({ task_id: req.params.task_id })
//             .exec()
//             .then(() => {
//                 res.json({
//                     status: 200,
//                     success: true,
//                     message: 'Task deleted successfully'
//                 });
//             })
//             .catch((err) => res.status(500).send(err.message));
//     });

router.delete(
    "/:_id",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {
            const deletedTask = await Task.findByIdAndDelete(req.params._id);

            if (deletedTask) {
                return res.json({
                    status: 200,
                    success: true,
                    message: "Task deleted successfully",
                });
            } else {
                return res.status(404).json({
                    status: 404,
                    success: false,
                    message: "Task not found",
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: 500,
                success: false,
                message: error.message,
            });
        }
    }
);

module.exports = router;
