const NotificationService = {
    // Send notification (placeholder - would integrate with push/email/SMS)
    sendNotification: async (userId, message, type = 'general') => {
        console.log(`📬 Notification to user ${userId}: ${message}`);
        
        // In production: integrate with Firebase Cloud Messaging, Twilio, etc.
        return {
            userId,
            message,
            type,
            sent_at: new Date(),
            status: 'sent'
        };
    },

    // Queue daily quest reminder
    sendDailyQuestReminder: async (userId) => {
        return NotificationService.sendNotification(userId, 'Выполни ежедневный квест и получи бонусы!', 'daily_quest');
    },

    // Reactivation notification
    sendReactivationNotification: async (userId) => {
        return NotificationService.sendNotification(userId, 'Мы скучаем! Загляни в приложение – получи 100 бонусов', 'reactivation');
    }
};

module.exports = NotificationService;
