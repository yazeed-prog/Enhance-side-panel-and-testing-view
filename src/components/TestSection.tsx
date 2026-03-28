import { CheckCircle2, XCircle, ChevronDown, ChevronRight, Copy, Loader2, ChevronUp, Play } from 'lucide-react';
import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { TreeJsonViewer } from './TreeJsonViewer';

interface TestResult {
  status: 'idle' | 'testing' | 'success' | 'failed';
  output: any;
  date: string | null;
}

interface TestSectionProps {
  stepId: string;
  testResult?: TestResult;
  onTestComplete: (stepId: string, result: TestResult) => void;
  isAIFilling?: boolean;
  testButtonRef?: React.RefObject<HTMLButtonElement>;
  isGlowing?: boolean;
  hasEmptyRequiredFields?: boolean;
  headerPortalRef?: React.RefObject<HTMLDivElement>;
}

export interface TestSectionHandle {
  triggerTest: () => void;
  cancelTest: () => void;
}

export const TestSection = forwardRef<TestSectionHandle, TestSectionProps>(({ stepId, testResult, onTestComplete, isAIFilling, testButtonRef, isGlowing, hasEmptyRequiredFields, headerPortalRef }, ref) => {
  const currentStatus = testResult?.status || 'idle';
  const currentOutput = testResult?.output || null;
  const currentDate = testResult?.date || null;
  
  const [isOutputExpanded, setIsOutputExpanded] = useState(true);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [showDisabledTooltip, setShowDisabledTooltip] = useState(false);
  const testBtnWrapperRef = useRef<HTMLDivElement>(null);
  const testTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousResultRef = useRef<TestResult | null>(null);

  const isDisabledByFields = hasEmptyRequiredFields && currentStatus !== 'testing';

  // دالة الاختبار
  const handleTest = async () => {
    // Save current result before testing
    if (testResult && testResult.status !== 'testing') {
      previousResultRef.current = testResult;
    }
    
    onTestComplete(stepId, { status: 'testing', output: null, date: null });
    
    // محاكاة API call
    testTimeoutRef.current = setTimeout(() => {
      // محاكاة نجاح أو فشل عشوائي
      const isSuccess = Math.random() > 0.3; // 70% نجاح
      
      if (isSuccess) {
        onTestComplete(stepId, {
          status: 'success',
          output: {
            config: {
              url: "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
              method: "POST",
              userAgentDirectives: [
                {
                  product: "google-api-nodejs-client",
                  version: "7.2.0",
                  comment: "gzip"
                }
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
              labelIds: [
                "UNREAD",
                "SENT",
                "INBOX"
              ]
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
          },
          date: new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        });
      } else {
        onTestComplete(stepId, {
          status: 'failed',
          output: {
            error: 'Authentication failed',
            message: 'Invalid credentials or expired token',
            code: 'AUTH_ERROR_401',
            details: {
              timestamp: new Date().toISOString(),
              endpoint: '/api/send-email',
              suggestion: 'Please reconnect your account'
            }
          },
          date: new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        });
      }
    }, 1500);
  };

  // دالة نسخ الـ output
  const handleCopyOutput = () => {
    if (currentOutput) {
      const text = JSON.stringify(currentOutput, null, 2);
      
      // Fallback method للنسخ
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopiedOutput(true);
        setTimeout(() => setCopiedOutput(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      
      document.body.removeChild(textArea);
    }
  };

  // تعيين الدالة triggerTest للوصول إليها من خارج المكون
  useImperativeHandle(ref, () => ({
    triggerTest: handleTest,
    cancelTest: () => {
      // Clear the timeout to prevent it from completing
      if (testTimeoutRef.current) {
        clearTimeout(testTimeoutRef.current);
        testTimeoutRef.current = null;
      }
      // Restore previous result or set to idle
      const resultToRestore = previousResultRef.current || { status: 'idle' as const, output: null, date: null };
      onTestComplete(stepId, resultToRestore);
      previousResultRef.current = null;
    }
  }));

  return (
    <div>
      
      
      {/* Glow Animation Styles */}
      <style>{`
        @keyframes test-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0);
          }
          50% {
            box-shadow: 0 0 20px 5px rgba(147, 51, 234, 0.6);
          }
        }
        .test-button-glow {
          animation: test-glow 1.5s ease-in-out infinite;
        }
      `}</style>
      
      {/* Test Button */}
      {(() => {
        const buttonContent = (
          <div ref={testBtnWrapperRef} className="relative">
            <div
              onMouseEnter={() => isDisabledByFields && setShowDisabledTooltip(true)}
              onMouseLeave={() => setShowDisabledTooltip(false)}
            >
              <button 
                ref={testButtonRef}
                onClick={() => {
                  if (isDisabledByFields) return;
                  handleTest();
                }}
                disabled={currentStatus === 'testing' || isAIFilling || !!isDisabledByFields}
                className={`${headerPortalRef?.current ? 'px-2 text-[13px]' : 'w-full px-3 py-2 text-sm'} rounded transition-colors flex items-center justify-center gap-2 ${isDisabledByFields ? 'text-purple-300 opacity-50 cursor-not-allowed' : 'text-purple-600 hover:bg-purple-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'} ${isGlowing ? 'test-button-glow' : ''} text-[12px] px-[6px] py-[3px]`}
              >
                {currentStatus === 'testing' ? (
                  <Loader2 size={headerPortalRef?.current ? 14 : 16} className="animate-spin text-purple-400" />
                ) : (
                  <Play size={headerPortalRef?.current ? 14 : 16} className="text-purple-500" />
                )}
                {currentStatus === 'testing' ? 'Testing...' : 'Test Step'}
              </button>
            </div>
            {showDisabledTooltip && isDisabledByFields && testBtnWrapperRef.current && createPortal(
              headerPortalRef?.current ? (
                <div
                  className="pointer-events-none"
                  style={{
                    position: 'fixed',
                    left: testBtnWrapperRef.current.getBoundingClientRect().left + testBtnWrapperRef.current.getBoundingClientRect().width / 2,
                    top: testBtnWrapperRef.current.getBoundingClientRect().bottom + 6,
                    transform: 'translateX(-50%)',
                    zIndex: 99999,
                  }}
                >
                  <div className="px-3 py-1.5 bg-gray-900 text-white text-[12px] rounded-md whitespace-nowrap shadow-lg">
                    Configure this step first
                  </div>
                </div>
              ) : (
              <div
                className="flex flex-col items-center pointer-events-none"
                style={{
                  position: 'fixed',
                  left: testBtnWrapperRef.current.getBoundingClientRect().left + testBtnWrapperRef.current.getBoundingClientRect().width / 2,
                  top: testBtnWrapperRef.current.getBoundingClientRect().top - 8,
                  transform: 'translate(-50%, -100%)',
                  zIndex: 99999,
                }}
              >
                <div className="px-4 py-2.5 bg-[#1a1a2e] text-white text-[13px] rounded-xl whitespace-nowrap flex flex-col items-center gap-0.5 shadow-xl">
                  <ChevronUp size={16} className="text-gray-400" />
                  Configure this step first
                </div>
              </div>
              ),
              document.body
            )}
          </div>
        );

        if (headerPortalRef?.current) {
          return createPortal(buttonContent, headerPortalRef.current);
        }
        return buttonContent;
      })()}

      {/* Test Result */}
      {currentStatus !== 'idle' && currentStatus !== 'testing' && currentOutput && (
        <div className="mt-4 space-y-3">
          {/* Status Header */}
          {/* removed */}

          {/* Output Section */}
          <div className="overflow-hidden">
            {/* Output Header - REMOVED */}
            {isOutputExpanded && (
              <div className="bg-white overflow-y-auto max-h-[400px]">
                <TreeJsonViewer data={currentOutput} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

TestSection.displayName = 'TestSection';