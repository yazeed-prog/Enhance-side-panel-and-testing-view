// 🎯 Dynamic Field Definitions for all apps
export interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'switch' | 'code' | 'divider';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  rows?: number;
  description?: string;
  defaultChecked?: boolean;
  language?: string;
  sectionTitle?: string;
}

// 🔍 Map common step name patterns to appIds (for fallback matching)
export const STEP_NAME_TO_APP_MAP: Record<string, string> = {
  'send email': 'gmail',
  'email': 'gmail',
  'gmail': 'gmail',
  'send message': 'slack',
  'slack': 'slack',
  'post message': 'slack',
  'create page': 'notion',
  'notion': 'notion',
  'add row': 'gsheets',
  'google sheets': 'gsheets',
  'gsheets': 'gsheets',
  'create event': 'gcal',
  'google calendar': 'gcal',
  'gcal': 'gcal',
  'calendar': 'gcal',
  'stripe': 'stripe',
  'payment': 'stripe',
  'charge': 'stripe',
  'github': 'github',
  'create issue': 'github',
  'webhook': 'trigger',
  'catch webhook': 'trigger',
  'trigger': 'trigger'
};

export const APP_FIELD_DEFINITIONS: Record<string, FieldDefinition[]> = {
  'gmail': [
    { name: 'action', label: 'Action', type: 'select', required: true, options: [
      { value: 'send', label: 'Send Email' },
      { value: 'read', label: 'Read Email' },
      { value: 'draft', label: 'Create Draft' },
      { value: 'reply', label: 'Reply to Email' },
      { value: 'forward', label: 'Forward Email' }
    ]},
    { name: 'to', label: 'To', type: 'text', placeholder: 'recipient@example.com', required: true },
    { name: 'cc', label: 'CC', type: 'text', placeholder: 'cc@example.com' },
    { name: 'bcc', label: 'BCC', type: 'text', placeholder: 'bcc@example.com' },
    { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Email subject', required: true },
    { name: 'body', label: 'Message Body', type: 'textarea', placeholder: 'Email content...', required: true, rows: 6 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Attachments & Options' },
    { name: 'attachmentUrl', label: 'Attachment URL', type: 'text', placeholder: 'https://example.com/file.pdf' },
    { name: 'isHtml', label: 'Send as HTML', type: 'switch', defaultChecked: true, description: 'Parse the message body as HTML content' },
    { name: 'trackOpens', label: 'Track opens', type: 'checkbox', description: 'Get notified when the recipient opens the email' },
    { name: 'requestReadReceipt', label: 'Request read receipt', type: 'checkbox', description: 'Ask the recipient to confirm they read the email' },
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Advanced Settings' },
    { name: 'replyTo', label: 'Reply-To Address', type: 'text', placeholder: 'reply@example.com' },
    { name: 'priority', label: 'Priority', type: 'select', options: [
      { value: 'normal', label: 'Normal' },
      { value: 'high', label: 'High' },
      { value: 'low', label: 'Low' }
    ]},
    { name: 'customHeaders', label: 'Custom Headers', type: 'code', placeholder: '{\n  "X-Custom-Header": "value"\n}', rows: 4, language: 'json' },
  ],
  'slack': [
    { name: 'slackAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'postMessage', label: 'Post Message' },
      { value: 'updateMessage', label: 'Update Message' },
      { value: 'deleteMessage', label: 'Delete Message' },
      { value: 'uploadFile', label: 'Upload File' },
      { value: 'addReaction', label: 'Add Reaction' }
    ]},
    { name: 'channel', label: 'Channel', type: 'select', required: true, options: [
      { value: 'general', label: '#general' },
      { value: 'random', label: '#random' },
      { value: 'dev-team', label: '#dev-team' },
      { value: 'marketing', label: '#marketing' },
      { value: 'engineering', label: '#engineering' },
      { value: 'design', label: '#design' },
      { value: 'sales', label: '#sales' }
    ]},
    { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Message text', required: true, rows: 4 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Message Options' },
    { name: 'threadTs', label: 'Thread Timestamp', type: 'text', placeholder: '1234567890.123456', description: 'Reply in a thread by providing the parent message timestamp' },
    { name: 'username', label: 'Bot Username', type: 'text', placeholder: 'Automation Bot' },
    { name: 'iconEmoji', label: 'Bot Icon Emoji', type: 'text', placeholder: ':robot_face:' },
    { name: 'unfurlLinks', label: 'Unfurl links', type: 'switch', defaultChecked: true, description: 'Show link previews in the message' },
    { name: 'unfurlMedia', label: 'Unfurl media', type: 'switch', defaultChecked: true, description: 'Show media previews for images and videos' },
    { name: 'markdownEnabled', label: 'Enable Markdown', type: 'checkbox', defaultChecked: true, description: 'Parse message text as Markdown (mrkdwn)' },
    { name: 'sendAsUser', label: 'Send as authenticated user', type: 'checkbox', description: 'Send the message as the connected user instead of the bot' },
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Block Kit (Advanced)' },
    { name: 'blocksJson', label: 'Blocks JSON', type: 'code', placeholder: '[\n  {\n    "type": "section",\n    "text": {\n      "type": "mrkdwn",\n      "text": "Hello!"\n    }\n  }\n]', rows: 8, language: 'json' },
  ],
  'notion': [
    { name: 'notionAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'createPage', label: 'Create Page' },
      { value: 'updatePage', label: 'Update Page' },
      { value: 'queryDatabase', label: 'Query Database' },
      { value: 'createDatabase', label: 'Create Database' },
      { value: 'appendBlock', label: 'Append Block' }
    ]},
    { name: 'database', label: 'Database', type: 'select', required: true, options: [
      { value: 'tasks', label: 'Tasks' },
      { value: 'projects', label: 'Projects' },
      { value: 'contacts', label: 'Contacts' },
      { value: 'notes', label: 'Notes' },
      { value: 'wiki', label: 'Wiki' },
      { value: 'sprints', label: 'Sprints' }
    ]},
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Page title', required: true },
    { name: 'content', label: 'Content', type: 'textarea', placeholder: 'Page content', required: false, rows: 5 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Properties' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'not_started', label: 'Not Started' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'done', label: 'Done' },
      { value: 'blocked', label: 'Blocked' }
    ]},
    { name: 'assignee', label: 'Assignee', type: 'text', placeholder: 'user@example.com' },
    { name: 'tags', label: 'Tags', type: 'text', placeholder: 'tag1, tag2, tag3' },
    { name: 'dueDate', label: 'Due Date', type: 'text', placeholder: '2026-04-15' },
    { name: 'priority', label: 'Priority', type: 'select', options: [
      { value: 'urgent', label: 'Urgent' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' }
    ]},
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Options' },
    { name: 'archiveExisting', label: 'Archive if duplicate', type: 'checkbox', description: 'Archive existing page if a duplicate title is found' },
    { name: 'enableIcon', label: 'Set page icon', type: 'switch', description: 'Automatically set an emoji icon based on the title' },
    { name: 'publishToWeb', label: 'Publish to web', type: 'checkbox', description: 'Make the page publicly accessible' },
  ],
  'stripe': [
    { name: 'stripeAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'createCharge', label: 'Create Charge' },
      { value: 'createCustomer', label: 'Create Customer' },
      { value: 'createInvoice', label: 'Create Invoice' },
      { value: 'refund', label: 'Create Refund' },
      { value: 'createSubscription', label: 'Create Subscription' }
    ]},
    { name: 'amount', label: 'Amount', type: 'text', placeholder: '100.00', required: true },
    { name: 'currency', label: 'Currency', type: 'select', required: true, options: [
      { value: 'usd', label: 'USD ($)' },
      { value: 'eur', label: 'EUR (€)' },
      { value: 'gbp', label: 'GBP (£)' },
      { value: 'aed', label: 'AED (د.إ)' },
      { value: 'jpy', label: 'JPY (¥)' },
      { value: 'cad', label: 'CAD (C$)' }
    ]},
    { name: 'customerEmail', label: 'Customer Email', type: 'text', placeholder: 'customer@example.com', required: true },
    { name: 'description', label: 'Payment Description', type: 'text', placeholder: 'Order #12345' },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Payment Options' },
    { name: 'paymentMethod', label: 'Payment Method', type: 'select', options: [
      { value: 'card', label: 'Credit/Debit Card' },
      { value: 'bank_transfer', label: 'Bank Transfer' },
      { value: 'apple_pay', label: 'Apple Pay' },
      { value: 'google_pay', label: 'Google Pay' }
    ]},
    { name: 'captureMethod', label: 'Capture Method', type: 'select', options: [
      { value: 'automatic', label: 'Automatic' },
      { value: 'manual', label: 'Manual' }
    ]},
    { name: 'sendReceipt', label: 'Send receipt email', type: 'switch', defaultChecked: true, description: 'Automatically send a payment receipt to the customer' },
    { name: 'saveCard', label: 'Save card for future use', type: 'checkbox', description: 'Store the payment method for future charges' },
    { name: 'enable3ds', label: 'Require 3D Secure', type: 'checkbox', description: 'Force 3D Secure authentication for this payment' },
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Metadata' },
    { name: 'metadata', label: 'Metadata (JSON)', type: 'code', placeholder: '{\n  "order_id": "12345",\n  "source": "automation"\n}', rows: 5, language: 'json' },
    { name: 'statementDescriptor', label: 'Statement Descriptor', type: 'text', placeholder: 'MYCOMPANY' },
  ],
  'github': [
    { name: 'githubAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'createIssue', label: 'Create Issue' },
      { value: 'createPR', label: 'Create Pull Request' },
      { value: 'addComment', label: 'Add Comment' },
      { value: 'closeIssue', label: 'Close Issue' },
      { value: 'createRelease', label: 'Create Release' },
      { value: 'dispatchWorkflow', label: 'Dispatch Workflow' }
    ]},
    { name: 'repository', label: 'Repository', type: 'text', placeholder: 'owner/repo', required: true },
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Issue title', required: true },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Issue description', required: false, rows: 5 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Issue Details' },
    { name: 'labels', label: 'Labels', type: 'text', placeholder: 'bug, enhancement, priority:high' },
    { name: 'assignees', label: 'Assignees', type: 'text', placeholder: 'username1, username2' },
    { name: 'milestone', label: 'Milestone', type: 'select', options: [
      { value: 'v1.0', label: 'v1.0' },
      { value: 'v1.1', label: 'v1.1' },
      { value: 'v2.0', label: 'v2.0' },
      { value: 'backlog', label: 'Backlog' }
    ]},
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Options' },
    { name: 'autoClose', label: 'Auto-close linked issues', type: 'switch', description: 'Automatically close issues referenced in commits' },
    { name: 'notifySubscribers', label: 'Notify subscribers', type: 'checkbox', defaultChecked: true, description: 'Send notification to watchers of this repository' },
    { name: 'lockConversation', label: 'Lock conversation after close', type: 'checkbox', description: 'Prevent further comments after the issue is closed' },
    { name: 'divider3', label: '', type: 'divider', sectionTitle: 'Template Body' },
    { name: 'templateBody', label: 'Issue Template (Markdown)', type: 'code', placeholder: '## Description\n\n## Steps to Reproduce\n\n1. \n2. \n3. \n\n## Expected Behavior\n\n## Actual Behavior', rows: 8, language: 'markdown' },
  ],
  'gcal': [
    { name: 'gcalAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'createEvent', label: 'Create Event' },
      { value: 'updateEvent', label: 'Update Event' },
      { value: 'deleteEvent', label: 'Delete Event' },
      { value: 'findEvent', label: 'Find Event' },
      { value: 'listEvents', label: 'List Events' }
    ]},
    { name: 'calendar', label: 'Calendar', type: 'select', required: true, options: [
      { value: 'primary', label: 'Primary Calendar' },
      { value: 'work', label: 'Work' },
      { value: 'personal', label: 'Personal' },
      { value: 'team', label: 'Team Calendar' }
    ]},
    { name: 'title', label: 'Event Title', type: 'text', placeholder: 'Team Meeting', required: true },
    { name: 'date', label: 'Start Date', type: 'text', placeholder: '2026-04-15', required: true },
    { name: 'time', label: 'Start Time', type: 'text', placeholder: '14:00', required: true },
    { name: 'endDate', label: 'End Date', type: 'text', placeholder: '2026-04-15' },
    { name: 'endTime', label: 'End Time', type: 'text', placeholder: '15:00' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Event details...', required: false, rows: 4 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Location & Attendees' },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'Conference Room A / Zoom link' },
    { name: 'attendees', label: 'Attendees', type: 'text', placeholder: 'user1@example.com, user2@example.com' },
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Event Settings' },
    { name: 'allDay', label: 'All-day event', type: 'switch', description: 'Mark this as an all-day event' },
    { name: 'sendInvites', label: 'Send invite notifications', type: 'switch', defaultChecked: true, description: 'Notify attendees via email' },
    { name: 'addConference', label: 'Add Google Meet link', type: 'checkbox', defaultChecked: true, description: 'Automatically generate a Google Meet video conference' },
    { name: 'setReminder', label: 'Set reminder', type: 'checkbox', defaultChecked: true, description: 'Add a notification reminder before the event' },
    { name: 'reminderMinutes', label: 'Reminder (minutes before)', type: 'select', options: [
      { value: '5', label: '5 minutes' },
      { value: '10', label: '10 minutes' },
      { value: '15', label: '15 minutes' },
      { value: '30', label: '30 minutes' },
      { value: '60', label: '1 hour' },
      { value: '1440', label: '1 day' }
    ]},
    { name: 'visibility', label: 'Visibility', type: 'select', options: [
      { value: 'default', label: 'Default' },
      { value: 'public', label: 'Public' },
      { value: 'private', label: 'Private' }
    ]},
    { name: 'colorId', label: 'Event Color', type: 'select', options: [
      { value: '1', label: 'Lavender' },
      { value: '2', label: 'Sage' },
      { value: '3', label: 'Grape' },
      { value: '4', label: 'Flamingo' },
      { value: '5', label: 'Banana' },
      { value: '6', label: 'Tangerine' },
      { value: '11', label: 'Tomato' }
    ]},
  ],
  'airtable': [
    { name: 'airtableAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'createRecord', label: 'Create Record' },
      { value: 'updateRecord', label: 'Update Record' },
      { value: 'findRecord', label: 'Find Record' },
      { value: 'deleteRecord', label: 'Delete Record' },
      { value: 'listRecords', label: 'List Records' }
    ]},
    { name: 'base', label: 'Base', type: 'select', required: true, options: [
      { value: 'appXXXXXXX', label: 'Product Tracker' },
      { value: 'appYYYYYYY', label: 'CRM Database' },
      { value: 'appZZZZZZZ', label: 'Content Calendar' }
    ]},
    { name: 'table', label: 'Table', type: 'text', placeholder: 'Table name', required: true },
    { name: 'field1', label: 'Name', type: 'text', placeholder: 'Record name', required: true },
    { name: 'field2', label: 'Email', type: 'text', placeholder: 'email@example.com' },
    { name: 'field3', label: 'Notes', type: 'textarea', placeholder: 'Additional notes...', rows: 3 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Search & Filter' },
    { name: 'filterFormula', label: 'Filter Formula', type: 'code', placeholder: 'AND({Status}="Active", {Email}!="")', rows: 3, language: 'formula' },
    { name: 'sortField', label: 'Sort By', type: 'text', placeholder: 'Created' },
    { name: 'sortDirection', label: 'Sort Direction', type: 'select', options: [
      { value: 'asc', label: 'Ascending' },
      { value: 'desc', label: 'Descending' }
    ]},
    { name: 'maxRecords', label: 'Max Records', type: 'text', placeholder: '100' },
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Options' },
    { name: 'typecast', label: 'Enable typecast', type: 'switch', description: 'Automatically convert field values to the correct type' },
    { name: 'returnFieldsByName', label: 'Return fields by name', type: 'checkbox', defaultChecked: true, description: 'Use field names instead of IDs in the response' },
  ],
  'hubspot': [
    { name: 'hubspotAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'createContact', label: 'Create Contact' },
      { value: 'updateContact', label: 'Update Contact' },
      { value: 'createDeal', label: 'Create Deal' },
      { value: 'createTicket', label: 'Create Ticket' },
      { value: 'addNote', label: 'Add Note' }
    ]},
    { name: 'email', label: 'Contact Email', type: 'text', placeholder: 'contact@example.com', required: true },
    { name: 'firstName', label: 'First Name', type: 'text', placeholder: 'John', required: true },
    { name: 'lastName', label: 'Last Name', type: 'text', placeholder: 'Doe', required: true },
    { name: 'company', label: 'Company', type: 'text', placeholder: 'Acme Inc.' },
    { name: 'phone', label: 'Phone Number', type: 'text', placeholder: '+1 (555) 123-4567' },
    { name: 'jobTitle', label: 'Job Title', type: 'text', placeholder: 'Marketing Manager' },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Deal Properties' },
    { name: 'dealName', label: 'Deal Name', type: 'text', placeholder: 'Enterprise Contract' },
    { name: 'dealStage', label: 'Deal Stage', type: 'select', options: [
      { value: 'appointment', label: 'Appointment Scheduled' },
      { value: 'qualified', label: 'Qualified to Buy' },
      { value: 'presentation', label: 'Presentation Scheduled' },
      { value: 'proposal', label: 'Proposal Sent' },
      { value: 'negotiation', label: 'Negotiation' },
      { value: 'closed_won', label: 'Closed Won' },
      { value: 'closed_lost', label: 'Closed Lost' }
    ]},
    { name: 'dealAmount', label: 'Deal Amount', type: 'text', placeholder: '50000' },
    { name: 'pipeline', label: 'Pipeline', type: 'select', options: [
      { value: 'default', label: 'Sales Pipeline' },
      { value: 'enterprise', label: 'Enterprise' },
      { value: 'partner', label: 'Partner Channel' }
    ]},
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Options' },
    { name: 'lifecycleStage', label: 'Lifecycle Stage', type: 'select', options: [
      { value: 'subscriber', label: 'Subscriber' },
      { value: 'lead', label: 'Lead' },
      { value: 'mql', label: 'Marketing Qualified Lead' },
      { value: 'sql', label: 'Sales Qualified Lead' },
      { value: 'opportunity', label: 'Opportunity' },
      { value: 'customer', label: 'Customer' }
    ]},
    { name: 'leadSource', label: 'Lead Source', type: 'text', placeholder: 'Website Form' },
    { name: 'updateIfExists', label: 'Update if contact exists', type: 'switch', defaultChecked: true, description: 'Update the existing contact instead of creating a duplicate' },
    { name: 'enrollInWorkflow', label: 'Enroll in workflow', type: 'checkbox', description: 'Automatically enroll the contact in the default onboarding workflow' },
  ],
  'shopify': [
    { name: 'shopifyAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'createProduct', label: 'Create Product' },
      { value: 'updateProduct', label: 'Update Product' },
      { value: 'createOrder', label: 'Create Order' },
      { value: 'updateInventory', label: 'Update Inventory' },
      { value: 'createDiscount', label: 'Create Discount Code' }
    ]},
    { name: 'productName', label: 'Product Name', type: 'text', placeholder: 'Product title', required: true },
    { name: 'price', label: 'Price', type: 'text', placeholder: '99.99', required: true },
    { name: 'compareAtPrice', label: 'Compare-at Price', type: 'text', placeholder: '129.99' },
    { name: 'sku', label: 'SKU', type: 'text', placeholder: 'PROD-001' },
    { name: 'quantity', label: 'Quantity', type: 'text', placeholder: '100', required: true },
    { name: 'productDescription', label: 'Product Description', type: 'textarea', placeholder: 'Product details...', rows: 4 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Product Organization' },
    { name: 'productType', label: 'Product Type', type: 'text', placeholder: 'T-Shirts' },
    { name: 'vendor', label: 'Vendor', type: 'text', placeholder: 'Brand Name' },
    { name: 'productTags', label: 'Tags', type: 'text', placeholder: 'summer, sale, featured' },
    { name: 'collection', label: 'Collection', type: 'select', options: [
      { value: 'frontpage', label: 'Home page' },
      { value: 'new_arrivals', label: 'New Arrivals' },
      { value: 'best_sellers', label: 'Best Sellers' },
      { value: 'sale', label: 'Sale' }
    ]},
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Shipping & Options' },
    { name: 'weight', label: 'Weight (kg)', type: 'text', placeholder: '0.5' },
    { name: 'requiresShipping', label: 'Requires shipping', type: 'switch', defaultChecked: true, description: 'This is a physical product that needs to be shipped' },
    { name: 'taxable', label: 'Charge tax', type: 'checkbox', defaultChecked: true, description: 'Apply tax on this product' },
    { name: 'trackInventory', label: 'Track inventory', type: 'switch', defaultChecked: true, description: 'Track stock levels for this product' },
    { name: 'publishToOnlineStore', label: 'Publish to online store', type: 'checkbox', defaultChecked: true, description: 'Make the product visible on the storefront' },
  ],
  'asana': [
    { name: 'asanaAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'createTask', label: 'Create Task' },
      { value: 'updateTask', label: 'Update Task' },
      { value: 'completeTask', label: 'Complete Task' },
      { value: 'addComment', label: 'Add Comment' },
      { value: 'createProject', label: 'Create Project' }
    ]},
    { name: 'taskName', label: 'Task Name', type: 'text', placeholder: 'Task title', required: true },
    { name: 'project', label: 'Project', type: 'text', placeholder: 'Project name', required: true },
    { name: 'section', label: 'Section', type: 'select', options: [
      { value: 'todo', label: 'To Do' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'review', label: 'In Review' },
      { value: 'done', label: 'Done' }
    ]},
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Task details...', required: false, rows: 4 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Task Details' },
    { name: 'assignee', label: 'Assignee', type: 'text', placeholder: 'user@example.com' },
    { name: 'dueDate', label: 'Due Date', type: 'text', placeholder: '2026-04-15' },
    { name: 'asanaPriority', label: 'Priority', type: 'select', options: [
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' }
    ]},
    { name: 'asanaTags', label: 'Tags', type: 'text', placeholder: 'urgent, frontend' },
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Options' },
    { name: 'addFollowers', label: 'Add followers', type: 'checkbox', description: 'Automatically add project members as followers' },
    { name: 'markDependency', label: 'Wait for dependent tasks', type: 'switch', description: 'Block this task until its dependencies are complete' },
    { name: 'customFieldsJson', label: 'Custom Fields', type: 'code', placeholder: '{\n  "Priority": "High",\n  "Sprint": "Sprint 24"\n}', rows: 4, language: 'json' },
  ],
  'telegram': [
    { name: 'telegramAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'sendMessage', label: 'Send Message' },
      { value: 'sendPhoto', label: 'Send Photo' },
      { value: 'sendDocument', label: 'Send Document' },
      { value: 'editMessage', label: 'Edit Message' }
    ]},
    { name: 'chatId', label: 'Chat ID', type: 'text', placeholder: '@username or chat_id', required: true },
    { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Message text', required: true, rows: 4 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Message Options' },
    { name: 'parseMode', label: 'Parse Mode', type: 'select', options: [
      { value: 'html', label: 'HTML' },
      { value: 'markdown', label: 'Markdown' },
      { value: 'markdownv2', label: 'MarkdownV2' }
    ]},
    { name: 'disableNotification', label: 'Silent message', type: 'switch', description: 'Send without notification sound' },
    { name: 'disableWebPreview', label: 'Disable link preview', type: 'checkbox', description: 'Don\'t show link previews in the message' },
    { name: 'protectContent', label: 'Protect content', type: 'checkbox', description: 'Prevent forwarding and saving the message' },
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Inline Keyboard' },
    { name: 'replyMarkup', label: 'Reply Markup (JSON)', type: 'code', placeholder: '{\n  "inline_keyboard": [[\n    {"text": "Open", "url": "https://..."}\n  ]]\n}', rows: 5, language: 'json' },
  ],
  'twilio': [
    { name: 'twilioAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'sendSms', label: 'Send SMS' },
      { value: 'sendWhatsApp', label: 'Send WhatsApp' },
      { value: 'makeCall', label: 'Make Call' },
      { value: 'lookupNumber', label: 'Lookup Number' }
    ]},
    { name: 'to', label: 'To Number', type: 'text', placeholder: '+1234567890', required: true },
    { name: 'from', label: 'From Number', type: 'select', required: true, options: [
      { value: '+15551234567', label: '+1 (555) 123-4567' },
      { value: '+15559876543', label: '+1 (555) 987-6543' }
    ]},
    { name: 'message', label: 'Message', type: 'textarea', placeholder: 'SMS text', required: true, rows: 3 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Delivery Options' },
    { name: 'messagingService', label: 'Messaging Service', type: 'text', placeholder: 'MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' },
    { name: 'mediaUrl', label: 'Media URL (MMS)', type: 'text', placeholder: 'https://example.com/image.jpg' },
    { name: 'statusCallback', label: 'Status Callback URL', type: 'text', placeholder: 'https://yourapp.com/webhook/status' },
    { name: 'scheduleMessage', label: 'Schedule delivery', type: 'switch', description: 'Send the message at a specific time' },
    { name: 'shortenUrls', label: 'Shorten URLs', type: 'checkbox', description: 'Automatically shorten URLs in the message' },
    { name: 'trackDelivery', label: 'Track delivery status', type: 'checkbox', defaultChecked: true, description: 'Receive delivery status updates via webhook' },
  ],
  'zoom': [
    { name: 'zoomAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'createMeeting', label: 'Create Meeting' },
      { value: 'updateMeeting', label: 'Update Meeting' },
      { value: 'deleteMeeting', label: 'Delete Meeting' },
      { value: 'listMeetings', label: 'List Meetings' },
      { value: 'addRegistrant', label: 'Add Registrant' }
    ]},
    { name: 'topic', label: 'Meeting Topic', type: 'text', placeholder: 'Team Sync', required: true },
    { name: 'date', label: 'Start Date', type: 'text', placeholder: '2026-04-15', required: true },
    { name: 'startTime', label: 'Start Time', type: 'text', placeholder: '14:00', required: true },
    { name: 'duration', label: 'Duration (minutes)', type: 'text', placeholder: '60', required: true },
    { name: 'agenda', label: 'Agenda', type: 'textarea', placeholder: 'Meeting agenda...', rows: 3 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Meeting Settings' },
    { name: 'meetingType', label: 'Meeting Type', type: 'select', options: [
      { value: 'instant', label: 'Instant Meeting' },
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'recurring_fixed', label: 'Recurring (Fixed Time)' },
      { value: 'recurring_no_fixed', label: 'Recurring (No Fixed Time)' }
    ]},
    { name: 'timezone', label: 'Timezone', type: 'select', options: [
      { value: 'America/New_York', label: 'Eastern Time (ET)' },
      { value: 'America/Chicago', label: 'Central Time (CT)' },
      { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
      { value: 'Europe/London', label: 'GMT (London)' },
      { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' }
    ]},
    { name: 'password', label: 'Meeting Password', type: 'text', placeholder: 'Optional password' },
    { name: 'enableWaitingRoom', label: 'Enable waiting room', type: 'switch', defaultChecked: true, description: 'Require host approval before participants can join' },
    { name: 'muteOnEntry', label: 'Mute participants on entry', type: 'checkbox', defaultChecked: true, description: 'Automatically mute all participants when they join' },
    { name: 'autoRecording', label: 'Auto-record meeting', type: 'switch', description: 'Automatically start recording when the meeting begins' },
    { name: 'allowJoinBeforeHost', label: 'Allow join before host', type: 'checkbox', description: 'Let participants join before the host arrives' },
    { name: 'enableBreakoutRooms', label: 'Enable breakout rooms', type: 'checkbox', description: 'Allow creating breakout rooms during the meeting' },
  ],
  'dropbox': [
    { name: 'dropboxAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'uploadFile', label: 'Upload File' },
      { value: 'downloadFile', label: 'Download File' },
      { value: 'createFolder', label: 'Create Folder' },
      { value: 'moveFile', label: 'Move File' },
      { value: 'createSharedLink', label: 'Create Shared Link' }
    ]},
    { name: 'filePath', label: 'File Path', type: 'text', placeholder: '/folder/file.pdf', required: true },
    { name: 'destinationPath', label: 'Destination Path', type: 'text', placeholder: '/archive/file.pdf' },
    { name: 'content', label: 'File Content / URL', type: 'textarea', placeholder: 'File content or source URL', required: false, rows: 4 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Upload Options' },
    { name: 'writeMode', label: 'Write Mode', type: 'select', options: [
      { value: 'add', label: 'Add (don\'t overwrite)' },
      { value: 'overwrite', label: 'Overwrite' },
      { value: 'update', label: 'Update (specific revision)' }
    ]},
    { name: 'autoRename', label: 'Auto-rename on conflict', type: 'switch', defaultChecked: true, description: 'Automatically rename the file if it already exists' },
    { name: 'strictConflict', label: 'Strict conflict checking', type: 'checkbox', description: 'Fail the upload if the file already exists' },
    { name: 'muteNotifications', label: 'Suppress notifications', type: 'checkbox', description: 'Don\'t notify other users about this change' },
  ],
  'gdrive': [
    { name: 'gdriveAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'uploadFile', label: 'Upload File' },
      { value: 'createFolder', label: 'Create Folder' },
      { value: 'moveFile', label: 'Move File' },
      { value: 'copyFile', label: 'Copy File' },
      { value: 'createShortcut', label: 'Create Shortcut' }
    ]},
    { name: 'fileName', label: 'File Name', type: 'text', placeholder: 'document.pdf', required: true },
    { name: 'folder', label: 'Folder', type: 'select', options: [
      { value: 'root', label: 'My Drive (Root)' },
      { value: 'shared', label: 'Shared with Me' },
      { value: 'projects', label: 'Projects' },
      { value: 'archives', label: 'Archives' }
    ]},
    { name: 'content', label: 'Content', type: 'textarea', placeholder: 'File content or source URL', required: false, rows: 4 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Permissions' },
    { name: 'shareWith', label: 'Share With', type: 'text', placeholder: 'user@example.com' },
    { name: 'role', label: 'Permission Level', type: 'select', options: [
      { value: 'reader', label: 'Viewer' },
      { value: 'commenter', label: 'Commenter' },
      { value: 'writer', label: 'Editor' }
    ]},
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Options' },
    { name: 'convertToGoogleFormat', label: 'Convert to Google format', type: 'switch', description: 'Convert uploaded files to Google Docs/Sheets format' },
    { name: 'notifySharedUsers', label: 'Send notification email', type: 'checkbox', defaultChecked: true, description: 'Notify users when a file is shared with them' },
    { name: 'keepRevisionForever', label: 'Pin this revision', type: 'checkbox', description: 'Keep this version permanently in revision history' },
    { name: 'ocrLanguage', label: 'OCR Language', type: 'select', options: [
      { value: '', label: 'None (disabled)' },
      { value: 'en', label: 'English' },
      { value: 'ar', label: 'Arabic' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' }
    ]},
  ],
  'gsheets': [
    { name: 'gsheetsAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'appendRow', label: 'Append Row' },
      { value: 'updateRow', label: 'Update Row' },
      { value: 'readRows', label: 'Read Rows' },
      { value: 'clearSheet', label: 'Clear Sheet' },
      { value: 'createSheet', label: 'Create Spreadsheet' }
    ]},
    { name: 'spreadsheet', label: 'Spreadsheet', type: 'text', placeholder: 'Spreadsheet name or ID', required: true },
    { name: 'sheet', label: 'Sheet Name', type: 'text', placeholder: 'Sheet1', required: true },
    { name: 'range', label: 'Range', type: 'text', placeholder: 'A1:B10', required: true },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Data Input' },
    { name: 'values', label: 'Row Values', type: 'code', placeholder: '[["Name", "Email", "Phone"],\n ["John", "john@test.com", "+1234567890"]]', rows: 5, language: 'json' },
    { name: 'valueInputOption', label: 'Value Input Option', type: 'select', options: [
      { value: 'RAW', label: 'Raw (as-is)' },
      { value: 'USER_ENTERED', label: 'User Entered (parse formulas)' }
    ]},
    { name: 'insertDataOption', label: 'Insert Data Option', type: 'select', options: [
      { value: 'INSERT_ROWS', label: 'Insert Rows' },
      { value: 'OVERWRITE', label: 'Overwrite' }
    ]},
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Options' },
    { name: 'includeHeaders', label: 'First row is headers', type: 'switch', defaultChecked: true, description: 'Treat the first row as column headers' },
    { name: 'autoResizeColumns', label: 'Auto-resize columns', type: 'checkbox', description: 'Automatically adjust column widths to fit content' },
    { name: 'formatAsTable', label: 'Apply table formatting', type: 'checkbox', description: 'Apply alternating row colors and borders' },
  ],
  'spotify': [
    { name: 'spotifyAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'addToPlaylist', label: 'Add to Playlist' },
      { value: 'createPlaylist', label: 'Create Playlist' },
      { value: 'searchTrack', label: 'Search Track' },
      { value: 'getRecommendations', label: 'Get Recommendations' }
    ]},
    { name: 'playlistName', label: 'Playlist Name', type: 'text', placeholder: 'My Playlist', required: true },
    { name: 'trackUri', label: 'Track URI', type: 'text', placeholder: 'spotify:track:...' },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Playlist Settings' },
    { name: 'playlistDescription', label: 'Description', type: 'textarea', placeholder: 'Playlist description...', rows: 3 },
    { name: 'isPublic', label: 'Public playlist', type: 'switch', defaultChecked: true, description: 'Make the playlist visible to everyone' },
    { name: 'collaborative', label: 'Collaborative', type: 'checkbox', description: 'Allow others to add tracks to this playlist' },
    { name: 'position', label: 'Insert Position', type: 'text', placeholder: '0 (beginning)' },
  ],
  'unsplash': [
    { name: 'query', label: 'Search Query', type: 'text', placeholder: 'nature landscape', required: true },
    { name: 'count', label: 'Number of Images', type: 'text', placeholder: '10' },
    { name: 'orientation', label: 'Orientation', type: 'select', options: [
      { value: 'landscape', label: 'Landscape' },
      { value: 'portrait', label: 'Portrait' },
      { value: 'squarish', label: 'Square' }
    ]},
    { name: 'color', label: 'Color Filter', type: 'select', options: [
      { value: '', label: 'Any' },
      { value: 'black_and_white', label: 'Black & White' },
      { value: 'black', label: 'Black' },
      { value: 'white', label: 'White' },
      { value: 'yellow', label: 'Yellow' },
      { value: 'red', label: 'Red' },
      { value: 'blue', label: 'Blue' },
      { value: 'green', label: 'Green' }
    ]},
  ],
  'trigger': [
    { name: 'url', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.yourapp.com/...', required: false },
    { name: 'method', label: 'HTTP Method', type: 'select', required: false, options: [
      { value: 'POST', label: 'POST' },
      { value: 'GET', label: 'GET' },
      { value: 'PUT', label: 'PUT' },
      { value: 'PATCH', label: 'PATCH' },
      { value: 'DELETE', label: 'DELETE' }
    ]},
    { name: 'contentType', label: 'Content Type', type: 'select', options: [
      { value: 'application/json', label: 'JSON' },
      { value: 'application/x-www-form-urlencoded', label: 'Form URL Encoded' },
      { value: 'multipart/form-data', label: 'Multipart Form Data' },
      { value: 'text/plain', label: 'Plain Text' }
    ]},
    { name: 'headers', label: 'Headers', type: 'code', placeholder: '{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer {{token}}"\n}', required: false, rows: 5, language: 'json' },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Authentication' },
    { name: 'authType', label: 'Auth Type', type: 'select', options: [
      { value: 'none', label: 'None' },
      { value: 'basic', label: 'Basic Auth' },
      { value: 'bearer', label: 'Bearer Token' },
      { value: 'api_key', label: 'API Key' },
      { value: 'hmac', label: 'HMAC Signature' }
    ]},
    { name: 'secret', label: 'Webhook Secret', type: 'text', placeholder: 'whsec_...' },
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Options' },
    { name: 'validatePayload', label: 'Validate payload schema', type: 'switch', defaultChecked: true, description: 'Reject requests that don\'t match the expected schema' },
    { name: 'logRequests', label: 'Log incoming requests', type: 'checkbox', defaultChecked: true, description: 'Store incoming webhook payloads for debugging' },
    { name: 'retryOnFailure', label: 'Retry on downstream failure', type: 'checkbox', description: 'Re-process the webhook if a later step fails' },
  ],
  'linear': [
    { name: 'linearAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'createIssue', label: 'Create Issue' },
      { value: 'updateIssue', label: 'Update Issue' },
      { value: 'createProject', label: 'Create Project' },
      { value: 'addComment', label: 'Add Comment' }
    ]},
    { name: 'team', label: 'Team', type: 'select', required: true, options: [
      { value: 'engineering', label: 'Engineering' },
      { value: 'design', label: 'Design' },
      { value: 'product', label: 'Product' }
    ]},
    { name: 'issueTitle', label: 'Issue Title', type: 'text', placeholder: 'Bug: Login page broken', required: true },
    { name: 'issueDescription', label: 'Description', type: 'textarea', placeholder: 'Detailed description...', rows: 5 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Issue Properties' },
    { name: 'linearStatus', label: 'Status', type: 'select', options: [
      { value: 'backlog', label: 'Backlog' },
      { value: 'todo', label: 'Todo' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'in_review', label: 'In Review' },
      { value: 'done', label: 'Done' }
    ]},
    { name: 'linearPriority', label: 'Priority', type: 'select', options: [
      { value: 'urgent', label: 'Urgent' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
      { value: 'none', label: 'No Priority' }
    ]},
    { name: 'linearAssignee', label: 'Assignee', type: 'text', placeholder: 'user@company.com' },
    { name: 'linearLabels', label: 'Labels', type: 'text', placeholder: 'bug, frontend, P0' },
    { name: 'estimate', label: 'Estimate (points)', type: 'select', options: [
      { value: '1', label: '1 point' },
      { value: '2', label: '2 points' },
      { value: '3', label: '3 points' },
      { value: '5', label: '5 points' },
      { value: '8', label: '8 points' }
    ]},
    { name: 'cycle', label: 'Cycle', type: 'select', options: [
      { value: 'current', label: 'Current Cycle' },
      { value: 'next', label: 'Next Cycle' }
    ]},
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Options' },
    { name: 'subscribeToCReator', label: 'Subscribe creator', type: 'checkbox', defaultChecked: true, description: 'Automatically subscribe the creator to issue updates' },
    { name: 'createSubIssue', label: 'Create as sub-issue', type: 'switch', description: 'Attach this issue as a child of another issue' },
  ],
  'jira': [
    { name: 'jiraAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'createIssue', label: 'Create Issue' },
      { value: 'updateIssue', label: 'Update Issue' },
      { value: 'transitionIssue', label: 'Transition Issue' },
      { value: 'addComment', label: 'Add Comment' },
      { value: 'assignIssue', label: 'Assign Issue' }
    ]},
    { name: 'jiraProject', label: 'Project', type: 'select', required: true, options: [
      { value: 'ENG', label: 'ENG - Engineering' },
      { value: 'PROD', label: 'PROD - Product' },
      { value: 'DES', label: 'DES - Design' },
      { value: 'OPS', label: 'OPS - DevOps' }
    ]},
    { name: 'issueType', label: 'Issue Type', type: 'select', required: true, options: [
      { value: 'bug', label: 'Bug' },
      { value: 'story', label: 'Story' },
      { value: 'task', label: 'Task' },
      { value: 'epic', label: 'Epic' },
      { value: 'subtask', label: 'Sub-task' }
    ]},
    { name: 'summary', label: 'Summary', type: 'text', placeholder: 'Issue summary', required: true },
    { name: 'jiraDescription', label: 'Description', type: 'textarea', placeholder: 'Detailed description...', rows: 5 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Issue Details' },
    { name: 'jiraPriority', label: 'Priority', type: 'select', options: [
      { value: 'highest', label: 'Highest' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
      { value: 'lowest', label: 'Lowest' }
    ]},
    { name: 'jiraAssignee', label: 'Assignee', type: 'text', placeholder: 'username' },
    { name: 'reporter', label: 'Reporter', type: 'text', placeholder: 'username' },
    { name: 'jiraLabels', label: 'Labels', type: 'text', placeholder: 'backend, api, v2' },
    { name: 'components', label: 'Components', type: 'text', placeholder: 'Authentication, API' },
    { name: 'fixVersion', label: 'Fix Version', type: 'select', options: [
      { value: '1.0', label: '1.0' },
      { value: '1.1', label: '1.1' },
      { value: '2.0', label: '2.0' }
    ]},
    { name: 'storyPoints', label: 'Story Points', type: 'text', placeholder: '5' },
    { name: 'sprint', label: 'Sprint', type: 'select', options: [
      { value: 'current', label: 'Current Sprint' },
      { value: 'next', label: 'Next Sprint' },
      { value: 'backlog', label: 'Backlog' }
    ]},
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Options' },
    { name: 'notifyAssignee', label: 'Notify assignee', type: 'switch', defaultChecked: true, description: 'Send email notification to the assigned user' },
    { name: 'addWatchers', label: 'Add watchers from template', type: 'checkbox', description: 'Automatically add default watchers from the project settings' },
    { name: 'linkToParent', label: 'Link to parent epic', type: 'checkbox', description: 'Create an "is part of" link to a parent epic' },
  ],
  'trello': [
    { name: 'trelloAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'createCard', label: 'Create Card' },
      { value: 'updateCard', label: 'Update Card' },
      { value: 'moveCard', label: 'Move Card' },
      { value: 'addComment', label: 'Add Comment' },
      { value: 'addChecklist', label: 'Add Checklist' }
    ]},
    { name: 'board', label: 'Board', type: 'select', required: true, options: [
      { value: 'product_roadmap', label: 'Product Roadmap' },
      { value: 'sprint_board', label: 'Sprint Board' },
      { value: 'content_pipeline', label: 'Content Pipeline' }
    ]},
    { name: 'list', label: 'List', type: 'select', required: true, options: [
      { value: 'todo', label: 'To Do' },
      { value: 'doing', label: 'Doing' },
      { value: 'review', label: 'Review' },
      { value: 'done', label: 'Done' }
    ]},
    { name: 'cardName', label: 'Card Name', type: 'text', placeholder: 'Card title', required: true },
    { name: 'cardDescription', label: 'Description', type: 'textarea', placeholder: 'Card description...', rows: 4 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Card Details' },
    { name: 'members', label: 'Members', type: 'text', placeholder: 'username1, username2' },
    { name: 'trelloLabels', label: 'Labels', type: 'select', options: [
      { value: 'green', label: '🟢 Green' },
      { value: 'yellow', label: '🟡 Yellow' },
      { value: 'orange', label: '🟠 Orange' },
      { value: 'red', label: '🔴 Red' },
      { value: 'purple', label: '🟣 Purple' },
      { value: 'blue', label: '🔵 Blue' }
    ]},
    { name: 'trelloDueDate', label: 'Due Date', type: 'text', placeholder: '2026-04-15' },
    { name: 'position', label: 'Position', type: 'select', options: [
      { value: 'top', label: 'Top of list' },
      { value: 'bottom', label: 'Bottom of list' }
    ]},
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Options' },
    { name: 'trelloSubscribe', label: 'Subscribe to card', type: 'checkbox', defaultChecked: true, description: 'Get notifications for changes to this card' },
    { name: 'markComplete', label: 'Mark due date as complete', type: 'switch', description: 'Mark the due date checkbox as complete' },
  ],
  'mailchimp': [
    { name: 'mailchimpAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'addSubscriber', label: 'Add/Update Subscriber' },
      { value: 'removeSubscriber', label: 'Remove Subscriber' },
      { value: 'sendCampaign', label: 'Send Campaign' },
      { value: 'createCampaign', label: 'Create Campaign' },
      { value: 'addTag', label: 'Add Tag to Contact' }
    ]},
    { name: 'audience', label: 'Audience', type: 'select', required: true, options: [
      { value: 'main', label: 'Main Newsletter' },
      { value: 'customers', label: 'Customers' },
      { value: 'prospects', label: 'Prospects' },
      { value: 'beta_users', label: 'Beta Users' }
    ]},
    { name: 'subscriberEmail', label: 'Email Address', type: 'text', placeholder: 'subscriber@example.com', required: true },
    { name: 'subscriberFirstName', label: 'First Name', type: 'text', placeholder: 'Jane' },
    { name: 'subscriberLastName', label: 'Last Name', type: 'text', placeholder: 'Smith' },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Subscription Settings' },
    { name: 'mailchimpStatus', label: 'Status', type: 'select', options: [
      { value: 'subscribed', label: 'Subscribed' },
      { value: 'pending', label: 'Pending (double opt-in)' },
      { value: 'unsubscribed', label: 'Unsubscribed' },
      { value: 'cleaned', label: 'Cleaned' }
    ]},
    { name: 'mailchimpTags', label: 'Tags', type: 'text', placeholder: 'newsletter, vip, early-access' },
    { name: 'language', label: 'Language', type: 'select', options: [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
      { value: 'ar', label: 'Arabic' },
      { value: 'de', label: 'German' }
    ]},
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Options' },
    { name: 'doubleOptIn', label: 'Require double opt-in', type: 'switch', description: 'Send confirmation email before subscribing' },
    { name: 'updateExisting', label: 'Update if exists', type: 'switch', defaultChecked: true, description: 'Update the subscriber if the email already exists' },
    { name: 'sendWelcome', label: 'Send welcome email', type: 'checkbox', defaultChecked: true, description: 'Send an automated welcome email to new subscribers' },
    { name: 'gdprConsent', label: 'GDPR consent given', type: 'checkbox', description: 'Mark the subscriber as having given GDPR consent' },
  ],
  'salesforce': [
    { name: 'sfAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'createRecord', label: 'Create Record' },
      { value: 'updateRecord', label: 'Update Record' },
      { value: 'findRecord', label: 'Find Record' },
      { value: 'deleteRecord', label: 'Delete Record' },
      { value: 'upsertRecord', label: 'Upsert Record' }
    ]},
    { name: 'sfObject', label: 'Object Type', type: 'select', required: true, options: [
      { value: 'Contact', label: 'Contact' },
      { value: 'Lead', label: 'Lead' },
      { value: 'Account', label: 'Account' },
      { value: 'Opportunity', label: 'Opportunity' },
      { value: 'Case', label: 'Case' },
      { value: 'Task', label: 'Task' }
    ]},
    { name: 'sfFirstName', label: 'First Name', type: 'text', placeholder: 'John', required: true },
    { name: 'sfLastName', label: 'Last Name', type: 'text', placeholder: 'Doe', required: true },
    { name: 'sfEmail', label: 'Email', type: 'text', placeholder: 'john@company.com' },
    { name: 'sfPhone', label: 'Phone', type: 'text', placeholder: '+1 (555) 123-4567' },
    { name: 'sfCompany', label: 'Company / Account', type: 'text', placeholder: 'Acme Corp' },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Record Details' },
    { name: 'sfLeadSource', label: 'Lead Source', type: 'select', options: [
      { value: 'web', label: 'Web' },
      { value: 'phone', label: 'Phone Inquiry' },
      { value: 'referral', label: 'Partner Referral' },
      { value: 'social', label: 'Social Media' },
      { value: 'event', label: 'Trade Show / Event' }
    ]},
    { name: 'sfDescription', label: 'Description', type: 'textarea', placeholder: 'Additional details...', rows: 4 },
    { name: 'sfOwner', label: 'Record Owner', type: 'text', placeholder: 'owner@company.com' },
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Options' },
    { name: 'sfDeduplicate', label: 'Check for duplicates', type: 'switch', defaultChecked: true, description: 'Search for existing records before creating' },
    { name: 'sfTriggerWorkflow', label: 'Trigger Salesforce workflow', type: 'checkbox', description: 'Allow Salesforce workflow rules to fire on this record' },
    { name: 'sfAssignmentRules', label: 'Use assignment rules', type: 'checkbox', description: 'Apply lead/case assignment rules to this record' },
  ],
  'zendesk': [
    { name: 'zdAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'createTicket', label: 'Create Ticket' },
      { value: 'updateTicket', label: 'Update Ticket' },
      { value: 'addComment', label: 'Add Comment' },
      { value: 'findTicket', label: 'Find Ticket' },
      { value: 'closeTicket', label: 'Close Ticket' }
    ]},
    { name: 'zdSubject', label: 'Subject', type: 'text', placeholder: 'Ticket subject', required: true },
    { name: 'zdRequester', label: 'Requester Email', type: 'text', placeholder: 'user@example.com', required: true },
    { name: 'zdDescription', label: 'Description', type: 'textarea', placeholder: 'Ticket description...', required: true, rows: 5 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'Ticket Properties' },
    { name: 'zdPriority', label: 'Priority', type: 'select', options: [
      { value: 'urgent', label: 'Urgent' },
      { value: 'high', label: 'High' },
      { value: 'normal', label: 'Normal' },
      { value: 'low', label: 'Low' }
    ]},
    { name: 'zdType', label: 'Type', type: 'select', options: [
      { value: 'problem', label: 'Problem' },
      { value: 'incident', label: 'Incident' },
      { value: 'question', label: 'Question' },
      { value: 'task', label: 'Task' }
    ]},
    { name: 'zdGroup', label: 'Group', type: 'select', options: [
      { value: 'support', label: 'Support' },
      { value: 'billing', label: 'Billing' },
      { value: 'engineering', label: 'Engineering' },
      { value: 'sales', label: 'Sales' }
    ]},
    { name: 'zdAssignee', label: 'Assignee', type: 'text', placeholder: 'agent@company.com' },
    { name: 'zdTags', label: 'Tags', type: 'text', placeholder: 'billing, urgent, vip' },
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Options' },
    { name: 'zdInternalNote', label: 'Add as internal note', type: 'switch', description: 'Post the comment as an internal note (not visible to requester)' },
    { name: 'zdNotifyRequester', label: 'Notify requester', type: 'switch', defaultChecked: true, description: 'Send email notification to the requester' },
    { name: 'zdAutoSolve', label: 'Auto-solve after response', type: 'checkbox', description: 'Mark the ticket as solved after the first agent response' },
  ],
  'intercom': [
    { name: 'icAction', label: 'Action', type: 'select', required: true, options: [
      { value: 'createConversation', label: 'Create Conversation' },
      { value: 'replyConversation', label: 'Reply to Conversation' },
      { value: 'createUser', label: 'Create/Update User' },
      { value: 'addTag', label: 'Add Tag' },
      { value: 'sendMessage', label: 'Send In-app Message' }
    ]},
    { name: 'icUserEmail', label: 'User Email', type: 'text', placeholder: 'user@example.com', required: true },
    { name: 'icMessage', label: 'Message', type: 'textarea', placeholder: 'Message content...', required: true, rows: 5 },
    { name: 'divider1', label: '', type: 'divider', sectionTitle: 'User Attributes' },
    { name: 'icUserName', label: 'User Name', type: 'text', placeholder: 'Jane Doe' },
    { name: 'icCompany', label: 'Company', type: 'text', placeholder: 'Acme Inc.' },
    { name: 'icPlan', label: 'Plan', type: 'select', options: [
      { value: 'free', label: 'Free' },
      { value: 'starter', label: 'Starter' },
      { value: 'pro', label: 'Pro' },
      { value: 'enterprise', label: 'Enterprise' }
    ]},
    { name: 'icCustomAttributes', label: 'Custom Attributes', type: 'code', placeholder: '{\n  "signed_up_at": "2026-01-15",\n  "plan": "pro",\n  "monthly_spend": 299\n}', rows: 5, language: 'json' },
    { name: 'divider2', label: '', type: 'divider', sectionTitle: 'Options' },
    { name: 'icMessageType', label: 'Message Type', type: 'select', options: [
      { value: 'comment', label: 'Comment' },
      { value: 'note', label: 'Note (internal)' }
    ]},
    { name: 'icAssignToTeam', label: 'Auto-assign to team', type: 'switch', description: 'Route the conversation to a team based on rules' },
    { name: 'icSnooze', label: 'Snooze conversation', type: 'checkbox', description: 'Snooze the conversation after reply' },
    { name: 'icCloseOnReply', label: 'Close after reply', type: 'checkbox', description: 'Automatically close the conversation after sending a reply' },
  ],
};
