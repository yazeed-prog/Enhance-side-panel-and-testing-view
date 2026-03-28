import { LeftSidebar } from './LeftSidebar';
import { TopHeader } from './TopHeader';
import { FlowCanvas } from './FlowCanvas';
import { RightSidebar } from './RightSidebar';
import { ExpandedDataSelector } from './ExpandedDataSelector';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Wrench, Database } from 'lucide-react';
import { APP_FIELD_DEFINITIONS } from './app-field-definitions';
import { SidebarProvider } from './ui/sidebar';
import { Toaster } from './ui/sonner';

interface Step {
  id: string;
  appId: string;
  name: string;
  originalName: string;
  icon: React.ReactNode;
  color: string;
}

export function AutomationLayout() {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isDataSelectorExpanded, setIsDataSelectorExpanded] = useState(false);
  const [isExpandedDataSelectorMinimized, setIsExpandedDataSelectorMinimized] = useState(false);
  const [activeInputElement, setActiveInputElement] = useState<HTMLElement | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [fieldsToFill, setFieldsToFill] = useState<Array<{ name: string; label: string; type: 'text' | 'textarea' | 'select'; placeholder?: string }>>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [currentFillingField, setCurrentFillingField] = useState<string | null>(null);
  
  const [testButtonClicked, setTestButtonClicked] = useState(false);
  const [testButtonGlow, setTestButtonGlow] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, { status: 'idle' | 'testing' | 'success' | 'failed'; output: any; date: string | null }>>({});
  const minimizedIconRef = useRef<HTMLDivElement>(null);
  const [minimizedIconPosition, setMinimizedIconPosition] = useState<{ top: number; left: number } | null>(null);
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 'step-1',
      appId: 'airtable',
      name: 'Create Record',
      originalName: 'Create Record',
      icon: <Database size={20} />,
      color: 'bg-yellow-500'
    }
  ]);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0, top: 0, left: 0 });
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 });
  const isSidebarOpen = selectedCardId !== null;

  // Update fieldsToFill when selectedCardId changes
  useEffect(() => {
    if (selectedCardId) {
      const selectedStep = steps.find(s => s.id === selectedCardId);
      if (selectedStep?.appId) {
        const fieldDefinitions = APP_FIELD_DEFINITIONS[selectedStep.appId];
        if (fieldDefinitions) {
          setFieldsToFill(fieldDefinitions);
        } else {
          setFieldsToFill([]);
        }
      }
    } else {
      setFieldsToFill([]);
    }
  }, [selectedCardId, steps]);

  // Setup Popper for minimized icon positioning
  useEffect(() => {
    if (isExpandedDataSelectorMinimized && activeInputElement && minimizedIconRef.current) {
      const rect = activeInputElement.getBoundingClientRect();
      setMinimizedIconPosition({ top: rect.top + rect.height / 2, left: rect.left - 20 });
    }

    return () => {
      setMinimizedIconPosition(null);
    };
  }, [isExpandedDataSelectorMinimized, activeInputElement]);

  const handleCardSelect = (cardId: string | null) => {
    setSelectedCardId(cardId);
  };

  const handleRightSidebarClose = () => {
    setSelectedCardId(null);
    setIsExpandedDataSelectorMinimized(false);
    setIsDataSelectorExpanded(false);
  };

  const handleTestComplete = (stepId: string, result: { status: 'idle' | 'testing' | 'success' | 'failed'; output: any; date: string | null }) => {
    setTestResults(prev => ({
      ...prev,
      [stepId]: result
    }));
  };

  const handleInputFocusChange = (element: HTMLElement | null) => {
    if (!element) {
      setIsDataSelectorExpanded(false);
      setIsExpandedDataSelectorMinimized(false);
    }
    
    if (activeInputElement !== element && element !== null) {
      setIsDataSelectorExpanded(false);
      setIsExpandedDataSelectorMinimized(false);
    }
    
    setActiveInputElement(element);
  };

  const getAllSteps = () => {
    const allSteps = [
      {
        id: 'trigger',
        appId: 'trigger',
        name: 'Catch Webhook',
        originalName: 'Catch Webhook',
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
        let fields = {};
        
        switch (step.appId) {
          case 'airtable':
            fields = {
              baseId: 'app1234567890',
              tableId: 'tbl1234567890',
              fields: {
                Name: 'John Doe',
                Email: 'john@example.com'
              },
              recordId: 'rec1234567890'
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

    return allSteps;
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="h-screen w-full flex bg-gray-50 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />
        
        {/* Main Area (Header + Content) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <TopHeader canvasPan={canvasPan} />
          
          {/* Main Content Area */}
          <div className="flex flex-1 overflow-hidden relative">
            {/* Center Canvas */}
            <FlowCanvas 
              selectedCardId={selectedCardId}
              onCardSelect={handleCardSelect}
              steps={steps}
              onStepsChange={setSteps}
              isSidebarOpen={isSidebarOpen}
              onCanvasDimensionsChange={setCanvasDimensions}
              onPanChange={setCanvasPan}
              testResults={testResults}
            />
            
            {/* Expanded Data Selector - Overlay */}
            {isDataSelectorExpanded && (
              <div className="absolute inset-0 right-80 z-30">
                <ExpandedDataSelector 
                  onClose={() => setIsDataSelectorExpanded(false)}
                  onMinimize={() => {
                    setIsDataSelectorExpanded(false);
                    setIsExpandedDataSelectorMinimized(true);
                  }}
                  onShrink={() => {
                    setIsDataSelectorExpanded(false);
                  }}
                  availableSteps={getAllSteps()}
                  activeInputElement={activeInputElement}
                  currentFieldName={activeInputElement?.getAttribute('data-field-name') || ''}
                  currentStepName={activeInputElement?.getAttribute('data-step-name') || ''}
                  currentAppName={activeInputElement?.getAttribute('data-app-name') || ''}
                  initialPrompt={initialPrompt}
                  onPromptUsed={() => setInitialPrompt('')}
                />
              </div>
            )}
            
            {/* Minimized Expanded Data Selector Icon */}
            {isExpandedDataSelectorMinimized && activeInputElement && minimizedIconPosition && (
              <div 
                ref={minimizedIconRef}
                className="z-[10000] relative group"
                style={{ position: 'fixed', top: minimizedIconPosition.top, left: minimizedIconPosition.left }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <button
                  onClick={() => {
                    setIsExpandedDataSelectorMinimized(false);
                    setIsDataSelectorExpanded(true);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
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
            
            {/* Right Sidebar - always mounted to preserve field persistence */}
            <RightSidebar 
              selectedCardId={selectedCardId} 
              steps={steps}
              onClose={handleRightSidebarClose}
              onStepSelect={(stepId) => setSelectedCardId(stepId)}
              onDataSelectorExpand={(prompt?: string) => {
                if (prompt) {
                  setInitialPrompt(prompt);
                }
                setIsDataSelectorExpanded(true);
              }}
              onInputFocusChange={handleInputFocusChange}
              isExpandedDataSelectorOpen={isDataSelectorExpanded}
              isExpandedDataSelectorMinimized={isExpandedDataSelectorMinimized}
              onFieldsToFillChange={setFieldsToFill}
              fieldValues={fieldValues}
              currentFillingField={currentFillingField}
              onFieldFilled={(fieldName, value, skipFocus) => {
                setFieldValues(prev => ({ ...prev, [fieldName]: value }));
              }}
              onCurrentFieldChange={(fieldName) => {
                setCurrentFillingField(fieldName);
              }}
              testButtonClickSignal={testButtonClicked}
              testButtonGlowSignal={testButtonGlow}
              onTestButtonClickHandled={() => setTestButtonClicked(false)}
              onTestButtonGlowHandled={() => setTestButtonGlow(false)}
              testResults={testResults}
              onTestComplete={handleTestComplete}
              onStepNameChange={(stepId, newName) => {
                setSteps(prev => prev.map(s => s.id === stepId ? { ...s, name: newName } : s));
              }}
            />
          </div>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}