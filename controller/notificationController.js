const School = require('../model/school'); // User model
const Notification = require('../model/notifcation');
const express = require("express");
const Event = require('../model/calendar');
const moment = require('moment');
const cron = require('node-cron');
const admin = require("firebase-admin");

//const serviceAccount = require("../servicejson/champvistaapp-firebase-adminsdk-fbsvc-a6b901b7b7.json");
const app = express.Router();
const User = require('../model/user');
// const admin = require("firebase-admin");

// const serviceAccount = JSON.parse(
//     Buffer.from(process.env.FIREBASE_CONFIG, "base64").toString("utf-8")
// );


// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });




app.get('/notifications/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // ✅ Fetch user role from database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        let notifications;
        if (user.role === 'Admin') {
            // ✅ If user is admin, fetch all notifications
            notifications = await Notification.find().sort({ createdAt: -1 });
        } else {
            // ✅ If normal user, fetch only their unread notifications
            notifications = await Notification.find({ userId, status: 'unread' }).sort({ createdAt: -1 });
        }

        res.json({ success: true, notifications });
    } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// ✅ Mark Notification as Read
app.put('/notifications/:id/read', async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { status: 'read' });
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error("❌ Error marking notification as read:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ✅ Function: Send Firebase Notification
const sendFCMNotification = async (deviceToken, title, body) => {
    if (!deviceToken) return console.warn("⚠️ No Device Token Found");

    const message = {
        token: deviceToken,
        notification: { title, body },
        data: { click_action: "FLUTTER_NOTIFICATION_CLICK" },
    };

    try {
        await admin.messaging().send(message);
        console.log(`✅ Notification Sent: ${title}`);
    } catch (error) {
        console.error('❌ Error Sending Notification:', error);
    }
};


// ✅ Cron Job: Run Every Midnight
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('🔄 Running Scheduled Notification Task...');

        const today = moment().startOf('day');
        const tenDaysLater = moment().add(10, 'days');

        // ✅ 1️⃣ **Filter Only Plans Expiring in Next 10 Days**
        const usersWithExpiringPlans = await School.find({
            planExpiry: { $gte: today.toDate(), $lte: tenDaysLater.toDate() }
        });

        for (let user of usersWithExpiringPlans) {
            // 🚀 **Check if Notification Already Sent**
            const existingNotification = await Notification.findOne({
                userId: user._id,
                type: 'plan_expiry',
                message: { $regex: user.planExpiry, $options: 'i' }, // Avoid duplicate messages
            });

            if (!existingNotification) {
                await Notification.create({
                    userId: user._id,
                    message: `Your plan is expiring on ${moment(user.planExpiry).format('DD MMM YYYY')}. Please renew it.`,
                    type: 'plan_expiry'
                });

                if (user.deviceToken) {
                    await sendFCMNotification(user.deviceToken, "Plan Expiry", `Your plan expires on ${moment(user.planExpiry).format('DD MMM YYYY')}`);
                }
            }
        }

        // ✅ 2️⃣ **Events Reminder for Next Day**
        const eventsTomorrow = await Event.find({
            eventDate: { $eq: moment().add(1, 'days').startOf('day').toDate() } // Only events happening tomorrow
        });

        for (let event of eventsTomorrow) {
            const user = await School.findById(event.userId);
            if (!user) continue;

            // 🚀 **Check if Event Notification Already Sent**
            const existingEventNotification = await Notification.findOne({
                userId: event.userId,
                type: 'event_reminder',
                message: { $regex: event.title, $options: 'i' }
            });

            if (!existingEventNotification) {
                await Notification.create({
                    userId: event.userId,
                    message: `Reminder: ${event.title} is scheduled on ${moment(event.eventDate).format('DD MMM YYYY')}`,
                    type: 'event_reminder'
                });

                if (user.deviceToken) {
                    await sendFCMNotification(user.deviceToken, "Event Reminder", `Reminder: ${event.title} on ${moment(event.eventDate).format('DD MMM YYYY')}`);
                }
            }
        }

        console.log('✅ Notifications Updated Successfully!');
    } catch (error) {
        console.error('❌ Error in Notification Cron:', error);
    }
});
module.exports = app;
