const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs')
var cookie = require('cookie-parser')
const jsonwt = require('jsonwebtoken')
const passport = require('passport')
require('../../strategies/jsonwtStrategy')(passport)

router.use(cookie())

// Get settings
const settings = require('../../config/settings');

const SubTask = require('../../models/SubTask');
const req = require('express/lib/request')
const res = require('express/lib/response')

router.use(cookie());

// Test api
router.get('/get', (req, res) => {
    res.send('Ruta Timbadiya - N01516674');
});

// Display all Sub Tasks
// URL : subtask/getAllSubTask
router.get("/getAllSubTask",
    // passport.authenticate('jwt', { session: false }),
    async (req, res) => {

        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const subtasks = await SubTask.find({})
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        res.json({
            status: 200,
            success: true,
            data: subtasks
        });
    }
);

// Display a single Sub Task
// URL : subtask/getSubTask
router.get("/getSubTask/:subtask_id",
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {

        const subtask = await SubTask
            .findById(req.params.subtask_id)
            .exec();

        res.json({
            status: 200,
            success: true,
            data: subtask
        });
    }
);

// Add Sub Task
// URL : subtask/addSubTask
router.post("/addSubTask",
    // passport.authenticate('jwt', { session: false }),
    async (req, res) => {

        if (
            !req.body ||
            !req.body.subtask_id ||
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
            SubTask
                .create({
                    subtask_id: req.body.subtask_id,
                    task_id: req.body.task_id,
                    title: req.body.title,
                    description: req.body.description,
                    priority: req.body.priority,
                    status: req.body.status,
                    start_date: req.body.start_date,
                    end_date: req.body.end_date,
                })
                .then((subtask =>
                    res.status(200).
                        json({
                            staus: 200,
                            message: 'Task added successfully',
                            data: task
                        })))
                .catch((err) => res.status(500).send(err.message));
        }
    });

// Update Sub Task
// URL : subtask/updateSubTask
router.put("/updateSubTask/:subtask_id",
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {


        const updateFields = {};
        if (req.body.task_id) {
            updateFields.task_id = req.body.task_id;
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

        SubTask
            .updateOne({ _id: req.params.subtask_id }, { $set: updateFields })
            .exec()
            .then((subtask =>
                res.status(200)
                    .json({
                        staus: 200,
                        message: 'Sub Task updated successfully',
                        data: subtask
                    })))
            .catch((err) => res.status(500).send(err.message));

    });

// Delete Sub Task
// URL : subtask/deleteSubTask
router.delete("/deleteSubTask/:subtask_id",
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {

        SubTask
            .deleteOne({ subtask_id: req.params.subtask_id })
            .exec()
            .then(() => {
                res.json({
                    status: 200,
                    success: true,
                    message: 'Sub Task deleted successfully'
                });
            })
            .catch((err) => res.status(500).send(err.message));
    });


module.exports = router
