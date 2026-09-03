const Project = require('../models/Project');
const Team = require('../models/Team');
const Module = require('../models/Module');
const Task = require('../models/Task');
const { recalculateProjectProgress } = require('../services/progressService');
const { logAudit } = require('../services/auditService');

const createProject = async (req, res) => {
  try {
    const { name, description, client, assignedTeam, startDate, deadline, priority, projectId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Project name is required' }
      });
    }

    const count = await Project.countDocuments();
    const generatedProjectId = projectId || `PRJ-${String(count + 1).padStart(3, '0')}`;

    const project = await Project.create({
      projectId: generatedProjectId,
      name,
      description: description || '',
      client: client || 'Internal',
      assignedTeam: assignedTeam || null,
      createdBy: req.user._id,
      startDate: startDate || new Date(),
      deadline: deadline || null,
      priority: priority || 'Medium',
      status: 'Not Started',
      progress: 0
    });

    if (assignedTeam) {
      await Team.findByIdAndUpdate(assignedTeam, { $addToSet: { projects: project._id } });
    }

    const populatedProject = await Project.findById(project._id)
      .populate('assignedTeam', 'name teamLead members')
      .populate('createdBy', 'name username');

    await logAudit({
      entityType: 'Project',
      entityId: project._id,
      action: 'CREATE_PROJECT',
      performedBy: req.user._id,
      details: { projectName: project.name }
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: populatedProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error creating project' }
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // If Team Lead, show projects assigned to their teams
    if (req.user.role === 'teamlead') {
      const userTeams = await Team.find({ $or: [{ teamLead: req.user._id }, { members: req.user._id }] });
      const teamIds = userTeams.map(t => t._id);
      filter.assignedTeam = { $in: teamIds };
    }

    const projects = await Project.find(filter)
      .populate('assignedTeam', 'name teamLead members')
      .populate('createdBy', 'name username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: projects,
      message: 'Projects retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching projects' }
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    await recalculateProjectProgress(id);

    const project = await Project.findById(id)
      .populate({
        path: 'assignedTeam',
        populate: [
          { path: 'teamLead', select: 'name username email employeeId' },
          { path: 'members', select: 'name username email employeeId' }
        ]
      })
      .populate('createdBy', 'name username');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { message: 'Project not found' }
      });
    }

    const modules = await Module.find({ project: id }).populate('assignedEmployees', 'name username');
    const tasks = await Task.find({ project: id }).populate('assignedTo', 'name username');

    res.status(200).json({
      success: true,
      data: {
        project,
        modules,
        tasks
      },
      message: 'Project details retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching project details' }
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Explicitly reject direct setting of project progress by frontend
    delete updateData.progress;

    const oldProject = await Project.findById(id);
    if (!oldProject) {
      return res.status(404).json({
        success: false,
        error: { message: 'Project not found' }
      });
    }

    const project = await Project.findByIdAndUpdate(id, updateData, { new: true })
      .populate('assignedTeam', 'name teamLead members')
      .populate('createdBy', 'name username');

    if (updateData.assignedTeam && updateData.assignedTeam !== String(oldProject.assignedTeam)) {
      if (oldProject.assignedTeam) {
        await Team.findByIdAndUpdate(oldProject.assignedTeam, { $pull: { projects: id } });
      }
      await Team.findByIdAndUpdate(updateData.assignedTeam, { $addToSet: { projects: id } });
    }

    await logAudit({
      entityType: 'Project',
      entityId: project._id,
      action: 'UPDATE_PROJECT',
      performedBy: req.user._id,
      details: updateData
    });

    res.status(200).json({
      success: true,
      data: project,
      message: 'Project updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error updating project' }
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { message: 'Project not found' }
      });
    }

    await Module.deleteMany({ project: id });
    await Task.deleteMany({ project: id });

    await logAudit({
      entityType: 'Project',
      entityId: id,
      action: 'DELETE_PROJECT',
      performedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Project and associated modules deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error deleting project' }
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
};
