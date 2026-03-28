import { X, Pencil, HelpCircle, Plus, Calendar, Clock, Webhook, Wrench, Database, Play, ChevronLeft, ChevronRight, ChevronUp, GripVertical, GripHorizontal, Rows2, Columns2, PanelBottomClose, PanelRightClose, CheckCircle2, XCircle, Loader2, Copy, Download, ArrowLeft, Check } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DataTag, DataTagValue } from './DataTag';
import { TreeJsonViewer } from './TreeJsonViewer';
import { TagInput, FUNCTION_SEPARATORS } from './TagInput';
import { TestSection, TestSectionHandle } from './TestSection';
import { DataSelector } from './DataSelector';
import { APP_FIELD_DEFINITIONS } from './app-field-definitions';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';

// Inline Switch Toggle component
function SwitchToggle({ id, defaultChecked }: { id: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked || false);
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => setChecked(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 ${checked ? 'bg-[hsl(257,74%,50%)]' : 'bg-gray-300'}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );
}

interface Step {
  id: string;
  appId: string;
  name: string;
  originalName: string;
  icon: React.ReactNode;
  color: string;
}

interface RightSidebarProps {
  selectedCardId: string | null;
  steps: Array<{ id: string; appId: string; name: string; originalName: string; icon: React.ReactNode; color: string; }>;
  onClose: () => void;
  canvasDimensions?: { width: number; height: number; top: number; left: number; };
  onStepSelect?: (stepId: string) => void;
  onDataSelectorExpand?: (prompt?: string) => void;
  onInputFocusChange?: (element: HTMLElement | null) => void;
  isExpandedDataSelectorOpen?: boolean;
  isExpandedDataSelectorMinimized?: boolean;
  onFieldsToFillChange?: (fields: Array<{ name: string; label: string; type: 'text' | 'textarea' | 'select'; placeholder?: string; options?: Array<{ value: string; label: string }> }>) => void;
  fieldValues?: Record<string, string>;
  currentFillingField?: string | null;
  onFieldFilled?: (fieldName: string, value: string, skipFocus?: boolean) => void;
  onCurrentFieldChange?: (fieldName: string) => void;
  testButtonClickSignal?: boolean;
  testButtonGlowSignal?: boolean;
  onTestButtonClickHandled?: () => void;
  onTestButtonGlowHandled?: () => void;
  testResults?: Record<string, { status: 'idle' | 'testing' | 'success' | 'failed'; output: any; date: string | null }>;
  onTestComplete?: (stepId: string, result: { status: 'idle' | 'testing' | 'success' | 'failed'; output: any; date: string | null }) => void;
  onStepNameChange?: (stepId: string, newName: string) => void;
}

// Shared input/select/textarea field classes with gray focus
const inputClasses = "w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-700 [line-height:20px] [font-family:Inter,sans-serif]";
const textareaClasses = "w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none disabled:bg-gray-100 disabled:text-gray-700 [line-height:20px] [font-family:Inter,sans-serif]";

// App descriptions for tooltip
const APP_DESCRIPTIONS: Record<string, string> = {
  'gmail': 'Send, read, or draft emails using Gmail',
  'slack': 'Post messages to Slack channels',
  'notion': 'Create and manage pages in Notion databases',
  'stripe': 'Process payments and manage charges with Stripe',
  'github': 'Create issues and manage repositories on GitHub',
  'gcal': 'Create and manage Google Calendar events',
  'airtable': 'Add and manage records in Airtable',
  'hubspot': 'Manage contacts and deals in HubSpot',
  'shopify': 'Manage products and orders in Shopify',
  'asana': 'Create and manage tasks in Asana',
  'telegram': 'Send messages via Telegram',
  'twilio': 'Send SMS messages via Twilio',
  'zoom': 'Create and manage Zoom meetings',
  'dropbox': 'Upload and manage files in Dropbox',
  'gdrive': 'Manage files and folders in Google Drive',
  'gsheets': 'Read and write data in Google Sheets',
  'spotify': 'Manage playlists and tracks on Spotify',
  'trigger': 'Webhook trigger to start the automation',
  'webhook': 'Webhook trigger to start the automation',
  'linear': 'Create and manage issues in Linear',
  'jira': 'Create and manage Jira issues',
  'trello': 'Manage cards and boards in Trello',
  'mailchimp': 'Manage email campaigns in Mailchimp',
  'salesforce': 'Manage records in Salesforce CRM',
  'zendesk': 'Manage tickets in Zendesk',
  'intercom': 'Manage conversations in Intercom',
};

// Original app names by appId
const APP_NAMES: Record<string, string> = {
  'gmail': 'Gmail',
  'slack': 'Slack',
  'notion': 'Notion',
  'stripe': 'Stripe',
  'github': 'GitHub',
  'gcal': 'Google Calendar',
  'airtable': 'Airtable',
  'hubspot': 'HubSpot',
  'shopify': 'Shopify',
  'asana': 'Asana',
  'telegram': 'Telegram',
  'twilio': 'Twilio',
  'zoom': 'Zoom',
  'dropbox': 'Dropbox',
  'gdrive': 'Google Drive',
  'gsheets': 'Google Sheets',
  'spotify': 'Spotify',
  'trigger': 'Catch Webhook',
  'webhook': 'Webhook',
  'linear': 'Linear',
  'jira': 'Jira',
  'trello': 'Trello',
  'mailchimp': 'Mailchimp',
  'salesforce': 'Salesforce',
  'zendesk': 'Zendesk',
  'intercom': 'Intercom',
};

export function RightSidebar({ selectedCardId, steps, onClose, canvasDimensions, onStepSelect, onDataSelectorExpand, onInputFocusChange, isExpandedDataSelectorOpen, isExpandedDataSelectorMinimized, onFieldsToFillChange, fieldValues = {}, currentFillingField = null, onFieldFilled, onCurrentFieldChange, testButtonClickSignal = false, testButtonGlowSignal = false, onTestButtonClickHandled, onTestButtonGlowHandled, testResults = {}, onTestComplete, onStepNameChange }: RightSidebarProps) {
  const MIN_WIDTH = 320;
  const SPLIT_VIEW_MIN_WIDTH = 420;
  const [sidebarWidth, setSidebarWidth] = useState(MIN_WIDTH);
  const prevWidthBeforeSplitRef = useRef(MIN_WIDTH);
  const isResizingRef = useRef(false);
  const wasSplitViewOnDragStartRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(MIN_WIDTH);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    wasSplitViewOnDragStartRef.current = isSplitViewRef.current;
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isResizingRef.current) return;
      const delta = startXRef.current - ev.clientX;
      const maxW = wasSplitViewOnDragStartRef.current ? 900 : 640;
      const newWidth = Math.min(maxW, Math.max(MIN_WIDTH, startWidthRef.current + delta));
      setSidebarWidth(newWidth);
      if (wasSplitViewOnDragStartRef.current) {
        // Collapse when test panel hits its min-width (200px = 40% of 500px)
        const testPanelMinThreshold = 500;
        if (newWidth <= testPanelMinThreshold && isSplitViewRef.current) {
          setIsSplitView(false);
        } else if (newWidth > testPanelMinThreshold && !isSplitViewRef.current) {
          setIsSplitView(true);
        }
      }
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      if (wasSplitViewOnDragStartRef.current && !isSplitViewRef.current) {
        prevWidthBeforeSplitRef.current = MIN_WIDTH;
      }
      wasSplitViewOnDragStartRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [sidebarWidth]);

  const [isOpen, setIsOpen] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [isSkeletonLoading, setIsSkeletonLoading] = useState(false);
  const [showDataSelector, setShowDataSelector] = useState(false);
  const [isDataSelectorMinimized, setIsDataSelectorMinimized] = useState(false);
  const [isDataSelectorExpanded, setIsDataSelectorExpanded] = useState(false);
  const [activeInputElement, setActiveInputElement] = useState<HTMLElement | null>(null);
  const dataSelectorRef = useRef<HTMLDivElement>(null);
  const [dataSelectorPosition, setDataSelectorPosition] = useState<{ top: number; left: number } | null>(null);
  
  // 🚫 Flag to skip Data Selector when filling from code (not user click)
  const skipDataSelectorRef = useRef(false);
  const lastFilledFieldRef = useRef<string | null>(null);
  const skipFocusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastInsertTimestamp = useRef<number>(0); // 🕐 Timestamp of last Insert button click
  
  // Refs لحقول Gmail (kept for backward compatibility)
  const gmailToRef = useRef<any>(null);
  const gmailSubjectRef = useRef<any>(null);
  const gmailBodyRef = useRef<any>(null);
  const gmailActionRef = useRef<HTMLSelectElement>(null);
  
  // 🎯 Dynamic refs system for any app
  const dynamicFieldRefs = useRef<Record<string, any>>({});
  
  // Ref for Test button
  const testButtonRef = useRef<HTMLButtonElement>(null);
  const testButtonWrapperRef = useRef<HTMLDivElement>(null);
  const testButtonHeaderPortalRef = useRef<HTMLDivElement>(null);
  
  // Ref for TestSection to trigger test programmatically
  const testSectionRef = useRef<TestSectionHandle>(null);
  const bottomSheetRef = useRef<HTMLDivElement>(null);
  
  // State for dropdown values
  const [gmailActionValue, setGmailActionValue] = useState('');
  const [dynamicSelectValues, setDynamicSelectValues] = useState<Record<string, string>>({});
  
  // State for test button glow
  const [isTestButtonGlowing, setIsTestButtonGlowing] = useState(false);
  
  // State for tracking if required fields are filled
  const [hasEmptyRequiredFields, setHasEmptyRequiredFields] = useState(true);
  const [testButtonTooltip, setTestButtonTooltip] = useState(false);
  
  // State for header tooltip
  const [headerTooltip, setHeaderTooltip] = useState<{ visible: boolean; x: number; y: number }>({ visible: false, x: 0, y: 0 });
  
  // Persistent storage for field values per step
  const savedStepFieldValues = useRef<Record<string, { selectValues: Record<string, string>; fieldHTML: Record<string, string> }>>({});
  const prevSelectedCardId = useRef<string | null>(null);
  const prevRenderCardId = useRef<string | null>(null);
  
  // Refs to track last streamed values and active intervals
  const lastStreamedValues = useRef<Record<string, string>>({});
  const activeIntervals = useRef<Record<string, NodeJS.Timeout>>({});
  
  // 🧹 Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (skipFocusTimeoutRef.current) {
        clearTimeout(skipFocusTimeoutRef.current);
      }
    };
  }, []);
  
  // 🎯 Get fields to fill based on step type - FULLY DYNAMIC (moved before useEffects)
  const getFieldsToFill = useCallback(() => {
    const selectedStep = steps.find(s => s.id === selectedCardId);
    if (!selectedStep) return [];
    
    const isTrigger = selectedCardId === steps[0]?.id;
    if (isTrigger) return [];
    
    const appId = selectedStep.appId;
    
    // Get fields from dynamic definitions
    const fields = APP_FIELD_DEFINITIONS[appId];
    if (!fields) return [];
    
    // Return only fillable fields in the correct format for AIFillAssistant
    return fields
      .filter(field => field.type === 'text' || field.type === 'textarea' || field.type === 'select')
      .map(field => ({
        name: field.name,
        label: field.label,
        type: field.type as 'text' | 'textarea' | 'select',
        placeholder: field.placeholder,
        options: field.options
      }));
  }, [selectedCardId, steps]);
  
  // 🎯 Auto-scroll to the current filling field - NOW FULLY DYNAMIC!
  useEffect(() => {
    if (!currentFillingField) return;
    
    console.log('📍 Auto-scroll - Current field:', currentFillingField);
    console.log('📍 Available dynamic refs:', Object.keys(dynamicFieldRefs.current));
    
    const scrollToElement = (element: any) => {
      if (!element) return;
      
      const actualElement = element.getElement ? element.getElement() : element;
      if (actualElement) {
        // Scroll to element
        if (actualElement.scrollIntoView) {
          console.log('🎯 Scrolling to:', currentFillingField);
          actualElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
        
        // Focus on element after scroll
        setTimeout(() => {
          // For TagInput, use the focus method from ref
          if (element.focus && typeof element.focus === 'function') {
            console.log('🎯 Focusing on TagInput:', currentFillingField);
            element.focus();
          }
          // For regular inputs, use the DOM focus
          else if (actualElement.focus) {
            console.log('🎯 Focusing on input:', currentFillingField);
            actualElement.focus();
          }
        }, 300);
      }
    };
    
    // 🔥 Try dynamic refs first (for all apps)
    const dynamicRef = dynamicFieldRefs.current[currentFillingField];
    if (dynamicRef) {
      console.log('✅ Found dynamic ref for:', currentFillingField);
      setTimeout(() => scrollToElement(dynamicRef), 200);
      return;
    }
    
    console.log('⚠️ No dynamic ref found, trying Gmail fallback...');
    
    // Fallback to Gmail specific refs (backward compatibility)
    const fieldRefMap: Record<string, any> = {
      'to': gmailToRef,
      'subject': gmailSubjectRef,
      'body': gmailBodyRef,
      'action': gmailActionRef,
    };
    
    const fieldRef = fieldRefMap[currentFillingField];
    if (fieldRef?.current) {
      // Small delay to ensure the element is ready and glow animation started
      setTimeout(() => {
        const element = fieldRef.current.getElement ? fieldRef.current.getElement() : fieldRef.current;
        if (element && element.scrollIntoView) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 200);
    }
  }, [currentFillingField]);
  
  // Function to stream text character by character
  const streamText = (text: string, ref: React.RefObject<any>, fieldName: string) => {
    if (!ref.current?.insertText) return;
    
    // Clear any existing interval for this field
    if (activeIntervals.current[fieldName]) {
      clearInterval(activeIntervals.current[fieldName]);
      delete activeIntervals.current[fieldName];
    }
    
    // 🎯 Check skipDataSelectorRef directly (not as parameter) to avoid race conditions
    const shouldSkipFocus = skipDataSelectorRef.current === true && lastFilledFieldRef.current === fieldName;
    
    // If skipFocus is true (from Insert button), insert instantly without streaming
    if (shouldSkipFocus) {
      console.log('⚡ Instant insert (no streaming, no focus):', fieldName, 'skipDataSelectorRef:', skipDataSelectorRef.current);
      ref.current?.insertText(text, true); // skipFocus = true
      return;
    }
    
    console.log('🌊 Streaming with animation:', fieldName);
    // Otherwise, stream with animation
    let currentIndex = 0;
    const intervalTime = 8; // milliseconds per character
    
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        currentIndex++;
        // Build the text progressively - insert substring from start to current position
        ref.current?.insertText(text.substring(0, currentIndex), false);
      } else {
        clearInterval(interval);
        delete activeIntervals.current[fieldName];
      }
    }, intervalTime);
    
    activeIntervals.current[fieldName] = interval;
  };

  // Watch field values changes and fill fields automatically with streaming effect
  useEffect(() => {
    if (!fieldValues || Object.keys(fieldValues).length === 0) return;
    
    // Fill text/textarea fields with streaming effect
    Object.entries(fieldValues).forEach(([fieldName, value]) => {
      // Skip if this value was already streamed
      if (lastStreamedValues.current[fieldName] === value) return;
      
      // 🔥 Try dynamic refs first (for all apps)
      const dynamicRef = dynamicFieldRefs.current[fieldName];
      
      if (dynamicRef) {
        // Check if it's a TagInput (has insertText method)
        if (dynamicRef.insertText && typeof dynamicRef.insertText === 'function') {
          console.log('✅ Streaming to TagInput:', fieldName, 'Value:', value);
          
          // 🎯 If skipDataSelectorRef is set for this field, insert instantly without streaming or focus
          if (skipDataSelectorRef.current && lastFilledFieldRef.current === fieldName) {
            console.log('⚡ INSTANT INSERT (bypassing streamText):', fieldName);
            dynamicRef.insertText(value, true); // skipFocus = true
            lastStreamedValues.current[fieldName] = value;
            
            // ✅ Reset flags immediately after insert
            skipDataSelectorRef.current = false;
            lastFilledFieldRef.current = null;
            console.log('🟢 skipDataSelectorRef reset immediately after insert');
            return;
          }
          
          streamText(value, { current: dynamicRef }, fieldName);
          lastStreamedValues.current[fieldName] = value;
          return;
        }
        // Check if it's a select element
        else if (dynamicRef.tagName === 'SELECT') {
          console.log('🔵 Setting select value:', fieldName, 'Value:', value);
          const cleanValue = String(value).replace(/['\"]/g, '').trim();
          setTimeout(() => {
            setDynamicSelectValues(prev => ({ ...prev, [fieldName]: cleanValue }));
            console.log('✅ Select value set to:', cleanValue);
          }, 100);
          lastStreamedValues.current[fieldName] = value;
          return;
        }
      }
      
      // Fallback to Gmail refs (backward compatibility)
      if (fieldName === 'to' && gmailToRef.current?.insertText) {
        // 🎯 If skipDataSelectorRef is set, insert instantly
        if (skipDataSelectorRef.current && lastFilledFieldRef.current === fieldName) {
          console.log('⚡ INSTANT INSERT to Gmail To:', fieldName);
          gmailToRef.current.insertText(value, true);
          lastStreamedValues.current[fieldName] = value;
          
          // ✅ Reset flags immediately
          skipDataSelectorRef.current = false;
          lastFilledFieldRef.current = null;
        } else {
          streamText(value, gmailToRef, fieldName);
          lastStreamedValues.current[fieldName] = value;
        }
      } else if (fieldName === 'subject' && gmailSubjectRef.current?.insertText) {
        // 🎯 If skipDataSelectorRef is set, insert instantly
        if (skipDataSelectorRef.current && lastFilledFieldRef.current === fieldName) {
          console.log('⚡ INSTANT INSERT to Gmail Subject:', fieldName);
          gmailSubjectRef.current.insertText(value, true);
          lastStreamedValues.current[fieldName] = value;
          
          // ✅ Reset flags immediately
          skipDataSelectorRef.current = false;
          lastFilledFieldRef.current = null;
        } else {
          streamText(value, gmailSubjectRef, fieldName);
          lastStreamedValues.current[fieldName] = value;
        }
      } else if (fieldName === 'body' && gmailBodyRef.current?.insertText) {
        // 🎯 If skipDataSelectorRef is set, insert instantly
        if (skipDataSelectorRef.current && lastFilledFieldRef.current === fieldName) {
          console.log('⚡ INSTANT INSERT to Gmail Body:', fieldName);
          gmailBodyRef.current.insertText(value, true);
          lastStreamedValues.current[fieldName] = value;
          
          // ✅ Reset flags immediately
          skipDataSelectorRef.current = false;
          lastFilledFieldRef.current = null;
        } else {
          streamText(value, gmailBodyRef, fieldName);
          lastStreamedValues.current[fieldName] = value;
        }
      } else if (fieldName === 'action' && value) {
        // For dropdown, set the value with a slight delay for smooth transition
        console.log('🔵 Dropdown - Field:', fieldName, 'Value received:', JSON.stringify(value));
        console.log('🔵 Valid options: send, read, draft');
        
        // Clean the value (remove quotes, trim spaces)
        const cleanValue = String(value).replace(/['"]/g, '').trim();
        console.log('🔵 Clean value:', JSON.stringify(cleanValue));
        
        setTimeout(() => {
          setGmailActionValue(cleanValue);
          console.log('✅ Dropdown value set to:', JSON.stringify(cleanValue));
        }, 100);
        lastStreamedValues.current[fieldName] = value;
      }
    });
    
    // Cleanup on unmount
    return () => {
      Object.values(activeIntervals.current).forEach(interval => {
        clearInterval(interval);
      });
      activeIntervals.current = {};
    };
  }, [fieldValues]);
  
  // State للتحكم في ارتفاع الـ panels
  const [topPanelHeight, setTopPanelHeight] = useState(60); // نسبة مئوية من الارتفاع الكلي
  const [isResizing, setIsResizing] = useState(false);
  const [isTestPanelOpen, setIsTestPanelOpen] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);
  const [testPanelTab, setTestPanelTab] = useState<'output' | 'input'>('output');
  const [jsonCopied, setJsonCopied] = useState(false);
  const resizerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close bottom sheet on click outside (clicking anywhere outside the bottom sheet closes it)
  useEffect(() => {
    if (!isTestPanelOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (isResizingRef.current) return;
      if (
        bottomSheetRef.current &&
        !bottomSheetRef.current.contains(e.target as Node)
      ) {
        setIsTestPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTestPanelOpen]);

  // Auto-expand sidebar when split/docked test panel is open,
  // and auto-collapse test panel when user resizes below threshold
  const isSplitViewRef = useRef(isSplitView);
  isSplitViewRef.current = isSplitView;

  useEffect(() => {
    if (isResizingRef.current) return;
    if (isSplitView) {
      // Save current width before expanding
      prevWidthBeforeSplitRef.current = sidebarWidth;
      // Expand: keep fields area at current size, add test section on top
      // Fields = 60% of newWidth = currentWidth → newWidth = currentWidth / 0.6
      const expandedWidth = Math.min(900, Math.max(SPLIT_VIEW_MIN_WIDTH, Math.round(sidebarWidth / 0.6)));
      setSidebarWidth(expandedWidth);
    } else {
      // Restore to previous width before split
      if (prevWidthBeforeSplitRef.current >= MIN_WIDTH) {
        setSidebarWidth(prevWidthBeforeSplitRef.current);
      }
    }
  }, [isSplitView]);

  // Handle Cmd+G keyboard shortcut for Test Step
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
        e.preventDefault();
        if (!selectedCardId || !isOpen) return;
        
        // Check for empty required fields first
        if (hasEmptyRequiredFields) {
          toast.error('Configure the step first', {
            position: 'bottom-right',
            duration: 2000,
          });
          return;
        }
        
        // If bottom sheet is open, just run test without closing
        if (isTestPanelOpen) {
          testSectionRef.current?.triggerTest();
          return;
        }
        
        // If split view is open, just run test without closing
        if (isSplitView) {
          testSectionRef.current?.triggerTest();
          return;
        }
        
        // Neither is open, so open bottom sheet and test
        // Close any open DataSelector before opening the bottom sheet
        if (showDataSelector) {
          setShowDataSelector(false);
          setIsDataSelectorMinimized(false);
          setIsDataSelectorExpanded(false);
          setActiveInputElement(null);
        }
        setIsTestPanelOpen(true);
        setTimeout(() => {
          testSectionRef.current?.triggerTest();
        }, 50);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCardId, isOpen, isTestPanelOpen, isSplitView, hasEmptyRequiredFields, showDataSelector]);

  // Reset isOpen when sidebar should reopen
  useEffect(() => {
    if (selectedCardId && !isOpen) {
      setIsOpen(true);
    }
  }, [selectedCardId, isOpen]);

  // Restore field values when switching to a step (saving is done in render phase above)
  useEffect(() => {
    prevSelectedCardId.current = selectedCardId;

    // Restore values for the new step after skeleton
    if (selectedCardId && savedStepFieldValues.current[selectedCardId]) {
      const saved = savedStepFieldValues.current[selectedCardId];
      setDynamicSelectValues(saved.selectValues);
      // Restore TagInput HTML after DOM renders (after skeleton)
      setTimeout(() => {
        Object.entries(saved.fieldHTML).forEach(([fieldName, html]) => {
          const ref = dynamicFieldRefs.current[fieldName];
          if (ref?.setHTML && html) {
            ref.setHTML(html);
          }
        });
        // Re-check required fields after restoring values (use ref for latest version)
        setTimeout(() => checkRequiredFieldsRef.current(), 50);
      }, 650); // slightly after skeleton (600ms)
    } else {
      setDynamicSelectValues({});
    }
  }, [selectedCardId]);

  // Show skeleton loading when switching steps
  useEffect(() => {
    if (selectedCardId) {
      setIsSkeletonLoading(true);
      const timer = setTimeout(() => setIsSkeletonLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [selectedCardId]);

  // Setup Popper instance
  useEffect(() => {
    if (showDataSelector && activeInputElement && dataSelectorRef.current) {
      const rect = activeInputElement.getBoundingClientRect();
      const top = isDataSelectorMinimized ? rect.top + rect.height / 2 : rect.top;
      const left = rect.left - 10;
      setDataSelectorPosition({ top, left });
    } else {
      setDataSelectorPosition(null);
    }
  }, [showDataSelector, activeInputElement, isDataSelectorMinimized]);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Don't close if clicking inside the popover or minimized icon
      if (dataSelectorRef.current?.contains(target)) {
        // If clicking on an input/textarea inside the popover (e.g. search bar), let it focus naturally
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        // Allow native drag initiation on draggable elements
        if (target.closest('[draggable="true"]')) {
          return;
        }
        // Keep focus on the input when clicking inside popover (non-input elements)
        if (activeInputElement) {
          e.preventDefault();
          setTimeout(() => {
            activeInputElement.focus();
          }, 0);
        }
        return;
      }
      
      // Don't close if clicking on the active input/textarea
      if (activeInputElement && (target === activeInputElement || activeInputElement.contains(target))) {
        return;
      }
      
      // Close if clicking anywhere else
      setShowDataSelector(false);
      setIsDataSelectorMinimized(false);
      if (activeInputElement) {
        activeInputElement.blur();
      }
      setActiveInputElement(null);
      
      // أخبر الـ parent أن الفوكس راح
      if (onInputFocusChange) {
        onInputFocusChange(null);
      }
    };

    if (showDataSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDataSelector, activeInputElement, onInputFocusChange]);

  // Add glow effect to active input when ExpandedDataSelector is open
  useEffect(() => {
    if (activeInputElement && isExpandedDataSelectorOpen) {
      // أضف glow effect
      activeInputElement.style.boxShadow = '0 0 0 3px hsla(257, 74%, 57%, 0.3), 0 0 20px hsla(257, 74%, 57%, 0.2)';
      activeInputElement.style.borderColor = 'hsl(257, 74%, 57%)';
      activeInputElement.style.borderRadius = '0.5rem';
      activeInputElement.style.transition = 'all 0.2s ease';
    } else if (activeInputElement) {
      // أزل الـ glow effect
      activeInputElement.style.boxShadow = '';
      activeInputElement.style.borderColor = '';
      activeInputElement.style.borderRadius = '';
    }
    
    // Cleanup عند تغيير الحقل
    return () => {
      if (activeInputElement) {
        activeInputElement.style.boxShadow = '';
        activeInputElement.style.borderColor = '';
        activeInputElement.style.borderRadius = '';
      }
    };
  }, [activeInputElement, isExpandedDataSelectorOpen]);

  // Handler لطلب اختبار من AI
  const handleRequestTest = () => {
    console.log('🧪 AI requested test - clicking test button');
    if (testButtonRef.current) {
      testButtonRef.current.click();
    }
  };

  // Handler لتفعيل الـ glow على زر Test
  const handleTriggerTestGlow = () => {
    console.log('✨ Triggering test button glow');
    setIsTestButtonGlowing(true);
    
    // إزالة الـ glow بعد 3 ثواني
    setTimeout(() => {
      setIsTestButtonGlowing(false);
    }, 3000);
  };

  // Watch for test button click signal from AIFillAssistant
  useEffect(() => {
    if (testButtonClickSignal && testSectionRef.current) {
      console.log('🔔 Test button click signal received - triggering test programmatically');
      testSectionRef.current.triggerTest();
      if (onTestButtonClickHandled) {
        onTestButtonClickHandled(); // Reset signal
      }
    }
  }, [testButtonClickSignal, onTestButtonClickHandled]);

  // Watch for test button glow signal from AIFillAssistant
  useEffect(() => {
    if (testButtonGlowSignal) {
      console.log('🔔 Test button glow signal received - activating glow');
      handleTriggerTestGlow();
      if (onTestButtonGlowHandled) {
        onTestButtonGlowHandled(); // Reset signal
      }
    }
  }, [testButtonGlowSignal, onTestButtonGlowHandled]);

  // Handler للـ resizing
  useEffect(() => {
    if (!isResizing) return;

    // من���� التحديد على كل الصفحة أثناء الـ resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const handleMouseMove = (e: MouseEvent) => {
      if (!sidebarRef.current) return;
      
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      const relativeX = e.clientX - sidebarRect.left;
      const percentage = (relativeX / sidebarRect.width) * 100;
      
      // تحديد الحد الأدنى والأقصى للنسبة
      const minWidth = 30; // 30% minimum
      const maxWidth = 70; // 70% maximum
      const clampedPercentage = Math.max(minWidth, Math.min(maxWidth, percentage));
      
      setTopPanelHeight(clampedPercentage);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      // إرجاع الـ style للوضع الطبي��ي
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // إرجاع الـ style للوضع الطبيعي في حالة unmount
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing]);

  // Find the selected step (before hooks that use it)
  const selectedStep = selectedCardId ? steps.find(s => s.id === selectedCardId) : null;
  const isTrigger = selectedCardId === 'trigger';

  // Virtual step object for trigger so the shared header can display it
  const displayStep = isTrigger
    ? { id: 'trigger', appId: 'trigger', name: 'Catch Webhook', icon: <Wrench size={16} />, color: 'bg-gray-500' }
    : selectedStep;

  // Fill fields when AI provides values
  useEffect(() => {
    if (!selectedStep || isTrigger) return;
    
    const appId = selectedStep.appId;
    const fields = APP_FIELD_DEFINITIONS[appId];
    if (!fields) return;
    
    // Apply field values dynamically for all apps
    fields.forEach(field => {
      const fieldValue = fieldValues[field.name];
      if (!fieldValue) return;
      
      const fieldRef = dynamicFieldRefs.current[field.name];
      if (!fieldRef) return;
      
      if (field.type === 'select') {
        // For select fields, directly set the value
        if (fieldRef instanceof HTMLSelectElement) {
          fieldRef.value = fieldValue;
          // Trigger change event
          const event = new Event('change', { bubbles: true });
          fieldRef.dispatchEvent(event);
        }
      } else {
        // For text/textarea fields with TagInput, use insertText
        if (fieldRef.insertText) {
          fieldRef.insertText(fieldValue);
        }
      }
    });
  }, [fieldValues, selectedStep, isTrigger]);

  // 🔄 Update fieldsToFill whenever selectedCardId changes
  useEffect(() => {
    const fields = getFieldsToFill();
    console.log('🔄 RightSidebar: selectedCardId changed to', selectedCardId, 'Fields:', fields);
    onFieldsToFillChange?.(fields);
  }, [selectedCardId, steps]); // Removed getFieldsToFill and onFieldsToFillChange to avoid infinite loops

  // Check if required fields are filled
  const checkRequiredFields = useCallback(() => {
    const appId = isTrigger ? 'trigger' : selectedStep?.appId || '';
    const fields = APP_FIELD_DEFINITIONS[appId] || [];
    const requiredFields = fields.filter(f => f.required);
    
    if (requiredFields.length === 0) {
      setHasEmptyRequiredFields(false);
      return;
    }
    
    const hasEmpty = requiredFields.some(field => {
      if (field.type === 'select') {
        return !dynamicSelectValues[field.name];
      }
      // For TagInput fields, check ref getValue()
      const fieldRef = dynamicFieldRefs.current[field.name];
      if (fieldRef?.getValue) {
        return !fieldRef.getValue().trim();
      }
      // If no ref yet but we're still in skeleton loading, don't mark as empty
      if (isSkeletonLoading) return false;
      return true; // If no ref yet after skeleton, consider empty
    });
    
    setHasEmptyRequiredFields(hasEmpty);
  }, [isTrigger, selectedStep?.appId, dynamicSelectValues, isSkeletonLoading]);

  // Keep a ref to the latest checkRequiredFields so timeouts always call the fresh version
  const checkRequiredFieldsRef = useRef(checkRequiredFields);
  checkRequiredFieldsRef.current = checkRequiredFields;

  // Run check on mount, on select changes, and set up input listeners via event delegation
  useEffect(() => {
    checkRequiredFields();
    
    // Use event delegation on the sidebar to catch all input events (capture phase)
    const scrollEl = sidebarRef.current;
    const handleInput = () => {
      // Small delay to let contentEditable update textContent
      setTimeout(() => checkRequiredFieldsRef.current(), 0);
    };
    
    if (scrollEl) {
      scrollEl.addEventListener('input', handleInput, true);
    }
    
    // Poll after mount, after skeleton clears (600ms), and after restore (700ms)
    const timers = [
      setTimeout(() => checkRequiredFieldsRef.current(), 150),
      setTimeout(() => checkRequiredFieldsRef.current(), 500),
      setTimeout(() => checkRequiredFieldsRef.current(), 650),
      setTimeout(() => checkRequiredFieldsRef.current(), 750),
      setTimeout(() => checkRequiredFieldsRef.current(), 1000),
    ];
    
    return () => {
      if (scrollEl) {
        scrollEl.removeEventListener('input', handleInput, true);
      }
      timers.forEach(clearTimeout);
    };
  }, [checkRequiredFields, selectedCardId]);

  // 🔄 Save field values during render phase (before refs get replaced by new step)
  // When selectedCardId changes, React re-renders but old DOM/refs are still mounted
  // This captures the previous step's values before they're lost
  if (prevRenderCardId.current && prevRenderCardId.current !== selectedCardId && isOpen) {
    const fieldHTML: Record<string, string> = {};
    Object.entries(dynamicFieldRefs.current).forEach(([fieldName, ref]) => {
      if (ref?.getHTML) {
        try {
          const html = ref.getHTML();
          if (html !== undefined && html !== null && html !== '') {
            fieldHTML[fieldName] = html;
          }
        } catch(e) { /* ref may be stale */ }
      }
    });
    if (Object.keys(fieldHTML).length > 0 || Object.keys(dynamicSelectValues).length > 0) {
      savedStepFieldValues.current[prevRenderCardId.current] = {
        selectValues: { ...dynamicSelectValues },
        fieldHTML,
      };
    }
  }
  prevRenderCardId.current = selectedCardId;

  // Early return after all hooks
  if (!isOpen || !selectedCardId) return null;

  // Helper to save current step's field values synchronously
  const saveCurrentFields = () => {
    if (!selectedCardId) return;
    const fieldHTML: Record<string, string> = {};
    Object.entries(dynamicFieldRefs.current).forEach(([fieldName, ref]) => {
      if (ref?.getHTML) {
        try {
          const html = ref.getHTML();
          if (html !== undefined && html !== null && html !== '') {
            fieldHTML[fieldName] = html;
          }
        } catch(e) { /* ref may be stale */ }
      }
    });
    if (Object.keys(fieldHTML).length > 0 || Object.keys(dynamicSelectValues).length > 0) {
      savedStepFieldValues.current[selectedCardId] = {
        selectValues: { ...dynamicSelectValues },
        fieldHTML,
      };
    }
  };

  // Handle focus for input fields
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.tagName === 'SELECT') return;
    
    setActiveInputElement(e.currentTarget);
    
    // دائماً أخبر الـ parent بتغيير الحقل النشط
    if (onInputFocusChange) {
      onInputFocusChange(e.currentTarget);
    }
    
    // إذا كان السايدبار الموسع مفتوح، لا تفتح اللكتور الصغير
    if (isExpandedDataSelectorOpen) {
      return;
    }
    
    // 🚫 إذا كان الـ focus جاي من Insert button (خلال 800ms)، لا تفتح Data Selector
    const timeSinceLastInsert = Date.now() - lastInsertTimestamp.current;
    if (timeSinceLastInsert < 800) {
      console.log('🚫 Blocked Data Selector - Recent Insert detected (', timeSinceLastInsert, 'ms ago)');
      return;
    }
    
    // Legacy check (backup)
    if (skipDataSelectorRef.current) {
      console.log('🚫 Blocked Data Selector - skipDataSelectorRef is true');
      return;
    }
    
    setShowDataSelector(true);
  };

  // Special handler for TagInput (wraps the container div)
  const handleTagInputFocus = (e: React.FocusEvent) => {
    const target = e.currentTarget as HTMLElement;
    setActiveInputElement(target);
    
    // دائماً أخبر الـ parent بتغيير الحقل النشط
    if (onInputFocusChange) {
      onInputFocusChange(target);
    }
    
    // إذا كان السايدبار الموسع مفتوح، لا تفتح السلكتور الصغير
    if (isExpandedDataSelectorOpen) {
      return;
    }
    
    // 🚫 إذا كان الـ focus جاي من Insert button (خلال 800ms)، لا تفتح Data Selector
    const timeSinceLastInsert = Date.now() - lastInsertTimestamp.current;
    if (timeSinceLastInsert < 800) {
      console.log('🚫 Blocked Data Selector in TagInput - Recent Insert (', timeSinceLastInsert, 'ms ago)');
      return;
    }
    
    // Legacy check (backup)
    if (skipDataSelectorRef.current) {
      console.log('🚫 Blocked Data Selector in TagInput - skipDataSelectorRef is true');
      return;
    }
    
    setShowDataSelector(true);
  };

  // Handler for TagInput blur
  const handleTagInputBlur = (e: React.FocusEvent) => {
    const target = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement | null;
    
    // Don't clear state if focus is moving to an element inside the data selector popover (e.g. search bar)
    if (relatedTarget && dataSelectorRef.current?.contains(relatedTarget)) {
      return;
    }
    
    if (target === activeInputElement) {
      setActiveInputElement(null);
      
      // Close data selector popover when the input loses focus
      setShowDataSelector(false);
      setIsDataSelectorMinimized(false);
      
      // أخبر الـ parent أن الفوكس راح
      if (onInputFocusChange) {
        onInputFocusChange(null);
      }
    }
  };

  // Get previous steps (all steps before the current one)
  const getPreviousSteps = () => {
    const allSteps = [
      {
        id: 'trigger',
        appId: 'trigger',
        name: 'Catch Webhook',
        icon: <Wrench size={16} />,
        color: 'bg-gray-500',
        fields: {
          id: '12345',
          name: 'John Doe',
          email: 'john@example.com',
          user: {
            id: 'user-001',
            name: 'John Doe',
            profile: {
              avatar: 'https://example.com/avatar.jpg',
              bio: 'Software Developer'
            }
          },
          metadata: {
            timestamp: '2024-01-05T10:30:00Z',
            source: 'web'
          }
        }
      },
      ...steps.map(step => {
        // Add mock fields based on app type
        let fields = {};
        
        switch (step.appId) {
          case 'gmail':
            fields = {
              to: 'recipient@example.com',
              subject: 'Hello World',
              body: 'Email content here',
              attachments: ['file1.pdf', 'file2.jpg'],
              messageId: 'msg-123456'
            };
            break;
          case 'slack':
            fields = {
              channel: '#general',
              message: 'Hello team!',
              timestamp: '2024-01-05T10:30:00Z',
              userId: 'U123456',
              teamId: 'T123456'
            };
            break;
          case 'gcal':
            fields = {
              eventId: 'evt-123456',
              title: 'Team Meeting',
              startDate: '2024-01-05',
              startTime: '10:00',
              duration: 60,
              attendees: ['john@example.com', 'jane@example.com']
            };
            break;
          case 'notion':
            fields = {
              pageId: 'page-123456',
              title: 'Project Documentation',
              content: 'Page content here...',
              database: 'Main Database',
              createdAt: '2024-01-05T10:30:00Z'
            };
            break;
          case 'stripe':
            fields = {
              paymentId: 'pi_123456',
              amount: 100.00,
              currency: 'usd',
              customerEmail: 'customer@example.com',
              status: 'succeeded'
            };
            break;
          case 'github':
            fields = {
              issueId: 'issue-123',
              repository: 'owner/repo',
              title: 'Bug: Something is broken',
              description: 'Issue description...',
              labels: ['bug', 'critical']
            };
            break;
          default:
            fields = {
              id: `${step.appId}-123`,
              status: 'completed',
              data: 'Sample data',
              timestamp: new Date().toISOString()
            };
        }
        
        return {
          ...step,
          fields
        };
      })
    ];

    // Find index of current step
    const currentIndex = allSteps.findIndex(s => s.id === selectedCardId);
    
    // Return all steps before current one
    return currentIndex > 0 ? allSteps.slice(0, currentIndex) : [];
  };

  // Get previous steps data for DataSelector
  const getPreviousStepsData = () => {
    const previousSteps = getPreviousSteps();
    return previousSteps.map(step => ({
      id: step.id,
      appId: step.appId,
      name: step.name,
      icon: step.icon,
      color: step.color,
      fields: step.fields
    }));
  };

  // 🎯 Get ALL steps data for AI (not just previous ones)
  const getAllStepsData = () => {
    // Build complete list with trigger + all steps
    const allSteps = [
      {
        id: 'trigger',
        appId: 'trigger',
        name: 'Catch Webhook',
        icon: <Wrench size={16} />,
        color: 'bg-gray-500',
        fields: {
          id: '12345',
          name: 'John Doe',
          email: 'john@example.com',
          user: {
            id: 'user-001',
            name: 'John Doe',
            profile: {
              avatar: 'https://example.com/avatar.jpg',
              bio: 'Software Developer'
            }
          },
          metadata: {
            timestamp: '2024-01-05T10:30:00Z',
            source: 'web'
          }
        }
      },
      ...steps.map(step => {
        // Add mock fields based on app type
        let fields = {};
        
        switch (step.appId) {
          case 'gmail':
            fields = {
              to: 'recipient@example.com',
              subject: 'Hello World',
              body: 'Email content here',
              attachments: ['file1.pdf', 'file2.jpg'],
              messageId: 'msg-123456'
            };
            break;
          case 'slack':
            fields = {
              channel: '#general',
              message: 'Hello team!',
              timestamp: '2024-01-05T10:30:00Z',
              userId: 'U123456',
              teamId: 'T123456'
            };
            break;
          case 'gcal':
            fields = {
              eventId: 'evt-123456',
              title: 'Team Meeting',
              startDate: '2024-01-05',
              startTime: '10:00',
              duration: 60,
              attendees: ['john@example.com', 'jane@example.com']
            };
            break;
          case 'notion':
            fields = {
              pageId: 'page-123456',
              title: 'Project Documentation',
              content: 'Page content here...',
              database: 'Main Database',
              createdAt: '2024-01-05T10:30:00Z'
            };
            break;
          case 'stripe':
            fields = {
              paymentId: 'pi_123456',
              amount: 100.00,
              currency: 'usd',
              customerEmail: 'customer@example.com',
              status: 'succeeded'
            };
            break;
          case 'github':
            fields = {
              issueId: 'issue-123',
              repository: 'owner/repo',
              title: 'Bug: Something is broken',
              description: 'Issue description...',
              labels: ['bug', 'critical']
            };
            break;
          default:
            fields = {
              id: `${step.appId}-123`,
              status: 'completed',
              data: 'Sample data',
              timestamp: new Date().toISOString()
            };
        }
        
        return {
          ...step,
          fields
        };
      })
    ];

    const result = allSteps.map(step => ({
      id: step.id,
      appId: step.appId,
      name: step.name,
      icon: step.icon,
      color: step.color,
      fields: step.fields
    }));

    console.log('📊 RightSidebar.getAllStepsData() - Returning all steps for AI:', result.length, 'steps');
    console.log('📊 Steps:', result.map((s, i) => `${i + 1}. ${s.name} (${s.id})`));

    return result;
  };

  // Render Trigger Configuration
  const renderTriggerConfig = () => (
    <>
      <div className={`flex-1 overflow-hidden h-full ${isSplitView ? 'flex' : ''}`}>
        {/* Fields Column */}
        <div className={`p-4 space-y-4 ${isSplitView ? 'flex-1 min-w-0 overflow-y-auto' : ''}`}>
        {/* Trigger Type Field */}
        <div>
          <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
            Trigger Type
            <span className="text-red-500">*</span>
            <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <HelpCircle size={14} />
            </button>
          </label>
          <select className={inputClasses}
            onFocus={handleInputFocus}
          >
            <option value="">Select trigger type</option>
            <option value="webhook">Webhook</option>
            <option value="schedule">Schedule</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        {/* Trigger Options */}
        <div className="space-y-3 mt-6">
          <p className="text-sm font-medium text-gray-900">Trigger Configuration</p>
          
          {/* Webhook URL Field - مع دعم Tags */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Webhook URL
              <span className="text-red-500">*</span>
              <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <HelpCircle size={14} />
              </button>
            </label>
            <TagInput
              placeholder="https://example.com/webhook"
              className={inputClasses}
              onFocus={(e) => handleTagInputFocus(e)}
              onBlur={handleTagInputBlur}
              type="text"
              availableSteps={getPreviousStepsData()}
            />
          </div>

          {/* Method Field */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Method
              <span className="text-red-500">*</span>
            </label>
            <select className={inputClasses}
              onFocus={handleInputFocus}
            >
              <option value="POST">POST</option>
              <option value="GET">GET</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          {/* Headers Field - مع دعم Tags */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Headers
            </label>
            <TagInput
              placeholder="Content-Type: application/json&#10;Authorization: Bearer token"
              className={textareaClasses}
              onFocus={(e) => handleTagInputFocus(e)}
              onBlur={handleTagInputBlur}
              multiline
              rows={3}
              availableSteps={getPreviousStepsData()}
            />
          </div>

          {/* Response Path Field - مع دعم Tags */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Response Path
            </label>
            <TagInput
              placeholder="data.result"
              className={inputClasses}
              onFocus={(e) => handleTagInputFocus(e)}
              onBlur={handleTagInputBlur}
              type="text"
              availableSteps={getPreviousStepsData()}
            />
          </div>

          {/* Description Field - مع دعم Tags */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Description
            </label>
            <TagInput
              placeholder="Describe this trigger..."
              className={textareaClasses}
              onFocus={(e) => handleTagInputFocus(e)}
              onBlur={handleTagInputBlur}
              multiline
              rows={2}
              availableSteps={getPreviousStepsData()}
            />
          </div>
        </div>
        </div>

        {/* Test Panel - Only in split view mode */}
        {isSplitView && (
          <div 
            className="border border-gray-200 border-b-0 bg-gray-50 flex flex-col rounded-md rounded-b-none overflow-hidden"
            style={{ 
              width: `${sidebarWidth * 0.5}px`,
              minWidth: '200px',
              margin: '0 10px 10px 0',
            }}
          >
            <TestSection
              ref={testSectionRef}
              stepId="trigger"
              mode="docked"
              testPanelTab={testPanelTab}
              onTestPanelTabChange={setTestPanelTab}
              testResults={testResults}
              onTestComplete={onTestComplete}
            />
          </div>
        )}
      </div>
    </>
  );

  // Render Gmail Configuration
  const renderGmailConfig = () => (
    <>
      <div className="flex-1 overflow-y-auto scrollbar-visible p-4 space-y-4">
        {/* App Info */}
        <div className="flex items-center gap-3 rounded-lg mb-4">
          <div className={`w-10 h-10 ${selectedStep?.color || 'bg-blue-500'} rounded-lg flex items-center justify-center shrink-0 text-white`}>
            {selectedStep?.icon || '🌐'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">{selectedStep?.name}</p>
            <p className="text-xs text-gray-500">Configure this step</p>
          </div>
          <span className="text-xs text-gray-400">v1.0.0</span>
        </div>

        {/* Fields below */}

        {/* Fields Container */}
        <div className="space-y-4">
          {/* To Field - مع دعم Tags */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              To
              <span className="text-red-500">*</span>
            </label>
            <TagInput
              ref={gmailToRef}
              placeholder="recipient@example.com"
              className={inputClasses}
              onFocus={(e) => handleTagInputFocus(e)}
              onBlur={handleTagInputBlur}
              type="email"
              availableSteps={getPreviousStepsData()}
            />
          </div>

          {/* Subject Field - مع دعم Tags */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Subject
              <span className="text-red-500">*</span>
            </label>
            <TagInput
              ref={gmailSubjectRef}
              placeholder="Email subject"
              className={inputClasses}
              onFocus={(e) => {
                const element = e.currentTarget;
                element.setAttribute('data-field-name', 'Subject');
                element.setAttribute('data-step-name', selectedStep?.name || '');
                element.setAttribute('data-app-name', 'Gmail');
                handleTagInputFocus(e);
              }}
              onBlur={handleTagInputBlur}
              type="text"
              availableSteps={getPreviousStepsData()}
            />
          </div>

          {/* Message Body Field - مع دعم Tags */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Message Body
              <span className="text-red-500">*</span>
            </label>
            <TagInput
              ref={gmailBodyRef}
              placeholder="Email content..."
              className={textareaClasses}
              onFocus={(e) => handleTagInputFocus(e)}
              onBlur={handleTagInputBlur}
              multiline
              rows={6}
              availableSteps={getPreviousStepsData()}
            />
          </div>

          {/* Action Field */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Action
              <span className="text-red-500">*</span>
            </label>
            <select 
              ref={gmailActionRef}
              value={gmailActionValue}
              onChange={(e) => setGmailActionValue(e.target.value)}
              className={inputClasses}
              onFocus={handleInputFocus}
            >
              <option value="">Select an action</option>
              <option value="send">Send Email</option>
              <option value="read">Read Email</option>
              <option value="draft">Create Draft</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );

  // Render Slack Configuration
  const renderSlackConfig = () => (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* App Info */}
        <div className="flex items-center gap-3 rounded-lg mb-4">
          <div className={`w-10 h-10 ${selectedStep?.color || 'bg-blue-500'} rounded-lg flex items-center justify-center shrink-0 text-white`}>
            {selectedStep?.icon || '🌐'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">{selectedStep?.name}</p>
            <p className="text-xs text-gray-500">Configure this step</p>
          </div>
          <span className="text-xs text-gray-400">v1.0.0</span>
        </div>

        {/* Fields Container */}
        <div className="space-y-4">
          {/* Message Field - مع دعم Tags */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Message
              <span className="text-red-500">*</span>
            </label>
            <TagInput
              placeholder="Type your message..."
              className={textareaClasses}
              onFocus={(e) => handleTagInputFocus(e)}
              onBlur={handleTagInputBlur}
              multiline
              rows={5}
              availableSteps={getPreviousStepsData()}
            />
          </div>

          {/* Action Field */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Action
              <span className="text-red-500">*</span>
            </label>
            <select className={inputClasses}
              onFocus={handleInputFocus}
            >
              <option value="">Select an action</option>
              <option value="send-message">Send Message</option>
              <option value="create-channel">Create Channel</option>
              <option value="invite-user">Invite User</option>
            </select>
          </div>

          {/* Channel Field */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Channel
              <span className="text-red-500">*</span>
            </label>
            <select className={inputClasses}
              onFocus={handleInputFocus}
            >
              <option value="">Select a channel</option>
              <option value="general">general</option>
              <option value="random">random</option>
              <option value="announcements">announcements</option>
            </select>
          </div>

          {/* Attachments Field */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Attachments
            </label>
            <div className="border border-gray-300 rounded-lg p-3">
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
                <Plus size={16} />
                Add attachment
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Render Google Calendar Configuration
  const renderGoogleCalendarConfig = () => (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* App Info */}
        <div className="flex items-center gap-3 rounded-lg mb-4">
          <div className={`w-10 h-10 ${selectedStep?.color || 'bg-blue-500'} rounded-lg flex items-center justify-center shrink-0 text-white`}>
            {selectedStep?.icon || '🌐'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">{selectedStep?.name}</p>
            <p className="text-xs text-gray-500">Configure this step</p>
          </div>
          <span className="text-xs text-gray-400">v1.0.0</span>
        </div>

        {/* Fields Container */}
        <div className="space-y-4">
          {/* Action Field */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Action
              <span className="text-red-500">*</span>
            </label>
            <select className={inputClasses}
              onFocus={handleInputFocus}
            >
              <option value="">Select an action</option>
              <option value="create">Create Event</option>
              <option value="update">Update Event</option>
              <option value="delete">Delete Event</option>
            </select>
          </div>

          {/* Event Title Field - مع دعم Tags */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Event Title
              <span className="text-red-500">*</span>
            </label>
            <TagInput
              placeholder="Meeting with team"
              className={inputClasses}
              onFocus={(e) => handleTagInputFocus(e)}
              onBlur={handleTagInputBlur}
              type="text"
              availableSteps={getPreviousStepsData()}
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
                Start Date
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={inputClasses}
                onFocus={handleInputFocus}
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
                Start Time
                <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                className={inputClasses}
                onFocus={handleInputFocus}
              />
            </div>
          </div>

          {/* Duration Field */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Duration (minutes)
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="60"
              className={inputClasses}
              onFocus={handleInputFocus}
            />
          </div>

          {/* Description Field - مع دعم Tags */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Description
            </label>
            <TagInput
              placeholder="Event details..."
              className={textareaClasses}
              onFocus={(e) => handleTagInputFocus(e)}
              onBlur={handleTagInputBlur}
              multiline
              rows={4}
              availableSteps={getPreviousStepsData()}
            />
          </div>

          {/* Attendees Field */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Attendees
            </label>
            <div className="border border-gray-300 rounded-lg p-3">
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
                <Plus size={16} />
                Add attendee
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Render Notion Configuration
  const renderNotionConfig = () => (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* App Info */}
        <div className="flex items-center gap-3 rounded-lg mb-4">
          <div className={`w-10 h-10 ${selectedStep?.color || 'bg-blue-500'} rounded-lg flex items-center justify-center shrink-0 text-white`}>
            {selectedStep?.icon || '🌐'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">{selectedStep?.name}</p>
            <p className="text-xs text-gray-500">Configure this step</p>
          </div>
          <span className="text-xs text-gray-400">v1.0.0</span>
        </div>

        {/* Fields Container */}
        <div className="space-y-4">
          {/* Page Title - مع دعم Tags */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Page Title
              <span className="text-red-500">*</span>
            </label>
            <TagInput
              placeholder="New page title"
              className={inputClasses}
              onFocus={(e) => handleTagInputFocus(e)}
              onBlur={handleTagInputBlur}
              type="text"
              availableSteps={getPreviousStepsData()}
            />
          </div>
          {/* Content - مع دعم Tags */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Content
            </label>
            <TagInput
              placeholder="Page content..."
              className={textareaClasses}
              onFocus={(e) => handleTagInputFocus(e)}
              onBlur={handleTagInputBlur}
              multiline
              rows={6}
              availableSteps={getPreviousStepsData()}
            />
          </div>
          
          {/* Action Field */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Action
              <span className="text-red-500">*</span>
            </label>
            <select className={inputClasses}
              onFocus={handleInputFocus}
            >
              <option value="">Select an action</option>
              <option value="create-page">Create Page</option>
              <option value="update-page">Update Page</option>
              <option value="create-database">Create Database</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );

  // Render Stripe Configuration
  const renderStripeConfig = () => (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* App Info */}
        <div className="flex items-center gap-3 rounded-lg mb-4">
          <div className={`w-10 h-10 ${selectedStep?.color || 'bg-blue-500'} rounded-lg flex items-center justify-center shrink-0 text-white`}>
            {selectedStep?.icon || '🌐'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">{selectedStep?.name}</p>
            <p className="text-xs text-gray-500">Configure this step</p>
          </div>
          <span className="text-xs text-gray-400">v1.0.0</span>
        </div>

        {/* Fields Container */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Action
              <span className="text-red-500">*</span>
            </label>
            <select className={inputClasses}
              onFocus={handleInputFocus}
            >
              <option value="">Select an action</option>
              <option value="create-payment">Create Payment</option>
              <option value="create-customer">Create Customer</option>
              <option value="create-refund">Create Refund</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Amount
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="100.00"
              className={inputClasses}
              onFocus={handleInputFocus}
            />
          </div>
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Currency
              <span className="text-red-500">*</span>
            </label>
            <select className={inputClasses}
              onFocus={handleInputFocus}
            >
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="aed">AED</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Customer Email
            </label>
            <input
              type="email"
              placeholder="customer@example.com"
              className={inputClasses}
              onFocus={handleInputFocus}
            />
          </div>
        </div>
      </div>
    </>
  );

  // Render GitHub Configuration
  const renderGitHubConfig = () => (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* App Info */}
        <div className="flex items-center gap-3 rounded-lg mb-4">
          <div className={`w-10 h-10 ${selectedStep?.color || 'bg-blue-500'} rounded-lg flex items-center justify-center shrink-0 text-white`}>
            {selectedStep?.icon || '��'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">{selectedStep?.name}</p>
            <p className="text-xs text-gray-500">Configure this step</p>
          </div>
          <span className="text-xs text-gray-400">v1.0.0</span>
        </div>

        {/* Fields Container */}
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Action
              <span className="text-red-500">*</span>
            </label>
            <select className={inputClasses}
              onFocus={handleInputFocus}
            >
              <option value="">Select an action</option>
              <option value="create-issue">Create Issue</option>
              <option value="create-pr">Create Pull Request</option>
              <option value="merge-pr">Merge Pull Request</option>
            </select>
          </div>
          {/* Repository - مع دعم Tags */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Repository
              <span className="text-red-500">*</span>
            </label>
            <TagInput
              placeholder="owner/repo"
              className={inputClasses}
              onFocus={(e) => handleTagInputFocus(e)}
              onBlur={handleTagInputBlur}
              type="text"
              availableSteps={getPreviousStepsData()}
            />
          </div>
          {/* Issue Title - مع دعم Tags */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Issue Title
              <span className="text-red-500">*</span>
            </label>
            <TagInput
              placeholder="Bug: Something is broken"
              className={inputClasses}
              onFocus={(e) => handleTagInputFocus(e)}
              onBlur={handleTagInputBlur}
              type="text"
              availableSteps={getPreviousStepsData()}
            />
          </div>
          {/* Description - مع دعم Tags */}
          <div>
            <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
              Description
            </label>
            <TagInput
              placeholder="Describe the issue..."
              className={textareaClasses}
              onFocus={(e) => handleTagInputFocus(e)}
              onBlur={handleTagInputBlur}
              multiline
              rows={5}
              availableSteps={getPreviousStepsData()}
            />
          </div>
        </div>
      </div>
    </>
  );

  // 🎯 Render Generic App Configuration - FULLY DYNAMIC!
  const renderGenericConfig = () => {
    const appId = selectedStep?.appId || '';
    const fields = APP_FIELD_DEFINITIONS[appId] || [];
    
    return (
      <>
        <div className={`flex-1 overflow-hidden h-full ${isSplitView ? 'flex' : ''}`}>
          {/* Fields Column */}
          <div className={`p-4 space-y-4 ${isSplitView ? 'flex-1 min-w-0 overflow-y-auto' : ''}`}>
          {/* App Info */}


          {/* Dynamic Fields Container - Renders all fields from definition */}
          <div className="space-y-4">
            {fields.map((field, index) => {
              // Divider / Section separator
              if (field.type === 'divider') {
                return (
                  <div key={field.name} className="pt-2">
                    <div className="border-t border-gray-200"></div>
                    {field.sectionTitle && (
                      <p className="text-xs text-gray-400 uppercase tracking-wide mt-3 mb-1">{field.sectionTitle}</p>
                    )}
                  </div>
                );
              }

              // Checkbox field
              if (field.type === 'checkbox') {
                return (
                  <div key={field.name} className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id={`field-${field.name}`}
                      defaultChecked={field.defaultChecked}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[hsl(257,74%,50%)] focus:ring-[hsl(257,74%,50%)] cursor-pointer accent-[hsl(257,74%,50%)]"
                    />
                    <div className="flex flex-col">
                      <label htmlFor={`field-${field.name}`} className="text-[12px] font-medium text-gray-700 cursor-pointer select-none">{field.label}</label>
                      {field.description && <span className="text-xs text-gray-400 mt-0.5">{field.description}</span>}
                    </div>
                  </div>
                );
              }

              // Switch (toggle) field
              if (field.type === 'switch') {
                return (
                  <div key={field.name} className="flex items-start gap-3">
                    <SwitchToggle id={`field-${field.name}`} defaultChecked={field.defaultChecked} />
                    <div className="flex flex-col flex-1 min-w-0">
                      <label htmlFor={`field-${field.name}`} className="text-[12px] font-medium text-gray-700 cursor-pointer select-none">{field.label}</label>
                      {field.description && <span className="text-xs text-gray-400 mt-0.5">{field.description}</span>}
                    </div>
                  </div>
                );
              }

              // Code box field
              if (field.type === 'code') {
                return (
                  <div key={field.name}>
                    <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      placeholder={field.placeholder}
                      rows={field.rows || 4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none bg-gray-50 [font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace] [font-size:12px] [line-height:1.5] text-gray-800"
                      spellCheck={false}
                    />
                  </div>
                );
              }

              return (
              <div className="group/field mx-[0px] mt-[0px] mb-[17px]" key={field.name}>
                <label className="flex items-center gap-1 text-gray-700 mb-[2px] text-[12px] font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.type === 'select' ? (
                  <select 
                    ref={(el) => { 
                      if (el) {
                        dynamicFieldRefs.current[field.name] = el;
                        console.log('🔗 Ref registered for select:', field.name);
                      }
                    }}
                    value={dynamicSelectValues[field.name] || ''}
                    onChange={(e) => setDynamicSelectValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                    className={inputClasses}
                    onFocus={handleInputFocus}
                  >
                    <option value="">Select {field.label.toLowerCase()}</option>
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <TagInput
                    ref={(el: any) => { 
                      if (el) {
                        dynamicFieldRefs.current[field.name] = el;
                        console.log('🔗 Ref registered for textarea:', field.name);
                      }
                    }}
                    placeholder={field.placeholder}
                    className={textareaClasses}
                    onFocus={(e) => {
                      const element = e.currentTarget;
                      element.setAttribute('data-field-name', field.label);
                      element.setAttribute('data-step-name', selectedStep?.name || '');
                      element.setAttribute('data-app-name', selectedStep?.name || '');
                      handleTagInputFocus(e);
                    }}
                    onBlur={(e: any) => { handleTagInputBlur(e); checkRequiredFields(); }}
                    multiline
                    rows={field.rows || 4}
                    availableSteps={getPreviousStepsData()}
                  />
                ) : (
                  <TagInput
                    ref={(el: any) => { 
                      if (el) {
                        dynamicFieldRefs.current[field.name] = el;
                        console.log('🔗 Ref registered for text:', field.name);
                      }
                    }}
                    placeholder={field.placeholder}
                    className={inputClasses}
                    onFocus={(e) => {
                      const element = e.currentTarget;
                      element.setAttribute('data-field-name', field.label);
                      element.setAttribute('data-step-name', selectedStep?.name || '');
                      element.setAttribute('data-app-name', selectedStep?.name || '');
                      handleTagInputFocus(e);
                    }}
                    onBlur={(e: any) => { handleTagInputBlur(e); checkRequiredFields(); }}
                    type="text"
                    availableSteps={getPreviousStepsData()}
                  />
                )}
              </div>
              );
            })}

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>
          </div>
        </div>

          {/* Sticky Test Panel - appears to the right of fields when split view is active */}
          {isSplitView && (
            <div className="w-[50%] min-w-[200px] shrink-0 sticky top-0 self-start h-full overflow-hidden border border-gray-200 mr-[10px] mb-[10px] rounded-lg">
              {!testResults[selectedCardId || ''] ? (
                // Empty state - no test run yet
                <div className="h-full flex flex-col items-center justify-center gap-4 px-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-sm">Configure the step to test</span>
                  </div>
                  <button
                    onClick={() => {
                      if (hasEmptyRequiredFields) return;
                      const currentTestResult = testResults[selectedCardId || ''];
                      if (currentTestResult?.status === 'testing') return;
                      testSectionRef.current?.triggerTest();
                    }}
                    disabled={testResults[selectedCardId || '']?.status === 'testing' || hasEmptyRequiredFields}
                    onMouseEnter={(e) => {
                      const isDisabled = hasEmptyRequiredFields || testResults[selectedCardId || '']?.status === 'testing';
                      if (isDisabled) {
                        const el = e.currentTarget.parentElement?.querySelector('[data-split-tooltip]') as HTMLElement;
                        if (el) el.style.opacity = '1';
                      }
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget.parentElement?.querySelector('[data-split-tooltip]') as HTMLElement;
                      if (el) el.style.opacity = '0';
                    }}
                    className={`px-2 py-1 rounded transition-colors flex items-center gap-1.5 text-[13px] ${
                      hasEmptyRequiredFields || testResults[selectedCardId || '']?.status === 'testing'
                        ? 'text-purple-300 opacity-50 cursor-not-allowed'
                        : 'text-[hsl(257,74%,50%)] hover:bg-[hsl(257,74%,95%)] cursor-pointer'
                    }`}
                  >
                    {testResults[selectedCardId || '']?.status === 'testing' ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-purple-400" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <Play size={14} fill="currentColor" />
                        <span>Test Step</span>
                        <span className="text-[12px] opacity-60 ml-0.5">⌘G</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
              <div className="h-full flex flex-col">
              {/* Status Header */}
              <div className={`flex items-center justify-between px-2 py-1 shrink-0 border-b border-gray-200 ${
                testResults[selectedCardId || '']?.status === 'success' ? 'bg-[#f0fdf4]' :
                testResults[selectedCardId || '']?.status === 'failed' ? 'bg-red-50' :
                testResults[selectedCardId || '']?.status === 'testing' ? 'bg-[hsl(257,74%,97%)]' :
                'bg-gray-50'
              }`}>
                <div className="flex items-center gap-1.5">
                  {testResults[selectedCardId || '']?.status === 'success' ? (
                    <>
                      <CheckCircle2 size={13} className="text-[#08943C] shrink-0" />
                      <span className="text-[12px] text-[#08943C] font-medium">Tested</span>
                    </>
                  ) : testResults[selectedCardId || '']?.status === 'failed' ? (
                    <>
                      <XCircle size={13} className="text-[oklch(0.45_0.213_27.518)] shrink-0" />
                      <span className="text-[12px] text-[oklch(0.45_0.213_27.518)] font-normal">Test Failed</span>
                    </>
                  ) : testResults[selectedCardId || '']?.status === 'testing' ? (
                    <>
                      <Loader2 size={13} className="text-[hsl(257,74%,50%)] animate-spin shrink-0" />
                      <span className="text-[12px] text-[hsl(257,74%,50%)] font-medium">Testing...</span>
                    </>
                  ) : (
                    <>
                      <Play size={13} className="text-gray-400 shrink-0" fill="currentColor" />
                      <span className="text-[12px] text-gray-500 font-medium">Not tested</span>
                    </>
                  )}
                </div>
                {testResults[selectedCardId || '']?.date && (
                  <span className="text-[12px] text-gray-500">{testResults[selectedCardId || ''].date}</span>
                )}
              </div>
              {/* Test Panel Header */}
              <div className="relative z-10 shrink-0">
              <div className="flex items-center justify-between px-1.5 pt-1.5 pb-0.5 bg-white">
                <div className="flex items-center gap-1">
                  {testResults[selectedCardId || '']?.status !== 'testing' && (
                    <Tabs value={testPanelTab} onValueChange={(v) => setTestPanelTab(v as 'output' | 'input')}>
                      <TabsList className="h-6 rounded-md">
                        <TabsTrigger value="output" className="text-[12px] h-5 px-2 rounded-md cursor-pointer">Output</TabsTrigger>
                        <TabsTrigger value="input" className="text-[12px] h-5 px-2 rounded-md cursor-pointer">Input</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => {
                      setIsSplitView(false);
                      setIsTestPanelOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-2 h-6 rounded transition-colors text-black hover:bg-gray-100 cursor-pointer text-[12px] font-medium"
                    title="Collapse"
                  >
                    <PanelBottomClose size={13} />
                    <span>Collapse</span>
                  </button>
                </div>
              </div>
              <div className="h-3 bg-gradient-to-b from-white to-transparent pointer-events-none -mb-3 relative z-[5]" />
              </div>
                <div className="flex-1 min-h-0 overflow-y-auto pl-[12px] pr-0 pb-0 pt-0 m-[0px] relative group/code [&>*]:pr-[40px]">
                {/* Floating Copy & Download buttons */}
                {testResults[selectedCardId || '']?.status !== 'testing' && (
                  <div className="absolute top-2 right-3 flex items-center gap-0.5 z-20 bg-white rounded-md p-[2px] shadow-sm opacity-0 group-hover/code:opacity-100 transition-opacity duration-200 !pr-[2px]">
                    <button
                      onClick={() => {
                        const data = testPanelTab === 'input' ? JSON.stringify({cc:"",bcc:"",auth:{type:"OAuth2"},body:"Hello",receiver:"test@example.com"}, null, 2) : JSON.stringify({status:200,data:{id:"msg123"}}, null, 2);
                        const textarea = document.createElement('textarea');
                        textarea.value = data;
                        textarea.style.position = 'fixed';
                        textarea.style.opacity = '0';
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                        setJsonCopied(true);
                        setTimeout(() => setJsonCopied(false), 2000);
                      }}
                      className="inline-flex items-center justify-center w-5 h-5 rounded transition-colors hover:bg-gray-100 cursor-pointer"
                      title="Copy JSON"
                    >
                      {jsonCopied ? <Check size={13} className="text-black" /> : <Copy size={13} className="text-black" />}
                    </button>
                    <button
                      onClick={() => {
                        toast.success('JSON downloaded successfully', { position: 'bottom-right', duration: 2000 });
                      }}
                      className="inline-flex items-center justify-center w-5 h-5 rounded transition-colors hover:bg-gray-100 cursor-pointer"
                      title="Download JSON"
                    >
                      <Download size={13} className="text-black" />
                    </button>
                  </div>
                )}
                  {testResults[selectedCardId || '']?.status === 'testing' ? (
                    <div className="h-full flex flex-col gap-2 p-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </div>
                  ) : (
                    <>
                      <div className={testPanelTab === 'output' ? 'h-full overflow-auto' : 'hidden'}>
                        <TreeJsonViewer data={{
                          config: {
                            url: "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
                            method: "POST",
                            userAgentDirectives: [
                              { product: "google-api-nodejs-client", version: "7.2.0", comment: "gzip" }
                            ],
                            data: {
                              raw: "RnJvbTogeWF6ZWVka2FtYWw2NjZAZ21haWwuY29tDQpUbzogeWF6ZWVka2FtYWw2NjZAZ21haWwuY29tDQpTdWJqZWN0OiA9P1VURi04P0I_VG1WM0lIVnpaWElnYjI0Z2RHaGxJSGRoYVhSc2FYTjA_PQ0KTWVzc2FnZS1JRDogPGNmMzAzZjdmLTQ5ZTEtMGNkMC0zZjZiLWU4ODgxY2EwMjk4YUBnbWFpbC5jb20-DQpDb250ZW50LVRyYW5zZmVyLUVuY29kaW5nOiA3Yml0DQpEYXRlOiBXZWQsIDE4IE1hciAyMDI2IDAzOjMwOjU0ICswMDAwDQpNSU1FLVZlcnNpb246IDEuMA0KQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PXV0Zi04DQoNCk5ldyB1c2VyICgpDQo="
                            },
                            headers: {
                              "x-goog-api-client": "gdcl/7.2.0 gl-node/24.14.0",
                              "Accept-Encoding": "gzip",
                              "User-Agent": "google-api-nodejs-client/7.2.0 (gzip)",
                              "Authorization": "Bearer YOUR_GOOGLE_ACCESS_TOKEN",
                              "Content-Type": "application/json"
                            },
                            params: {},
                            retry: true,
                            body: "{\"raw\":\"RnJvbTogeWF6ZWVka2FtYWw2NjZAZ21haWwuY29tDQpUbzogeWF6ZWVka2FtYWw2NjZAZ21haWwuY29tDQpTdWJqZWN0OiA9P1VURi04P0I_VG1WM0lIVnpaWElnYjI0Z2RHaGxJSGRoYVhSc2FYTjA_PQ0KTWVzc2FnZS1JRDogPGNmMzAzZjdmLTQ5ZTEtMGNkMC0zZjZiLWU4ODgxY2EwMjk4YUBnbWFpbC5jb20-DQpDb250ZW50LVRyYW5zZmVyLUVuY29kaW5nOiA3Yml0DQpEYXRlOiBXZWQsIDE4IE1hciAyMDI2IDAzOjMwOjU0ICswMDAwDQpNSU1FLVZlcnNpb246IDEuMA0KQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PXV0Zi04DQoNCk5ldyB1c2VyICgpDQo=\"}",
                            responseType: "unknown"
                          },
                          data: {
                            id: "19cfeff10b46366a",
                            threadId: "19cfeff10b46366a",
                            labelIds: ["UNREAD", "SENT", "INBOX"]
                          },
                          headers: {
                            "alt-svc": "h3=\":443\"; ma=2592000,h3-29=\":443\"; ma=2592000",
                            "content-encoding": "gzip",
                            "content-type": "application/json; charset=UTF-8",
                            "date": "Wed, 18 Mar 2026 03:30:54 GMT",
                            "server": "ESF",
                            "transfer-encoding": "chunked",
                            "vary": "Origin, X-Origin, Referer",
                            "x-content-type-options": "nosniff",
                            "x-frame-options": "SAMEORIGIN",
                            "x-xss-protection": "0"
                          },
                          status: 200,
                          statusText: "OK",
                          request: {
                            responseURL: "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
                          }
                        }} />
                      </div>
                      {testPanelTab === 'input' && (
                        <div className="h-full overflow-auto">
                          <TreeJsonViewer data={{
                            cc: [],
                            bcc: [],
                            auth: "**REDACTED**",
                            body: "New user ()",
                            from: "",
                            draft: false,
                            subject: "New user on the waitlist",
                            receiver: ["yazeedkamal666@gmail.com"],
                            reply_to: [],
                            body_type: "plain_text",
                            attachments: [],
                            in_reply_to: "",
                            sender_name: ""
                          }} />
                        </div>
                      )}
                    </>
                  )}
                </div>

              {/* Test Step / Cancel Button at bottom of split view */}
              <div className="shrink-0 bg-white px-3 pt-1 pb-3 relative">
                <div className="pointer-events-none absolute inset-x-0 bottom-full h-8 bg-gradient-to-t from-white to-transparent" />
                <div className="relative group">
                  {testResults[selectedCardId || '']?.status === 'testing' ? (
                    <button
                      onClick={() => testSectionRef.current?.cancelTest()}
                      className="w-full px-2 py-1 rounded-md flex items-center justify-center gap-1 shadow-sm transition-colors bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 cursor-pointer text-[14px]"
                    >
                      Cancel Testing
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          if (hasEmptyRequiredFields) return;
                          testSectionRef.current?.triggerTest();
                        }}
                        disabled={hasEmptyRequiredFields}
                        className={`w-full px-2 py-1 rounded-md flex items-center justify-center gap-1 shadow-sm transition-colors ${ hasEmptyRequiredFields ? 'bg-[hsl(257,74%,93%)] text-[hsl(257,74%,50%)] border border-[hsl(257,74%,80%)] opacity-50 cursor-not-allowed' : 'bg-[hsl(257,74%,88%)] text-[hsl(257,74%,45%)] border border-[hsl(257,74%,75%)] hover:bg-[hsl(257,74%,83%)] cursor-pointer' } text-[14px]`}
                      >
                        <Play size={12} fill="currentColor" />
                        Test Step
                        <span className="ml-0.5 opacity-60 text-[12px]">⌘ + G</span>
                      </button>
                      {hasEmptyRequiredFields && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2.5 bg-[#1a1a2e] text-white text-[13px] rounded-xl whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
                          Configure the step first
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              </div>
              )}
            </div>
          )}

        </div>
      </>
    );
  };

  // 🎯 Determine which configuration to render - NOW FULLY DYNAMIC!
  const renderConfigContent = () => {
    if (isTrigger) {
      return renderTriggerConfig();
    }

    if (!selectedStep) return null;

    // ✅ Use generic dynamic config for ALL apps (except trigger)
    // This ensures every app gets AI Fill, Test Step, and all features!
    return renderGenericConfig();
    
    // Old specific renders kept for reference (can be removed later):
    // case 'gmail': return renderGmailConfig();
    // case 'slack': return renderSlackConfig();
    // case 'gcal': return renderGoogleCalendarConfig();
    // case 'notion': return renderNotionConfig();
    // case 'stripe': return renderStripeConfig();
    // case 'github': return renderGitHubConfig();
  };

  return (
    <>
    <aside 
      ref={sidebarRef}
      className="bg-white border-l border-gray-200 flex flex-col h-full shrink-0 relative"
      style={{ width: sidebarWidth }}
      onMouseDown={(e) => {
        // إذا ك��ن السايدبار الموسع مفتوح
        if (isExpandedDataSelectorOpen) {
          const target = e.target as HTMLElement;
          
          // إذا كان الضغط على نفس الحقل النشط، خليه مفتوح
          if (activeInputElement && (target === activeInputElement || activeInputElement.contains(target))) {
            return;
          }
          
          // أخر الـ parent بسكر السايد��ار الموسع
          if (onInputFocusChange) {
            onInputFocusChange(null);
          }
        }
      }}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={handleResizeMouseDown}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-[9999] flex items-center justify-center"
      >
        <div className="absolute left-0 -translate-x-1/2 z-[9999] flex h-5 w-4 items-center justify-center rounded-sm bg-gray-200">
          <GripVertical className="size-3 text-gray-800" />
        </div>
      </div>

      {/* Header - Sticky (shared across both panels) */}
      <div className="sticky top-0 bg-white z-20 p-4 pb-3 relative overflow-visible shrink-0">
          <div className="flex items-center justify-between gap-[20px]">
            <div
              className="flex items-center gap-2.5 min-w-0 relative w-full"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHeaderTooltip({ visible: true, x: rect.left, y: rect.bottom + 6 });
              }}
              onMouseLeave={() => setHeaderTooltip({ visible: false, x: 0, y: 0 })}
            >
              <div className={`w-7 h-7 ${displayStep?.color || 'bg-blue-500'} rounded flex items-center justify-center shrink-0 text-white text-sm`}>
                {displayStep?.icon || '🌐'}
              </div>
              <div className="min-w-0 flex flex-col">
                {isEditingName ? (
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={() => {
                      if (editedName.trim() && selectedStep) {
                        onStepNameChange?.(selectedStep.id, editedName.trim());
                      }
                      setIsEditingName(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editedName.trim() && selectedStep) {
                          onStepNameChange?.(selectedStep.id, editedName.trim());
                        }
                        setIsEditingName(false);
                      } else if (e.key === 'Escape') {
                        setIsEditingName(false);
                      }
                    }}
                    className="text-sm w-full border border-gray-300 rounded-lg px-2 py-1 bg-gray-100 focus:outline-none focus:ring-0 focus:border-gray-400 selection:bg-blue-200 selection:text-black h-7"
                  />
                ) : (
                  <h2 className="text-sm flex items-center min-w-0 h-5">
                    <span className="truncate mr-[2px] text-[16px] font-semibold">{isTrigger ? '1' : steps.findIndex(s => s.id === selectedStep?.id) + 2}. {displayStep?.name || 'Step Configuration'}</span>
                    <button
                      onClick={() => {
                        setEditedName(displayStep?.name || '');
                        setIsEditingName(true);
                        setTimeout(() => { nameInputRef.current?.focus(); nameInputRef.current?.select(); }, 0);
                      }}
                      className="p-0.5 rounded transition-colors text-gray-900 hover:bg-gray-100 shrink-0 cursor-pointer"
                    >
                      <Pencil size={14} />
                    </button>
                  </h2>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {isSplitView && <div ref={testButtonHeaderPortalRef} />}
              <button
                onClick={() => {
                  if (isTrigger) return;
                  saveCurrentFields();
                  const currentIndex = steps.findIndex(s => s.id === selectedCardId);
                  if (currentIndex === 0 && onStepSelect) {
                    onStepSelect('trigger');
                  } else if (currentIndex > 0 && onStepSelect) {
                    onStepSelect(steps[currentIndex - 1].id);
                  }
                }}
                disabled={isTrigger}
                className="p-1 rounded transition-colors text-gray-900 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer group relative"
              >
                <ChevronLeft size={16} />
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-1 text-xs text-white bg-black rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100]">
                  Previous step
                </span>
              </button>
              <button
                onClick={() => {
                  saveCurrentFields();
                  if (isTrigger && steps.length > 0 && onStepSelect) {
                    onStepSelect(steps[0].id);
                  } else {
                    const currentIndex = steps.findIndex(s => s.id === selectedCardId);
                    if (currentIndex < steps.length - 1 && onStepSelect) {
                      onStepSelect(steps[currentIndex + 1].id);
                    }
                  }
                }}
                disabled={!isTrigger && steps.findIndex(s => s.id === selectedCardId) >= steps.length - 1}
                className="p-1 rounded transition-colors text-gray-900 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer group relative"
              >
                <ChevronRight size={16} />
                <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-1 text-xs text-white bg-black rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100]">
                  Next step
                </span>
              </button>
              <button
                onClick={() => {
                  saveCurrentFields();
                  setIsOpen(false);
                  onClose();
                }}
                className="p-1 rounded transition-colors text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className={`absolute left-0 bottom-0 translate-y-full h-4 bg-gradient-to-b from-white to-transparent pointer-events-none ${isSplitView ? 'right-[calc(50%+10px)]' : 'right-0'}`} />
        </div>

      {/* Content Area - side by side in split view */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Config Panel */}
        <div 
          className="flex flex-col overflow-hidden flex-1"
        >

        {/* Render appropriate configuration */}
        {isSkeletonLoading ? (
          <div className="flex-1 overflow-hidden p-4 space-y-5 animate-pulse">
            {/* Skeleton field 1 */}
            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-gray-200 rounded" />
              <div className="h-9 w-full bg-gray-200 rounded-lg" />
            </div>
            {/* Skeleton field 2 */}
            <div className="space-y-2">
              <div className="h-3.5 w-32 bg-gray-200 rounded" />
              <div className="h-9 w-full bg-gray-200 rounded-lg" />
            </div>
            {/* Skeleton field 3 */}
            <div className="space-y-2">
              <div className="h-3.5 w-20 bg-gray-200 rounded" />
              <div className="h-9 w-full bg-gray-200 rounded-lg" />
            </div>
            {/* Skeleton field 4 - textarea */}
            <div className="space-y-2">
              <div className="h-3.5 w-28 bg-gray-200 rounded" />
              <div className="h-24 w-full bg-gray-200 rounded-lg" />
            </div>
            {/* Skeleton divider */}
            <div className="h-px w-full bg-gray-200 my-4" />
            {/* Skeleton field 5 */}
            <div className="space-y-2">
              <div className="h-3.5 w-36 bg-gray-200 rounded" />
              <div className="h-9 w-full bg-gray-200 rounded-lg" />
            </div>
          </div>
        ) : renderConfigContent()}

        {/* Floating Test Step Button - fades out when bottom sheet or split view opens */}
          <div className={`sticky bottom-0 shrink-0 bg-white px-[12px] pt-[2px] pb-[12px] transition-all duration-300 ${isSplitView ? 'hidden' : (isTestPanelOpen ? 'opacity-0 pointer-events-none h-0 p-0 overflow-hidden' : 'opacity-100')}`}>
            <div className="pointer-events-none absolute inset-x-0 bottom-full h-8 bg-gradient-to-t from-white to-transparent" />
            <div ref={testButtonWrapperRef} className="relative">
              <div
                onMouseEnter={() => hasEmptyRequiredFields && !(testResults[selectedCardId || ''] && (testResults[selectedCardId || ''].status === 'success' || testResults[selectedCardId || ''].status === 'failed')) && setTestButtonTooltip(true)}
                onMouseLeave={() => setTestButtonTooltip(false)}
              >
                <button
                  onClick={() => {
                    const currentTestResult = testResults[selectedCardId || ''];
                    const hasPreviousResult = currentTestResult && (currentTestResult.status === 'success' || currentTestResult.status === 'failed');
                    if (!hasPreviousResult && hasEmptyRequiredFields) return;
                    if (hasPreviousResult) {
                      setIsTestPanelOpen(true);
                    } else {
                      setIsTestPanelOpen(true);
                      setTimeout(() => {
                        testSectionRef.current?.triggerTest();
                      }, 50);
                    }
                  }}
                  disabled={hasEmptyRequiredFields && !(testResults[selectedCardId || ''] && (testResults[selectedCardId || ''].status === 'success' || testResults[selectedCardId || ''].status === 'failed'))}
                  className={`w-full px-2 py-1 rounded-md flex items-center justify-center gap-1 shadow-sm transition-colors ${ (hasEmptyRequiredFields && !(testResults[selectedCardId || ''] && (testResults[selectedCardId || ''].status === 'success' || testResults[selectedCardId || ''].status === 'failed'))) ? 'bg-[hsl(257,74%,93%)] text-[hsl(257,74%,50%)] border border-[hsl(257,74%,80%)] opacity-50 cursor-not-allowed' : 'bg-[hsl(257,74%,88%)] text-[hsl(257,74%,45%)] border border-[hsl(257,74%,75%)] hover:bg-[hsl(257,74%,83%)] cursor-pointer' } text-[14px]`}
                >
                  {testResults[selectedCardId || ''] && (testResults[selectedCardId || ''].status === 'success' || testResults[selectedCardId || ''].status === 'failed') ? (
                    'Show Sample Data'
                  ) : (
                    <>
                      <Play size={12} fill="currentColor" />
                      Test Step
                      <span className="ml-0.5 opacity-60 text-[12px]">⌘ + G</span>
                    </>
                  )}
                </button>
              </div>
              {testButtonTooltip && hasEmptyRequiredFields && testButtonWrapperRef.current && createPortal(
                <div
                  className="flex flex-col items-center pointer-events-none"
                  style={{
                    position: 'fixed',
                    zIndex: 99999,
                    left: testButtonWrapperRef.current.getBoundingClientRect().left + testButtonWrapperRef.current.getBoundingClientRect().width / 2,
                    top: testButtonWrapperRef.current.getBoundingClientRect().top - 8,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <div className="px-4 py-2.5 bg-[#1a1a2e] text-white text-[13px] rounded-xl whitespace-nowrap shadow-xl">
                    Configure the step first
                  </div>
                </div>,
                document.body
              )}
            </div>
          </div>

          {/* Portal: Test Step button in split view header - removed, moved to bottom */}

          {/* Hidden TestSection - provides the triggerTest method via ref */}
          <div className="hidden">
            <TestSection
              ref={testSectionRef}
              stepId={selectedCardId || ''}
              testResult={testResults[selectedCardId || '']}
              onTestComplete={(stepId, result) => {
                if (onTestComplete) {
                  onTestComplete(stepId, result);
                }
              }}
              hasEmptyRequiredFields={hasEmptyRequiredFields}
            />
          </div>

      </div>

      {/* Old docked split view removed - test panel now inline with config fields */}
      </div>

      {/* Bottom Sheet - Overlay from bottom */}
      <div 
        ref={bottomSheetRef} 
        className={`absolute bottom-0 left-0 right-0 flex flex-col transition-[height] duration-[450ms] ease-[cubic-bezier(0.25,1,0.5,1)] z-30 ${!isTestPanelOpen ? 'pointer-events-none' : ''}`}
        style={{ height: isTestPanelOpen ? '80%' : '0%' }}
      >
          {/* Bottom Panel */}
          <div 
            className={`flex flex-col flex-1 overflow-hidden rounded-t-2xl shadow-[0_-2px_12px_rgba(0,0,0,0.08)] bg-white border-t border-gray-300 relative z-10 transition-[transform,opacity] duration-[450ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${isTestPanelOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
          >

          {/* Status Header */}
          <div className={`flex items-center justify-between px-2 py-1 shrink-0 rounded-t-2xl border-b border-gray-200 ${
            testResults[selectedCardId || '']?.status === 'success' ? 'bg-[#f0fdf4]' :
            testResults[selectedCardId || '']?.status === 'failed' ? 'bg-red-50' :
            testResults[selectedCardId || '']?.status === 'testing' ? 'bg-[hsl(257,74%,97%)]' :
            'bg-gray-50'
          }`}>
            <div className="flex items-center gap-1.5">
              {testResults[selectedCardId || '']?.status === 'success' ? (
                <>
                  <CheckCircle2 size={13} className="text-[#08943C] shrink-0" />
                  <span className="text-[12px] text-[#08943C] font-medium">Tested</span>
                </>
              ) : testResults[selectedCardId || '']?.status === 'failed' ? (
                <>
                  <XCircle size={13} className="text-[oklch(0.45_0.213_27.518)] shrink-0" />
                  <span className="text-[12px] text-[oklch(0.45_0.213_27.518)] font-normal">Test Failed</span>
                </>
              ) : testResults[selectedCardId || '']?.status === 'testing' ? (
                <>
                  <Loader2 size={13} className="text-[hsl(257,74%,50%)] animate-spin shrink-0" />
                  <span className="text-[12px] text-[hsl(257,74%,50%)] font-medium">Testing...</span>
                </>
              ) : (
                <>
                  <Play size={13} className="text-gray-400 shrink-0" fill="currentColor" />
                  <span className="text-[12px] text-gray-500 font-medium">Not tested</span>
                </>
              )}
            </div>
            {testResults[selectedCardId || '']?.date && (
              <span className="text-[12px] text-gray-500">{testResults[selectedCardId || ''].date}</span>
            )}
          </div>
          {/* Header with tabs */}
          <div className="relative z-10 shrink-0">
          <div className="flex items-center justify-between px-1.5 pt-1.5 pb-0.5 bg-white">
            <div className="flex items-center gap-1">
              <Tabs value={testPanelTab} onValueChange={(v: string) => setTestPanelTab(v as 'input' | 'output')}>
                <TabsList className="h-6 rounded-md">
                  <TabsTrigger value="output" className="text-[12px] h-5 px-2 rounded-md cursor-pointer">Output</TabsTrigger>
                  <TabsTrigger value="input" className="text-[12px] h-5 px-2 rounded-md cursor-pointer">Input</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center gap-0.5">
              {testResults[selectedCardId || '']?.status !== 'testing' && (
                <button
                  onClick={() => {
                    setIsSplitView(true);
                    setIsTestPanelOpen(false);
                  }}
                  className="inline-flex items-center gap-1 px-2 h-6 rounded transition-colors text-black hover:bg-gray-100 cursor-pointer text-[12px] font-medium"
                  title="Open split view"
                >
                  <Columns2 size={13} />
                  <span>Split View</span>
                </button>
              )}
            </div>
          </div>
          <div className="h-3 bg-gradient-to-b from-white to-transparent pointer-events-none -mb-3 relative z-[5]" />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto pl-3 pr-0 pb-0 pt-0 relative group/code [&>*]:pr-[40px]">
            {/* Floating Copy & Download buttons */}
            {testResults[selectedCardId || '']?.status !== 'testing' && (
              <div className="absolute top-2 right-3 flex items-center gap-0.5 z-20 bg-white rounded-md p-[2px] shadow-sm opacity-0 group-hover/code:opacity-100 transition-opacity duration-200 !pr-[2px]">
                <button
                  onClick={() => {
                    const data = testPanelTab === 'input' ? JSON.stringify({cc:"",bcc:"",auth:{type:"OAuth2"},body:"Hello",receiver:"test@example.com"}, null, 2) : JSON.stringify({status:200,data:{id:"msg123"}}, null, 2);
                    const textarea = document.createElement('textarea');
                    textarea.value = data;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    setJsonCopied(true);
                    setTimeout(() => setJsonCopied(false), 2000);
                  }}
                  className="inline-flex items-center justify-center w-6 h-6 rounded transition-colors text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer group relative"
                  title="Copy JSON"
                >
                  {jsonCopied ? <Check size={13} className="text-black" /> : <Copy size={13} className="text-black" />}
                  <span className="absolute top-full right-0 mt-1.5 px-2 py-1 text-xs text-white bg-black rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 delay-150 z-[200]">
                    Copy JSON
                  </span>
                </button>
                <button
                  onClick={() => {
                    toast.success('JSON downloaded successfully', {
                      position: 'bottom-right',
                      duration: 2000,
                    });
                  }}
                  className="inline-flex items-center justify-center w-6 h-6 rounded transition-colors text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer group relative"
                  title="Download JSON"
                >
                  <Download size={13} className="text-black" />
                  <span className="absolute top-full right-0 mt-1.5 px-2 py-1 text-xs text-white bg-black rounded whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 delay-150 z-[200]">
                    Download JSON
                  </span>
                </button>
              </div>
            )}
            {testResults[selectedCardId || '']?.status === 'testing' ? (
              <div className="h-full flex flex-col gap-2 p-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <>
                <div className={testPanelTab === 'output' ? 'h-full overflow-auto' : 'hidden'}>
              <TreeJsonViewer data={{
                config: {
                  url: "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
                  method: "POST",
                  userAgentDirectives: [
                    { product: "google-api-nodejs-client", version: "7.2.0", comment: "gzip" }
                  ],
                  data: {
                    raw: "RnJvbTogeWF6ZWVka2FtYWw2NjZAZ21haWwuY29tDQpUbzogeWF6ZWVka2FtYWw2NjZAZ21haWwuY29tDQpTdWJqZWN0OiA9P1VURi04P0I_VG1WM0lIVnpaWElnYjI0Z2RHaGxJSGRoYVhSc2FYTjA_PQ0KTWVzc2FnZS1JRDogPGNmMzAzZjdmLTQ5ZTEtMGNkMC0zZjZiLWU4ODgxY2EwMjk4YUBnbWFpbC5jb20-DQpDb250ZW50LVRyYW5zZmVyLUVuY29kaW5nOiA3Yml0DQpEYXRlOiBXZWQsIDE4IE1hciAyMDI2IDAzOjMwOjU0ICswMDAwDQpNSU1FLVZlcnNpb246IDEuMA0KQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PXV0Zi04DQoNCk5ldyB1c2VyICgpDQo="
                  },
                  headers: {
                    "x-goog-api-client": "gdcl/7.2.0 gl-node/24.14.0",
                    "Accept-Encoding": "gzip",
                    "User-Agent": "google-api-nodejs-client/7.2.0 (gzip)",
                    "Authorization": "Bearer YOUR_GOOGLE_ACCESS_TOKEN",
                    "Content-Type": "application/json"
                  },
                  params: {},
                  retry: true,
                  body: "{\"raw\":\"RnJvbTogeWF6ZWVka2FtYWw2NjZAZ21haWwuY29tDQpUbzogeWF6ZWVka2FtYWw2NjZAZ21haWwuY29tDQpTdWJqZWN0OiA9P1VURi04P0I_VG1WM0lIVnpaWElnYjI0Z2RHaGxJSGRoYVhSc2FYTjA_PQ0KTWVzc2FnZS1JRDogPGNmMzAzZjdmLTQ5ZTEtMGNkMC0zZjZiLWU4ODgxY2EwMjk4YUBnbWFpbC5jb20-DQpDb250ZW50LVRyYW5zZmVyLUVuY29kaW5nOiA3Yml0DQpEYXRlOiBXZWQsIDE4IE1hciAyMDI2IDAzOjMwOjU0ICswMDAwDQpNSU1FLVZlcnNpb246IDEuMA0KQ29udGVudC1UeXBlOiB0ZXh0L3BsYWluOyBjaGFyc2V0PXV0Zi04DQoNCk5ldyB1c2VyICgpDQo=\"}",
                  responseType: "unknown"
                },
                data: {
                  id: "19cfeff10b46366a",
                  threadId: "19cfeff10b46366a",
                  labelIds: ["UNREAD", "SENT", "INBOX"]
                },
                headers: {
                  "alt-svc": "h3=\":443\"; ma=2592000,h3-29=\":443\"; ma=2592000",
                  "content-encoding": "gzip",
                  "content-type": "application/json; charset=UTF-8",
                  "date": "Wed, 18 Mar 2026 03:30:54 GMT",
                  "server": "ESF",
                  "transfer-encoding": "chunked",
                  "vary": "Origin, X-Origin, Referer",
                  "x-content-type-options": "nosniff",
                  "x-frame-options": "SAMEORIGIN",
                  "x-xss-protection": "0"
                },
                status: 200,
                statusText: "OK",
                request: {
                  responseURL: "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
                }
              }} />
            </div>
            {testPanelTab === 'input' && (
              <div className="h-full overflow-auto">
                <TreeJsonViewer data={{
                  cc: [],
                  bcc: [],
                  auth: "**REDACTED**",
                  body: "New user ()",
                  from: "",
                  draft: false,
                  subject: "New user on the waitlist",
                  receiver: ["yazeedkamal666@gmail.com"],
                  reply_to: [],
                  body_type: "plain_text",
                  attachments: [],
                  in_reply_to: "",
                  sender_name: ""
                }} />
              </div>
            )}
          </>
        )}
          </div>

          {/* Test Step / Cancel Button at bottom of bottom sheet */}
          <div className="shrink-0 bg-white px-3 pt-1 pb-3 relative">
            <div className="pointer-events-none absolute inset-x-0 bottom-full h-8 bg-gradient-to-t from-white to-transparent" />
            <div className="relative group">
              {testResults[selectedCardId || '']?.status === 'testing' ? (
                <button
                  onClick={() => testSectionRef.current?.cancelTest()}
                  className="w-full px-2 py-1 rounded-md flex items-center justify-center gap-1 shadow-sm transition-colors bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 cursor-pointer text-[14px]"
                >
                  Cancel Testing
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      if (hasEmptyRequiredFields) return;
                      testSectionRef.current?.triggerTest();
                    }}
                    disabled={hasEmptyRequiredFields}
                    className={`w-full px-2 py-1 rounded-md flex items-center justify-center gap-1 shadow-sm transition-colors ${ hasEmptyRequiredFields ? 'bg-[hsl(257,74%,93%)] text-[hsl(257,74%,50%)] border border-[hsl(257,74%,80%)] opacity-50 cursor-not-allowed' : 'bg-[hsl(257,74%,88%)] text-[hsl(257,74%,45%)] border border-[hsl(257,74%,75%)] hover:bg-[hsl(257,74%,83%)] cursor-pointer' } text-[14px]`}
                  >
                    <Play size={12} fill="currentColor" />
                    Test Step
                    <span className="ml-0.5 opacity-60 text-[12px]">⌘ + G</span>
                  </button>
                  {hasEmptyRequiredFields && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2.5 bg-[#1a1a2e] text-white text-[13px] rounded-xl whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200">
                      Configure the step first
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          </div>
      </div>

      {/* Data Selector Popover */}
      {false && showDataSelector && !isDataSelectorMinimized && !isDataSelectorExpanded && dataSelectorPosition && (
        <div
          ref={dataSelectorRef}
          className="z-[10000]"
          style={{ position: 'fixed', top: dataSelectorPosition.top, left: dataSelectorPosition.left }}
          onMouseDown={(e) => {
            const target = e.target as HTMLElement;
            // Allow focus on inputs/textareas inside the popover (e.g. search bar)
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
            // Allow native drag initiation on draggable elements
            if (target.closest('[draggable="true"]')) return;
            e.preventDefault();
          }}
        >
          <DataSelector
            availableSteps={getPreviousStepsData()}
            hideDataTab={isTrigger}
            onMinimize={() => setIsDataSelectorMinimized(true)}
            onExpand={() => {
              setShowDataSelector(false);
              setIsDataSelectorMinimized(false);
              if (onDataSelectorExpand) {
                onDataSelectorExpand();
              }
            }}
            onClose={() => {
              setShowDataSelector(false);
              setIsDataSelectorMinimized(false);
              if (activeInputElement) {
                activeInputElement.blur();
              }
              setActiveInputElement(null);
            }}
            onDataSelect={(data) => {
              // إدراج الـ tag في الحقل النشط
              if (activeInputElement) {
                const tagInputInstance = (activeInputElement as any).__tagInputInstance;
                if (tagInputInstance && tagInputInstance.insertTag) {
                  // Determine type
                  const type = data.type || 'step';
                  
                  if (type === 'function' || type === 'operator' || type === 'keyword' || type === 'variable') {
                    // Check if this is a function pair (displayValue ends with "()")
                    const displayVal = String(data.fieldValue);
                    if (type === 'function' && displayVal.endsWith('()') && tagInputInstance.insertTagPair) {
                      const funcName = displayVal.slice(0, -1); // e.g. "length("
                      const cleanFuncName = funcName.replace(/\($/, ''); // e.g. "length"
                      const sepCount = FUNCTION_SEPARATORS[cleanFuncName] || 0;
                      tagInputInstance.insertTagPair(
                        { type: 'function', id: data.stepId, value: funcName, displayValue: funcName },
                        { type: 'function', id: data.stepId, value: ')', displayValue: ')' },
                        sepCount,
                      );
                    } else {
                      tagInputInstance.insertTag({
                        type: type,
                        id: data.stepId,
                        value: data.field,
                        displayValue: data.fieldValue
                      });
                    }
                  } else {
                    // Find step info for icon/color
                    const stepInfo = steps.find(s => s.id === data.stepId);
                    
                    // Compute step number from previous steps order
                    const previousSteps = getPreviousStepsData();
                    const stepIdx = previousSteps.findIndex(s => s.id === data.stepId);
                    const stepNumber = stepIdx >= 0 ? stepIdx + 1 : undefined;
                    
                    // For trigger step, icon is React element; pass its appId icon instead
                    const triggerIcon = data.stepId === 'trigger' ? '⚙' : stepInfo?.icon;
                    
                    tagInputInstance.insertTag({
                      type: 'step',
                      id: data.stepId,
                      appId: data.stepId === 'trigger' ? 'trigger' : (stepInfo as any)?.appId || data.stepId,
                      stepName: data.stepName,
                      stepIcon: triggerIcon,
                      stepColor: stepInfo?.color || (data.stepId === 'trigger' ? 'bg-gray-500' : 'bg-gray-500'),
                      stepNumber,
                      path: data.field,
                      displayValue: data.fieldValue
                    });
                  }
                }
              }
            }}
          />
        </div>
      )}

      {/* Minimized Data Selector Icon */}
      {false && showDataSelector && isDataSelectorMinimized && dataSelectorPosition && (
        <div
          ref={dataSelectorRef}
          className="z-[10000] relative group"
          style={{ position: 'fixed', top: dataSelectorPosition.top, left: dataSelectorPosition.left }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <button
            onClick={() => setIsDataSelectorMinimized(false)}
            onMouseDown={(e) => e.preventDefault()}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80 cursor-pointer"
            style={{ backgroundColor: 'hsl(257, 74%, 57%)' }}
          >
            <Database size={16} className="text-white" />
          </button>
          
          {/* Tooltip */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Data Selector
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}

    </aside>
    {headerTooltip.visible && (
      <div
        className="fixed z-[99999] pointer-events-none"
        style={{ top: headerTooltip.y, left: headerTooltip.x }}
      >
        <div className="bg-black text-white text-xs px-2.5 py-1.5 rounded-md shadow-lg max-w-[260px] whitespace-normal">
          <div className="font-semibold">{displayStep?.originalName || displayStep?.name || 'Step Configuration'} <span className="font-normal opacity-70">(v1.0.0)</span></div>
          <div className="mt-0.5 opacity-90">{APP_DESCRIPTIONS[displayStep?.appId || ''] || ''}</div>
        </div>
      </div>
    )}
  </>
  );
}