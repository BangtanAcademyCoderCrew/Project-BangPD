const fs = require('fs');

const scheduledJobsDirectory = './scheduledJobs';
const scheduledJobFiles = fs.readdirSync(scheduledJobsDirectory).filter(file => file.endsWith('.js'));

module.exports = {
    startScheduledJobs: async (client) => {
        try {
            scheduledJobFiles.forEach((file) => {
                const job = require(`${scheduledJobsDirectory}/${file}`);
                job.start(client);
            });
        } catch (error) {
            console.error(error);
        }
    }
};
