const Module = require('../models/Module');
const Project = require('../models/Project');
const Task = require('../models/Task');

const recalculateModuleProgress = async (moduleId) => {
  if (!moduleId) return;

  const moduleDoc = await Module.findById(moduleId);
  if (!moduleDoc) return;

  const tasks = await Task.find({ module: moduleId });
  
  if (tasks.length === 0) {
    moduleDoc.progress = 0;
    moduleDoc.status = 'Not Started';
    moduleDoc.actualHours = 0;
    await moduleDoc.save();
    await recalculateProjectProgress(moduleDoc.project);
    return;
  }

  let totalEstHours = 0;
  let approvedEstHours = 0;
  let approvedCount = 0;
  let totalActualHours = 0;

  tasks.forEach((t) => {
    const est = t.estimatedHours || 1;
    totalEstHours += est;
    totalActualHours += t.actualHours || 0;
    if (t.status === 'Approved') {
      approvedEstHours += est;
      approvedCount += 1;
    }
  });

  const progress = totalEstHours > 0 
    ? Math.min(100, Math.round((approvedEstHours / totalEstHours) * 100))
    : Math.min(100, Math.round((approvedCount / tasks.length) * 100));

  let status = 'Not Started';
  if (progress === 100) {
    status = 'Completed';
  } else if (progress > 0 || tasks.some(t => t.status === 'In Progress' || t.status === 'Submitted for Review')) {
    status = 'In Progress';
  }

  moduleDoc.progress = progress;
  moduleDoc.status = status;
  moduleDoc.actualHours = Number(totalActualHours.toFixed(2));
  await moduleDoc.save();

  // Trigger project progress recalculation
  await recalculateProjectProgress(moduleDoc.project);
};

const recalculateProjectProgress = async (projectId) => {
  if (!projectId) return;

  const projectDoc = await Project.findById(projectId);
  if (!projectDoc) return;

  const modules = await Module.find({ project: projectId });

  if (modules.length === 0) {
    // If no modules, check direct tasks
    const tasks = await Task.find({ project: projectId });
    if (tasks.length === 0) {
      projectDoc.progress = 0;
      projectDoc.status = 'Not Started';
      await projectDoc.save();
      return;
    }

    let approvedEst = 0;
    let totalEst = 0;
    tasks.forEach(t => {
      const est = t.estimatedHours || 1;
      totalEst += est;
      if (t.status === 'Approved') approvedEst += est;
    });

    const progress = Math.min(100, Math.round((approvedEst / totalEst) * 100));
    projectDoc.progress = progress;
    if (progress === 100) projectDoc.status = 'Completed';
    else if (progress > 0) projectDoc.status = 'In Progress';
    await projectDoc.save();
    return;
  }

  let sumProgress = 0;
  let completedModules = 0;

  modules.forEach((m) => {
    sumProgress += m.progress || 0;
    if (m.status === 'Completed' || m.progress === 100) {
      completedModules += 1;
    }
  });

  const overallProgress = Math.min(100, Math.round(sumProgress / modules.length));

  let status = projectDoc.status;
  if (overallProgress === 100 || completedModules === modules.length) {
    status = 'Completed';
  } else if (overallProgress > 0 && status !== 'On Hold' && status !== 'Cancelled') {
    status = 'In Progress';
  }

  projectDoc.progress = overallProgress;
  projectDoc.status = status;
  await projectDoc.save();
};

module.exports = {
  recalculateModuleProgress,
  recalculateProjectProgress
};
