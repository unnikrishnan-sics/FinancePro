const express = require('express');
const router = express.Router();
const { getGoals, createGoal, addContribution, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getGoals)
    .post(createGoal);

router.route('/contribution')
    .post(addContribution);

router.route('/:id')
    .delete(deleteGoal);

module.exports = router;
