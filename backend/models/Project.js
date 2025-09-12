/**
 * Project Model
 * This model represents projects created by corporate or individual users
 */

const mongoose = require('mongoose');

// Schema for project overview
const OverviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Project type is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  goal: {
    type: String,
    required: [true, 'Project goal is required'],
    trim: true
  }
}, { _id: false });


// Schema for project scope
const ScopeSchema = new mongoose.Schema({
  features: {
    type: [String],
    default: []
  },
  userRoles: {
    type: [String],
    default: []
  },
  integrations: {
    type: [String],
    default: []
  },
  nfr: { // Non-functional requirements
    type: String,
    trim: true
  },
  acceptanceCriteria: {
    type: String,
    trim: true
  },
  successMetrics: {
    type: String,
    trim: true
  }
}, { _id: false });

// Schema for technical details
const TechnicalSchema = new mongoose.Schema({
  platforms: {
    type: [String],
    default: []
  },
  stack: {
    type: [String],
    default: []
  },
  hosting: {
    type: String,
    trim: true
  },
  environments: {
    type: [String],
    default: []
  },
  security: {
    type: String,
    trim: true
  },
  dataClass: {
    type: String,
    trim: true
  }
}, { _id: false });

// Schema for timeline and budget
const TimelineBudgetSchema = new mongoose.Schema({
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  budgetRange: {
    type: String,
    trim: true
  },
  paymentModel: {
    type: String,
    trim: true
  },
  milestones: {
    type: [{
      title: String,
      description: String,
      dueDate: Date
    }],
    default: []
  }
}, { _id: false });

// Schema for legal information
const LegalSchema = new mongoose.Schema({
  ndaRequired: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Schema for contact information
const ContactsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Contact name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Contact email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  commsPreference: {
    type: String,
    // Add all the values from your frontend dropdown
    enum: ['Email', 'Phone', 'Video Call', 'In-person Meeting', 'Slack/Teams'],
    default: 'Email'
  }
}, { _id: false });

// Schema for repository information (can be repurposed for client-submitted repos if needed)
// Note: This is separate from the new 'codebase' field which tracks the RAG sync status.
const RepoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'Repository URL is required'],
    trim: true
  }
}, { _id: false });

// Schema for attachment information
const AttachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true
  },
  url: {
    type: String,
    required: [true, 'File URL is required'],
    trim: true
  },
  mime: {
    type: String,
    required: [true, 'MIME type is required'],
    trim: true
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  }
}, { _id: false });

// Schema for activity log
const ActivityLogSchema = new mongoose.Schema({
  at: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    required: [true, 'Activity type is required'],
    trim: true
  },
  by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Ensure this matches your User model name
    required: [true, 'User ID is required']
  },
  note: {
    type: String,
    trim: true
  }
}, { _id: false });

// Schema for project reviews
const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Ensure this matches your User model name
    required: [true, 'User ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Schema for AI-generated requirements (if you want to keep it separate from the main project data)
const AIRequirementsSchema = new mongoose.Schema({
  summary: String,
  userStories: [{ asA: String, iWantTo: String, soThat: String }],
  functionalRequirements: {
    frontend: [{ id: String, component: String, task: String, acceptanceCriteria: String, priority: String }],
    backend: [{ id: String, service: String, task: String, acceptanceCriteria: String, priority: String }]
  },
  nonFunctionalRequirements: [{ id: String, category: String, requirement: String }],
  suggestedTechnologies: {
    frontend: [String],
    backend: [String],
    deployment: [String]
  }
}, { _id: false });

// Schema for Admin Review
const AdminReviewSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  professionalism: Number,
  communication: Number,
  clarityOfRequirements: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

// Schema for Contract Details
const ContractSchema = new mongoose.Schema({
  filePath: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    trim: true
  },
  generatedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['none', 'generated', 'sent', 'signed'],
    default: 'none'
  }
}, { _id: false });

    
    
const CodebaseSchema = new mongoose.Schema({
  repoUrl: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['none', 'pending', 'digest_created', 'syncing_pinecone', 'completed', 'failed'], // Changed syncing_weaviate to syncing_pinecone
    default: 'none'
  },
  jsonDigestFilePath: {
    type: String,
    trim: true,
  },
  rawTextDigestFilePath: {
    type: String,
    trim: true,
  },
  pineconeIndexName: { // NEW: The dynamically generated Pinecone Index name
    type: String,
    trim: true,
  },
  lastProcessedAt: { // Last time digest was created or Pinecone synced
    type: Date,
  },
}, { _id: false });

// Main Project Schema
const ProjectSchema = new mongoose.Schema({
  projectId: {
    type: Number,
    unique: true
  },
  ownerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Ensure this matches your User model name
    required: [true, 'Owner user ID is required']
  },
  ownerRole: {
    type: String,
    enum: ['corporate', 'individual'],
    required: [true, 'Owner role is required']
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'admin-counter', 'client-counter', 'under_review', 'approved', 'rejected'],
    default: 'draft'
  },
  verdict: {
    type: String,
    enum: ['none', 'pending', 'confirmed', 'rejected'],
    default: 'none'
  },
  overview: {
    type: OverviewSchema,
    default: () => ({})
  },
  scope: {
    type: ScopeSchema,
    default: () => ({})
  },
  technical: {
    type: TechnicalSchema,
    default: () => ({})
  },
  timelineBudget: {
    type: TimelineBudgetSchema,
    default: () => ({})
  },
  legal: {
    type: LegalSchema,
    default: () => ({})
  },
  contacts: {
    type: ContactsSchema,
    default: () => ({})
  },
  repos: { // Client-submitted repos, can be multiple. Distinct from the single codebase for RAG.
    type: [RepoSchema],
    default: []
  },
  attachments: {
    type: [AttachmentSchema],
    default: []
  },
  activityLog: {
    type: [ActivityLogSchema],
    default: []
  },

  requirements: { // AI-generated requirements
    type: AIRequirementsSchema,
    default: () => ({})
  },
  adminReview: {
    type: AdminReviewSchema,
    default: () => ({})
  },

  reviews: { // User-submitted reviews (e.g., from helpers)
    type: [ReviewSchema],
    default: []
  },

  contract: {
    type: ContractSchema,
    default: () => ({})
  },
  // --- NEW: Codebase Integration Field ---
  codebase: {
    type: CodebaseSchema,
    default: () => ({})
  },
  // --- END NEW FIELD ---
}, {
  timestamps: true
});

// Add indexes for better query performance
ProjectSchema.index({ ownerUserId: 1, status: 1 });
ProjectSchema.index({ ownerUserId: 1, 'overview.title': 1 });
ProjectSchema.index({ ownerUserId: 1, updatedAt: -1 });
ProjectSchema.index({ projectId: 1 }, { unique: true });

// Import counter utility
const { getNextSequenceValue } = require('../utils/counterUtils'); // Ensure this path is correct

// Pre-save middleware to auto-increment projectId
ProjectSchema.pre('save', async function(next) {
  try {
    // Only set projectId if it's a new document (not already set)
    if (this.isNew && !this.projectId) { // Use isNew to ensure it's only on initial creation
      this.projectId = await getNextSequenceValue('projectId');
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Project', ProjectSchema); // Changed 'project' to 'Project' for consistency with common Mongoose practices