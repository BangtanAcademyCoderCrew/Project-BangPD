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
    },
    startScheduledJob: async (client, jobName, schedule, server) => {
        try {
            const jobFile = scheduledJobFiles.find((file) => file.includes(jobName));
            if (!jobFile) {
                return false;
            }
            const foundJob = require(`${scheduledJobsDirectory}/${jobFile}`);
            foundJob.start(client, schedule, server);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    stopScheduledJob: async (jobName) => {
        try {
            const jobFile = scheduledJobFiles.find((file) => file.includes(jobName));
            if (!jobFile) {
                return false;
            }
            const foundJob = require(`${scheduledJobsDirectory}/${jobFile}`);
            foundJob.stop();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    },
    runScheduledJob: async (client, jobName, server) => {
        try {
            const jobFile = scheduledJobFiles.find((file) => file.includes(jobName));
            if (!jobFile) {
                return false;
            }
            const foundJob = require(`${scheduledJobsDirectory}/${jobFile}`);
            foundJob.run(client, server);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
};
