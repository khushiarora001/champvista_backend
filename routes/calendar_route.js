const express = require('express');
const router = express.Router();
const calendarController = require('../controller/calenderController');

router.post('/calendar/add', calendarController.addEvent);
router.get('/calendar/:schoolEmail', calendarController.getEventsBySchool);
router.get('/calendar', calendarController.getEventsByDate);
router.put('/calendar/update/:eventId', calendarController.updateEvent);
router.delete('/calendar/delete/:eventId', calendarController.deleteEvent);

module.exports = router;
