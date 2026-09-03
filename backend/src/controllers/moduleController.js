const Module = require('../models/Module');
const Task = require('../models/Task');
const Team = require('../models/Team');
const { recalculateModuleProgress, recalculateProjectProgress } = require('../services/progressService');
const { logAudit } = require('../services/auditService');

const createModule = async (req, res) => {
  try {
    const { name, description, project, assignedTeam, startDate, expectedCompletionDate, estimatedHours, moduleId } = req.body;

    if (!name || !project) {
      return res.status(400).json({
        success: false,
        error: { message: 'Module name and associated project are required' }
      });
    }

    const count = await Module.countDocuments();
    const generatedModuleId = moduleId || `MOD-${String(count + 1).padStart(3, '0')}`;

    const moduleDoc = await Module.create({
      moduleId: generatedModuleId,
      name,
      description: description || '',
      project,
      assignedTeam: assignedTeam || null,
      createdBy: req.user._id,
      startDate: startDate || new Date(),
      expectedCompletionDate: expectedCompletionDate || null,
      estimatedHours: estimatedHours || 0,
      actualHours: 0,
      status: 'Not Started',
      progress: 0
    });

    if (assignedTeam) {
      await Team.findByIdAndUpdate(assignedTeam, { $addToSet: { assignedModules: moduleDoc._id } });
    }

    const populatedModule = await Module.findById(moduleDoc._id)
      .populate('project', 'name projectId')
      .populate({
        path: 'assignedTeam',
        select: 'name teamId teamLead members',
        populate: { path: 'teamLead', select: 'name username email' }
      });

    await recalculateProjectProgress(project);

    await logAudit({
      entityType: 'Module',
      entityId: moduleDoc._id,
      action: 'CREATE_MODULE',
      performedBy: req.user._id,
      details: { moduleName: moduleDoc.name, projectId: project, assignedTeam }
    });

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: populatedModule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error creating module' }
    });
  }
};

const assignTeamToModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamId } = req.body;

    const moduleDoc = await Module.findById(id);
    if (!moduleDoc) {
      return res.status(404).json({
        success: false,
        error: { message: 'Module not found' }
      });
    }

    if (moduleDoc.assignedTeam) {
      await Team.findByIdAndUpdate(moduleDoc.assignedTeam, { $pull: { assignedModules: moduleDoc._id } });
    }

    moduleDoc.assignedTeam = teamId || null;
    await moduleDoc.save();

    if (teamId) {
      await Team.findByIdAndUpdate(teamId, { $addToSet: { assignedModules: moduleDoc._id } });
    }

    const updatedModule = await Module.findById(moduleDoc._id)
      .populate('project', 'name projectId')
      .populate({
        path: 'assignedTeam',
        select: 'name teamId teamLead members',
        populate: { path: 'teamLead', select: 'name username email' }
      });

    await logAudit({
      entityType: 'Module',
      entityId: moduleDoc._id,
      action: 'ASSIGN_MODULE_TO_TEAM',
      performedBy: req.user._id,
      details: { teamId }
    });

    res.status(200).json({
      success: true,
      data: updatedModule,
      message: 'Module assigned to team successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error assigning module to team' }
    });
  }
};

const getModules = async (req, res) => {
  try {
    const { project, status, teamId } = req.query;
    const filter = {};
    if (project) filter.project = project;
    if (status) filter.status = status;
    if (teamId) filter.assignedTeam = teamId;

    const modules = await Module.find(filter)
      .populate('project', 'name projectId')
      .populate({
        path: 'assignedTeam',
        select: 'name teamId teamLead members',
        populate: { path: 'teamLead', select: 'name username email' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: modules,
      message: 'Modules retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching modules' }
    });
  }
};

const getModuleById = async (req, res) => {
  try {
    const { id } = req.params;

    await recalculateModuleProgress(id);

    const moduleDoc = await Module.findById(id)
      .populate('project', 'name projectId')
      .populate({
        path: 'assignedTeam',
        select: 'name teamId teamLead members',
        populate: { path: 'teamLead', select: 'name username email' }
      });

    if (!moduleDoc) {
      return res.status(404).json({
        success: false,
        error: { message: 'Module not found' }
      });
    }

    const tasks = await Task.find({ module: id }).populate('assignedTo', 'name username');

    res.status(200).json({
      success: true,
      data: {
        module: moduleDoc,
        tasks
      },
      message: 'Module details retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching module details' }
    });
  }
};

const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.progress; // Frontend cannot directly mutate progress

    const moduleDoc = await Module.findByIdAndUpdate(id, updateData, { new: true })
      .populate('project', 'name projectId')
      .populate({
        path: 'assignedTeam',
        select: 'name teamId teamLead members',
        populate: { path: 'teamLead', select: 'name username email' }
      });

    if (!moduleDoc) {
      return res.status(404).json({
        success: false,
        error: { message: 'Module not found' }
      });
    }

    await recalculateModuleProgress(id);

    await logAudit({
      entityType: 'Module',
      entityId: moduleDoc._id,
      action: 'UPDATE_MODULE',
      performedBy: req.user._id,
      details: updateData
    });

    res.status(200).json({
      success: true,
      data: moduleDoc,
      message: 'Module updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error updating module' }
    });
  }
};

const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    const moduleDoc = await Module.findByIdAndDelete(id);
    if (!moduleDoc) {
      return res.status(404).json({
        success: false,
        error: { message: 'Module not found' }
      });
    }

    if (moduleDoc.assignedTeam) {
      await Team.findByIdAndUpdate(moduleDoc.assignedTeam, { $pull: { assignedModules: moduleDoc._id } });
    }

    await Task.deleteMany({ module: id });
    await recalculateProjectProgress(moduleDoc.project);

    await logAudit({
      entityType: 'Module',
      entityId: id,
      action: 'DELETE_MODULE',
      performedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Module and associated tasks deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error deleting module' }
    });
  }
};

module.exports = {
  createModule,
  assignTeamToModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule
};
