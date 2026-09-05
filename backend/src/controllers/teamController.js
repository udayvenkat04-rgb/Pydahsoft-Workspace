const Team = require('../models/Team');
const User = require('../models/User');
const { getTeamPerformance } = require('../services/performanceService');
const { logAudit } = require('../services/auditService');

const createTeam = async (req, res) => {
  try {
    const { name, teamLead, members, projects, teamId } = req.body;

    if (!name || !teamLead) {
      return res.status(400).json({
        success: false,
        error: { message: 'Team name and Team Lead are required' }
      });
    }

    const leadUser = await User.findById(teamLead);
    if (!leadUser) {
      return res.status(400).json({
        success: false,
        error: { message: 'Selected Team Lead user not found' }
      });
    }

    const count = await Team.countDocuments();
    const generatedTeamId = teamId || `TEAM-${String(count + 1).padStart(3, '0')}`;

    const team = await Team.create({
      teamId: generatedTeamId,
      name,
      teamLead,
      members: members || [],
      projects: projects || []
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('teamLead', 'name username email employeeId designation role')
      .populate('members', 'name username email employeeId designation role')
      .populate('projects', 'name projectId status progress');

    await logAudit({
      entityType: 'Team',
      entityId: team._id,
      action: 'CREATE_TEAM',
      performedBy: req.user._id,
      details: { teamName: team.name, teamLead }
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: populatedTeam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error creating team' }
    });
  }
};

const getTeams = async (req, res) => {
  try {
    const { status, teamLead } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (teamLead) filter.teamLead = teamLead;

    // If user is not superior/superadmin (e.g. employee, teamlead), restrict to teams led or joined by the user
    if (req.user.role !== 'superior' && req.user.role !== 'superadmin') {
      filter.$or = [{ teamLead: req.user._id }, { members: req.user._id }];
    }

    const teams = await Team.find(filter)
      .populate('teamLead', 'name username email employeeId designation role')
      .populate('members', 'name username email employeeId designation role')
      .populate('projects', 'name projectId status progress')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: teams,
      message: 'Teams retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching teams' }
    });
  }
};

const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id)
      .populate('teamLead', 'name username email employeeId designation role')
      .populate('members', 'name username email employeeId designation role')
      .populate('projects', 'name projectId status progress');

    if (!team) {
      return res.status(404).json({
        success: false,
        error: { message: 'Team not found' }
      });
    }

    const performance = await getTeamPerformance(id);

    res.status(200).json({
      success: true,
      data: {
        team,
        performance
      },
      message: 'Team details retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error fetching team details' }
    });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findByIdAndUpdate(id, req.body, { new: true })
      .populate('teamLead', 'name username email employeeId designation role')
      .populate('members', 'name username email employeeId designation role')
      .populate('projects', 'name projectId status progress');

    if (!team) {
      return res.status(404).json({
        success: false,
        error: { message: 'Team not found' }
      });
    }

    await logAudit({
      entityType: 'Team',
      entityId: team._id,
      action: 'UPDATE_TEAM',
      performedBy: req.user._id,
      details: req.body
    });

    res.status(200).json({
      success: true,
      data: team,
      message: 'Team updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error updating team' }
    });
  }
};

const updateMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, memberId } = req.body; // action: 'add' | 'remove'

    if (!memberId || !action) {
      return res.status(400).json({
        success: false,
        error: { message: 'memberId and action (add/remove) are required' }
      });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: { message: 'Team not found' }
      });
    }

    if (action === 'add') {
      if (!team.members.includes(memberId)) {
        team.members.push(memberId);
      }
    } else if (action === 'remove') {
      team.members = team.members.filter(m => m.toString() !== memberId);
    }

    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate('teamLead', 'name username email employeeId designation role')
      .populate('members', 'name username email employeeId designation role');

    await logAudit({
      entityType: 'Team',
      entityId: team._id,
      action: action === 'add' ? 'ADD_TEAM_MEMBER' : 'REMOVE_TEAM_MEMBER',
      performedBy: req.user._id,
      details: { memberId }
    });

    res.status(200).json({
      success: true,
      data: populatedTeam,
      message: `Member ${action === 'add' ? 'added to' : 'removed from'} team successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error updating team members' }
    });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findByIdAndDelete(id);
    if (!team) {
      return res.status(404).json({
        success: false,
        error: { message: 'Team not found' }
      });
    }

    await logAudit({
      entityType: 'Team',
      entityId: id,
      action: 'DELETE_TEAM',
      performedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message || 'Error deleting team' }
    });
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  updateMembers,
  deleteTeam
};
