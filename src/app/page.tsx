'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TypeformStep } from '@/components/TypeformStep';
import { TypeformButton } from '@/components/TypeformButton';
import { DateInput } from '@/components/DateInput';
import { NumberInput } from '@/components/NumberInput';
import { TextArea } from '@/components/TextArea';
import { LoginPage } from '@/components/LoginPage';
import { ManagerDashboard } from '@/components/ManagerDashboard';
import { absenceTypes, AbsenceType } from '@/config/absenceTypes';
import { offices, Office } from '@/config/offices';
import { t, Language, isValidLanguage } from '@/lib/i18n';
import { encodeFlowState, decodeFlowState, FlowState } from '@/lib/statelessFlow';
import { format, parseISO, isAfter, isBefore, differenceInDays } from 'date-fns';
import { getUserByEmail } from '@/lib/db/userService';
import { AbsenceRequest } from '@/types/absence';
import { getGroupedHolidays, GroupedHoliday } from '@/lib/holidays';
import { exportAllDataToConsole } from '@/lib/db/exportData';
import { seedDatabase } from '@/lib/db/index';

type Step = 'home' | 'type' | 'office' | 'duration' | 'dates' | 'note' | 'review' | 'submitted' | 'holidays' | 'history' | 'features' | 'documentation';
type UserRole = 'employee' | 'manager' | null;

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [language, setLanguage] = useState<Language>('en');
  const [step, setStep] = useState<Step>('home');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [flowState, setFlowState] = useState<FlowState>({
    step: 'home',
    data: {},
  });
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [showHolidays, setShowHolidays] = useState(false);
  const [showHistoryScreen, setShowHistoryScreen] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);

  useEffect(() => {
    // Initialize database
    if (typeof window !== 'undefined') {
      import('@/lib/db/index').then(({ getDatabase }) => {
        getDatabase().catch(console.error);
      });
    }
  }, []);

  // Load user requests when logged in as employee - use reactive subscription
  useEffect(() => {
    if (!userEmail || userRole !== 'employee') {
      setUserRequests([]);
      return;
    }

    let subscription: any = null;
    
    const setupSubscription = async () => {
      try {
        const { getDatabase } = await import('@/lib/db/index');
        const db = await getDatabase();
        
        if (db.absences) {
          const query = db.absences.find({
            selector: {
              userEmail: userEmail,
            },
          });
          
          subscription = query.$.subscribe((results) => {
            const requests = results.map((doc: any) => doc.toJSON());
            setUserRequests(requests);
          });
        } else {
          // Fallback to direct load
          const { listAbsenceRequests } = await import('@/lib/db/absenceService');
          const requests = await listAbsenceRequests({
            userEmail: userEmail,
          });
          setUserRequests(requests);
        }
      } catch (error) {
        console.error('Error loading user requests:', error);
      }
    };
    
    setupSubscription();
    
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [userEmail, userRole]);

  useEffect(() => {
    // Check for language in URL or state
    const langParam = searchParams.get('lang');
    const stateParam = searchParams.get('state');
    
    if (langParam && isValidLanguage(langParam)) {
      setLanguage(langParam);
    }
    
    if (stateParam) {
      const decoded = decodeFlowState(stateParam);
      if (decoded) {
        setFlowState(decoded);
        const decodedStep = decoded.step as Step;
        setStep(decodedStep === 'type' && userRole === 'employee' ? 'home' : decodedStep);
        if (decoded.language && isValidLanguage(decoded.language)) {
          setLanguage(decoded.language);
        }
        // Set user from decoded state if available
        if (decoded.data.userEmail) {
          setUserEmail(decoded.data.userEmail);
          getUserByEmail(decoded.data.userEmail).then(user => {
            if (user) {
              setUserRole(user.role);
              // If employee and step is type, redirect to home
              if (user.role === 'employee' && decodedStep === 'type') {
                setStep('home');
              }
            }
          }).catch(error => {
            console.error('Error loading user:', error);
          });
        }
      }
    }
  }, [searchParams, userRole]);

  // Sync URL with state changes (but not when state comes from URL to avoid loops)
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    // Skip URL update during initial load from URL params
    if (isInitializing) {
      setIsInitializing(false);
      return;
    }
    
    // Update URL when state or language changes
    const encoded = encodeFlowState(flowState);
    const newUrl = `/?state=${encoded}&lang=${language}`;
    const currentSearch = searchParams.toString();
    const newSearch = `state=${encoded}&lang=${language}`;
    
    // Only update if URL is different to avoid unnecessary navigation
    if (currentSearch !== newSearch) {
      router.replace(newUrl, { scroll: false });
    }
  }, [flowState, language, router, searchParams, isInitializing]);

  const updateState = useCallback((updates: Partial<FlowState>) => {
    setFlowState(prevState => {
      return { ...prevState, ...updates };
    });
  }, []);

  const handleLogin = async (email: string, role: 'employee' | 'manager') => {
    setUserEmail(email);
    setUserRole(role);
    // Update flow state with user info
    updateState({
      step: role === 'employee' ? 'home' : 'type',
      data: { ...flowState.data, userEmail: email, userId: email },
    });
    setStep(role === 'employee' ? 'home' : 'type');
  };

  const handleLogout = () => {
    setUserEmail(null);
    setUserRole(null);
    setStep('home');
    setFlowState({
      step: 'home',
      data: {},
    });
    setShowFeatures(false);
    setShowDocumentation(false);
    setShowHolidays(false);
    setShowHistoryScreen(false);
    // Clear URL state
    router.replace('/');
  };

  const handleTypeSelect = useCallback((type: AbsenceType) => {
    setFlowState(prevState => ({
      ...prevState,
      step: 'office',
      data: { ...prevState.data, type },
    }));
    setStep('office');
  }, []);

  const handleOfficeSelect = useCallback((office: Office) => {
    setFlowState(prevState => {
      const typeConfig = absenceTypes[prevState.data.type as AbsenceType];
      const nextStep = typeConfig.durationType === 'both' ? 'duration' : 'dates';
      setStep(nextStep);
      return {
        ...prevState,
        step: nextStep,
        data: { ...prevState.data, office },
      };
    });
  }, []);

  const handleDurationSelect = useCallback((durationType: 'hours' | 'days') => {
    setFlowState(prevState => ({
      ...prevState,
      step: 'dates',
      data: { ...prevState.data, durationType },
    }));
    setStep('dates');
  }, []);

  const handleStartNewRequest = useCallback(() => {
    setFlowState(prevState => ({
      ...prevState,
      step: 'type',
      data: prevState.data,
    }));
    setStep('type');
  }, []);

  const handleBackToFirstPage = useCallback(() => {
    setStep('home');
    setFlowState({
      step: 'home',
      data: {},
    });
    // URL will be updated by useEffect
  }, []);

  const handleDatesSubmit = useCallback(() => {
    setFlowState(prevState => ({
      ...prevState,
      step: 'note',
      data: prevState.data,
    }));
    setStep('note');
  }, []);

  const handleNoteSubmit = useCallback(() => {
    setFlowState(prevState => ({
      ...prevState,
      step: 'review',
      data: prevState.data,
    }));
    setStep('review');
  }, []);

  const handleCloseFeatures = useCallback(() => {
    setShowFeatures(false);
    setStep('home');
    setFlowState(prevState => ({
      ...prevState,
      step: 'home',
    }));
  }, []);

  const handleCloseDocumentation = useCallback(() => {
    setShowDocumentation(false);
    setStep('home');
    setFlowState(prevState => ({
      ...prevState,
      step: 'home',
    }));
  }, []);

  const handleToggleHistory = useCallback(() => {
    setShowAllHistory(prev => !prev);
  }, []);

  const handleShowHolidays = useCallback(() => {
    setShowHolidays(true);
    setStep('holidays');
  }, []);

  const handleShowHistory = useCallback(() => {
    setShowHistoryScreen(true);
    setStep('history');
  }, []);

  const handleCloseHolidays = useCallback(() => {
    setShowHolidays(false);
    setStep('home');
  }, []);

  const handleCloseHistory = useCallback(() => {
    setShowHistoryScreen(false);
    setStep('home');
  }, []);

  const handleShowFeatures = useCallback(() => {
    setShowFeatures(true);
    setStep('features');
  }, []);

  const handleShowDocumentation = useCallback(() => {
    setShowDocumentation(true);
    setStep('documentation');
  }, []);

  const goBack = useCallback(() => {
    // Handle special screens first
    if (step === 'holidays' || step === 'history' || step === 'features' || step === 'documentation') {
      if (step === 'features') {
        handleCloseFeatures();
      } else if (step === 'documentation') {
        handleCloseDocumentation();
      } else {
        setStep('home');
        setFlowState(prevState => ({
          ...prevState,
          step: 'home',
        }));
      }
      return;
    }
    
    // If logged out and on features/documentation, close them
    // @ts-ignore - TypeScript narrowing issue
    if ((step === 'features' || step === 'documentation') && (!userEmail || !userRole)) {
      if (step === 'features') {
        handleCloseFeatures();
      } else if (step === 'documentation') {
        handleCloseDocumentation();
      }
      return;
    }
    
    if (step === 'submitted') {
      setStep('home');
      setFlowState(prevState => ({
        ...prevState,
        step: 'home',
      }));
      return;
    }
    
    if (step === 'home') {
      // Can't go back from home - do nothing
      return;
    }
    
    // Regular flow navigation
    const stepOrder: Step[] = ['type', 'office', 'duration', 'dates', 'note', 'review'];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) {
      const prevStep = stepOrder[currentIndex - 1];
      setStep(prevStep);
      updateState({ step: prevStep });
    } else if (currentIndex === 0) {
      // From 'type' step, go back to 'home'
      setStep('home');
      setFlowState(prevState => ({
        ...prevState,
        step: 'home',
      }));
    }
  }, [step, updateState, userEmail, userRole, handleCloseFeatures, handleCloseDocumentation]);

  const handleSubmit = async () => {
    try {
      // Use RxDB directly instead of API
      const { createAbsenceRequest } = await import('@/lib/db/absenceService');
      const { getUserByEmail } = await import('@/lib/db/userService');
      
      const submitEmail = userEmail || flowState.data.userEmail;
      
      // Get user to find manager if not provided
      let managerEmail = flowState.data.managerEmail;
      if (!managerEmail && submitEmail) {
        const user = await getUserByEmail(submitEmail);
        if (user && user.managerEmail) {
          managerEmail = user.managerEmail;
        }
      }

      const submitData = {
        userId: submitEmail,
        userEmail: submitEmail,
        type: flowState.data.type!,
        office: flowState.data.office!,
        startDate: flowState.data.startDate!,
        endDate: flowState.data.endDate,
        hours: flowState.data.hours,
        days: flowState.data.days,
        note: flowState.data.note,
        managerEmail,
      };

      // Console log the absence request data and manager
      console.log('=== Absence Request Data ===');
      console.log('Request Data:', JSON.stringify(submitData, null, 2));
      console.log('Employee Email:', submitEmail);
      console.log('Manager Email:', managerEmail || 'No manager assigned');
      console.log('Absence Type:', submitData.type);
      console.log('Office:', submitData.office);
      console.log('Start Date:', submitData.startDate);
      console.log('End Date:', submitData.endDate || 'N/A');
      console.log('Hours:', submitData.hours || 'N/A');
      console.log('Days:', submitData.days || 'N/A');
      console.log('Note:', submitData.note || 'N/A');
      console.log('===========================');

      const createdRequest = await createAbsenceRequest(submitData);
      console.log('Created absence request:', createdRequest);
      
      // Update state and step - reactive subscription will update userRequests automatically
      setFlowState(prevState => ({
        ...prevState,
        step: 'submitted',
      }));
      setStep('submitted');
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    }
  };

  const typeConfig = flowState.data.type
    ? absenceTypes[flowState.data.type as AbsenceType]
    : null;

  // Global keyboard shortcuts (works for all states)
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      
      // Handle Ctrl+Shift+E to export all IndexedDB data (works everywhere)
      if (e.key === 'E' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        exportAllDataToConsole();
      }
      
      // Handle Ctrl+Shift+S to seed database (works everywhere)
      if (e.key === 'S' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        seedDatabase().then(() => {
          console.log('Database seeding triggered. Check console for details.');
          alert('Database seeding completed! Check console for details.');
        }).catch((error) => {
          console.error('Database seeding failed:', error);
          alert('Database seeding failed. Check console for details.');
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keyboard shortcuts for logged-out state (features/documentation)
  useEffect(() => {
    if (userEmail || userRole) return; // Only when logged out
    
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      
      if ((step === 'features' || step === 'documentation') && e.key === 'Escape') {
        e.preventDefault();
        if (step === 'features') {
          handleCloseFeatures();
        } else if (step === 'documentation') {
          handleCloseDocumentation();
        }
      } else if (e.key === 'Backspace' && (step === 'features' || step === 'documentation')) {
        e.preventDefault();
        if (step === 'features') {
          handleCloseFeatures();
        } else if (step === 'documentation') {
          handleCloseDocumentation();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, userEmail, userRole, handleCloseFeatures, handleCloseDocumentation]);

  // Add global keyboard handler for shortcuts (must be before conditional returns)
  useEffect(() => {
    if (userRole !== 'employee') return; // Only for employee flow

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Skip if typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      // Handle number key 1 for new request (on home screen)
      if (step === 'home' && e.key === '1') {
        e.preventDefault();
        handleStartNewRequest();
      }
      // Handle number key 2 for holidays (on home screen)
      else if (step === 'home' && e.key === '2') {
        e.preventDefault();
        handleShowHolidays();
      }
      // Handle number key 3 for history (on home screen)
      else if (step === 'home' && e.key === '3') {
        e.preventDefault();
        handleShowHistory();
      }
      // Handle Escape or Close button for holidays/history screens
      else if ((step === 'holidays' || step === 'history' || step === 'features' || step === 'documentation') && e.key === 'Escape') {
        e.preventDefault();
        if (step === 'holidays') {
          handleCloseHolidays();
        } else if (step === 'history') {
          handleCloseHistory();
        } else if (step === 'features') {
          handleCloseFeatures();
        } else if (step === 'documentation') {
          handleCloseDocumentation();
        }
      }
      // Handle Backspace to go back
      else if (e.key === 'Backspace') {
        e.preventDefault();
        goBack();
      }
      // Handle number keys for absence type selection
      else if (step === 'type' && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        const types = Object.entries(absenceTypes);
        if (types[index]) {
          e.preventDefault();
          handleTypeSelect(types[index][0] as AbsenceType);
        }
      }
      // Handle number keys for office selection
      else if (step === 'office' && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        const officeEntries = Object.entries(offices);
        if (officeEntries[index]) {
          e.preventDefault();
          handleOfficeSelect(officeEntries[index][0] as Office);
        }
      }
      // Handle duration selection
      else if (step === 'duration') {
        if (e.key === '1') {
          e.preventDefault();
          handleDurationSelect('hours');
        } else if (e.key === '2') {
          e.preventDefault();
          handleDurationSelect('days');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, userRole, handleStartNewRequest, handleTypeSelect, handleOfficeSelect, handleDurationSelect, handleShowHolidays, handleShowHistory, handleCloseHolidays, handleCloseHistory, goBack]);

  // Show login page if not logged in
  if (!userEmail || !userRole) {
    return (
      <div className="relative">
        <LoginPage 
          onLogin={handleLogin} 
          language={language}
          onShowFeatures={handleShowFeatures}
          onShowDocumentation={handleShowDocumentation}
        />
        {step === 'features' && (
          <div className="absolute inset-0 z-50">
            <FeaturesScreen
              language={language}
              onClose={handleCloseFeatures}
            />
          </div>
        )}
        {step === 'documentation' && (
          <div className="absolute inset-0 z-50">
            <DocumentationScreen
              language={language}
              onClose={handleCloseDocumentation}
            />
          </div>
        )}
      </div>
    );
  }

  // Show manager dashboard if manager
  if (userRole === 'manager') {
    return <ManagerDashboard managerEmail={userEmail} language={language} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* User Controls Bar (email, language selector, logout) */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="text-sm text-gray-700 truncate min-w-0 flex-shrink">
          {userEmail}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <select
            value={language}
            onChange={(e) => {
              const newLang = e.target.value as Language;
              setLanguage(newLang);
              setFlowState(prevState => ({
                ...prevState,
                language: newLang,
              }));
            }}
            className="px-3 py-2 bg-white shadow"
          >
            <option value="en">English</option>
            <option value="sl">Slovenščina</option>
            <option value="de">Deutsch</option>
          </select>
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-white shadow"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Show employee absence request flow */}
      {step === 'holidays' && userRole === 'employee' ? (
        <HolidaysScreen
          language={language}
          onClose={handleCloseHolidays}
        />
      ) : step === 'history' && userRole === 'employee' ? (
        <HistoryScreen
          language={language}
          requests={userRequests}
          onClose={handleCloseHistory}
        />
      ) : step === 'home' && userRole === 'employee' ? (
        <EmployeeHomeScreen
          userEmail={userEmail!}
          language={language}
          requests={userRequests}
          showAllHistory={showAllHistory}
          onToggleHistory={handleToggleHistory}
          onStartNewRequest={handleStartNewRequest}
          onShowHolidays={handleShowHolidays}
          onShowHistory={handleShowHistory}
        />
      ) : step === 'submitted' ? (
        <TypeformStep title={t('absence.submitted', language)}>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-600">{t('absence.submitted', language)}</p>
            <div className="mt-6">
              <TypeformButton
                label={t('common.backToFirstPage', language) || 'Back to first page'}
                onClick={handleBackToFirstPage}
                variant="primary"
                autoFocus
              />
            </div>
          </div>
        </TypeformStep>
      ) : (
        <>
          {step === 'type' && (
        <TypeformStep
          title={t('absence.title', language)}
          description={t('absence.selectType', language)}
        >
          {Object.entries(absenceTypes).map(([key, config], index) => (
            <TypeformButton
              key={key}
              label={t(`absence.types.${key}`, language)}
              shortcut={String(index + 1)}
              onClick={() => handleTypeSelect(key as AbsenceType)}
              autoFocus={index === 0}
            />
          ))}
        </TypeformStep>
      )}

      {step === 'office' && (
        <TypeformStep
          title={t('absence.selectOffice', language)}
          showBack
          onBack={goBack}
        >
          {Object.entries(offices).map(([key, office], index) => (
            <TypeformButton
              key={key}
              label={t(`office.${key}`, language)}
              shortcut={String(index + 1)}
              onClick={() => handleOfficeSelect(key as Office)}
              autoFocus={index === 0}
            />
          ))}
        </TypeformStep>
      )}

      {step === 'duration' && (
        <TypeformStep
          title={t('absence.selectDuration', language)}
          showBack
          onBack={goBack}
        >
          <TypeformButton
            label={t('absence.duration.hours', language)}
            shortcut="1"
            onClick={() => handleDurationSelect('hours')}
            autoFocus
          />
          <TypeformButton
            label={t('absence.duration.days', language)}
            shortcut="2"
            onClick={() => handleDurationSelect('days')}
          />
        </TypeformStep>
      )}

      {step === 'dates' && (
        <TypeformStep
          title={t('absence.selectDate', language)}
          showBack
          onBack={goBack}
        >
          <DateInput
            label={t('absence.selectStartDate', language)}
            value={flowState.data.startDate || ''}
            onChange={(value) =>
              updateState({
                data: { ...flowState.data, startDate: value },
              })
            }
            min={format(new Date(), 'yyyy-MM-dd')}
            required
            autoFocus
          />
          {(typeConfig?.durationType === 'days' || flowState.data.durationType === 'days') && (
            <DateInput
              label={t('absence.selectEndDate', language)}
              value={flowState.data.endDate || ''}
              onChange={(value) =>
                updateState({
                  data: { ...flowState.data, endDate: value },
                })
              }
              min={flowState.data.startDate || format(new Date(), 'yyyy-MM-dd')}
            />
          )}
          {(typeConfig?.durationType === 'hours' || flowState.data.durationType === 'hours') && (
            <NumberInput
              label={t('absence.selectHours', language)}
              value={flowState.data.hours || ''}
              onChange={(value) =>
                updateState({
                  data: { ...flowState.data, hours: value },
                })
              }
              min={0.5}
              step={0.5}
              required
            />
          )}
          <div className="pt-4">
            <TypeformButton
              label={t('common.next', language)}
              onClick={handleDatesSubmit}
              variant="primary"
            />
          </div>
        </TypeformStep>
      )}

      {step === 'note' && (
        <TypeformStep
          title={t('absence.addNote', language)}
          showBack
          onBack={goBack}
        >
          <TextArea
            label={t('absence.addNote', language)}
            value={flowState.data.note || ''}
            onChange={(value) =>
              updateState({
                data: { ...flowState.data, note: value },
              })
            }
            placeholder={t('absence.notePlaceholder', language)}
            autoFocus
          />
          <div className="pt-4">
            <TypeformButton
              label={t('common.next', language)}
              onClick={handleNoteSubmit}
              variant="primary"
            />
          </div>
        </TypeformStep>
      )}

      {step === 'review' && (
        <TypeformStep
          title={t('absence.review', language)}
          showBack
          onBack={goBack}
        >
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <div>
              <strong>{t('absence.selectType', language)}:</strong>{' '}
              {t(`absence.types.${flowState.data.type}`, language)}
            </div>
            <div>
              <strong>{t('absence.selectOffice', language)}:</strong>{' '}
              {t(`office.${flowState.data.office}`, language)}
            </div>
            <div>
              <strong>{t('absence.selectStartDate', language)}:</strong>{' '}
              {flowState.data.startDate}
            </div>
            {flowState.data.endDate && (
              <div>
                <strong>{t('absence.selectEndDate', language)}:</strong>{' '}
                {flowState.data.endDate}
              </div>
            )}
            {flowState.data.hours && (
              <div>
                <strong>{t('absence.selectHours', language)}:</strong>{' '}
                {flowState.data.hours}
              </div>
            )}
            {flowState.data.note && (
              <div>
                <strong>{t('absence.addNote', language)}:</strong>{' '}
                {flowState.data.note}
              </div>
            )}
          </div>
          <div className="pt-4">
            <TypeformButton
              label={t('common.submit', language)}
              onClick={handleSubmit}
              variant="primary"
              autoFocus
            />
          </div>
        </TypeformStep>
      )}
        </>
      )}
    </div>
  );
}

interface EmployeeHomeScreenProps {
  userEmail: string;
  language: Language;
  requests: AbsenceRequest[];
  showAllHistory: boolean;
  onToggleHistory: () => void;
  onStartNewRequest: () => void;
  onShowHolidays: () => void;
  onShowHistory: () => void;
}

function EmployeeHomeScreen({
  userEmail,
  language,
  requests,
  showAllHistory,
  onToggleHistory,
  onStartNewRequest,
  onShowHolidays,
  onShowHistory,
}: EmployeeHomeScreenProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Categorize requests
  const ongoing = requests.filter(req => {
    const start = parseISO(req.startDate);
    const end = req.endDate ? parseISO(req.endDate) : start;
    return (isBefore(start, today) || start.getTime() === today.getTime()) && 
           (isAfter(end, today) || end.getTime() === today.getTime()) &&
           req.status === 'approved';
  });

  const upcoming = requests.filter(req => {
    const start = parseISO(req.startDate);
    return isAfter(start, today) && req.status === 'approved';
  });

  const pending = requests.filter(req => 
    req.status === 'pending' || req.status === 'sent'
  );

  const rejected = requests.filter(req => req.status === 'denied');

  // All history sorted by start date (newest first)
  const allHistory = [...requests].sort((a, b) => {
    const dateA = parseISO(a.startDate);
    const dateB = parseISO(b.startDate);
    return dateB.getTime() - dateA.getTime();
  });

  // Check if request has large gap between creation and start date (more than 30 days)
  const hasLargeGap = (req: AbsenceRequest) => {
    const created = parseISO(req.createdAt);
    const start = parseISO(req.startDate);
    return differenceInDays(start, created) > 30;
  };

  const handleAbortRequest = async (requestId: string) => {
    try {
      const { updateAbsenceRequest } = await import('@/lib/db/absenceService');
      await updateAbsenceRequest(requestId, { status: 'cancelled' });
      console.log('Request aborted:', requestId);
    } catch (error) {
      console.error('Error aborting request:', error);
      alert('Failed to abort request. Please try again.');
    }
  };

  const handleResendRequest = async (requestId: string) => {
    try {
      const { updateAbsenceRequest } = await import('@/lib/db/absenceService');
      await updateAbsenceRequest(requestId, { status: 'sent' });
      console.log('Request resent:', requestId);
      // Note: In a real implementation, this would trigger notifications to manager/stand-in
    } catch (error) {
      console.error('Error resending request:', error);
      alert('Failed to resend request. Please try again.');
    }
  };

  const renderRequestCard = (req: AbsenceRequest, showWarning = false) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    const isPending = req.status === 'pending' || req.status === 'sent';

    return (
      <div key={req.id} className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{t(`absence.types.${req.type}`, language)}</span>
              {showWarning && <span className="text-red-600 font-bold">!!</span>}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {format(parseISO(req.startDate), 'PPP')}
              {req.endDate && req.endDate !== req.startDate && (
                <> - {format(parseISO(req.endDate), 'PPP')}</>
              )}
            </div>
            {req.note && (
              <div className="text-sm text-gray-500 mt-2">{req.note}</div>
            )}
            {/* Action buttons for pending requests */}
            {isPending && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleAbortRequest(req.id)}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  {t('absence.abortRequest', language) || 'Abort'}
                </button>
                <button
                  onClick={() => handleResendRequest(req.id)}
                  className="px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                >
                  {t('absence.resendRequest', language) || 'Resend'}
                </button>
              </div>
            )}
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[req.status]}`}>
            {t(`status.${req.status}`, language)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <TypeformStep title={t('absence.myRequests', language) || 'My Requests'}>
      <div className="space-y-6">
        {/* New Request Button at top */}
        <TypeformButton
          label={t('absence.newRequest', language) || 'Start New Request'}
          onClick={onStartNewRequest}
          variant="primary"
          shortcut="1"
          autoFocus
        />

        {!showAllHistory ? (
          <>
            {/* Ongoing Requests */}
            {ongoing.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  {t('absence.ongoing', language) || 'Ongoing'}
                </h3>
                <div className="space-y-2">
                  {ongoing.map(req => renderRequestCard(req))}
                </div>
              </div>
            )}

            {/* Upcoming Requests */}
            {upcoming.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  {t('absence.upcoming', language) || 'Upcoming'}
                </h3>
                <div className="space-y-2">
                  {upcoming.map(req => renderRequestCard(req))}
                </div>
              </div>
            )}

            {/* Pending Requests */}
            {pending.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  {t('absence.pending', language) || 'Pending'}
                </h3>
                <div className="space-y-2">
                  {pending.map(req => renderRequestCard(req))}
                </div>
              </div>
            )}

            {/* Rejected Requests */}
            {rejected.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  {t('absence.rejected', language) || 'Rejected'}
                </h3>
                <div className="space-y-2">
                  {rejected.map(req => renderRequestCard(req))}
                </div>
              </div>
            )}

            {/* Show Holidays Button */}
            <TypeformButton
              label={t('absence.showHolidays', language) || 'Show Public Holidays'}
              onClick={onShowHolidays}
              variant="outline"
              shortcut="2"
            />

            {/* Show All History Button */}
            {allHistory.length > 0 && (
              <TypeformButton
                label={t('absence.showAllHistory', language) || 'Show All History'}
                onClick={onShowHistory}
                variant="outline"
                shortcut="3"
              />
            )}
          </>
        ) : (
          <>
            {/* All History View */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                {t('absence.allHistory', language) || 'All History'}
              </h3>
              <div className="space-y-2">
                {allHistory.map(req => renderRequestCard(req, hasLargeGap(req)))}
              </div>
            </div>
            <TypeformButton
              label={t('absence.hideHistory', language) || 'Hide History'}
              onClick={onToggleHistory}
              variant="outline"
            />
          </>
        )}

        {/* New Request Button at bottom */}
        <TypeformButton
          label={t('absence.newRequest', language) || 'Start New Request'}
          onClick={onStartNewRequest}
          variant="primary"
          shortcut="1"
        />
      </div>
    </TypeformStep>
  );
}

interface HolidaysScreenProps {
  language: Language;
  onClose: () => void;
}

function HolidaysScreen({ language, onClose }: HolidaysScreenProps) {
  const groupedHolidays = getGroupedHolidays(100);

  const getFlagEmoji = (office: 'ljubljana' | 'munich'): string => {
    return office === 'ljubljana' ? '🇸🇮' : '🇩🇪';
  };

  return (
    <TypeformStep title={t('absence.publicHolidays', language) || 'Public Holidays'}>
      <div className="space-y-6">
        <div className="space-y-2 max-h-[70vh] overflow-y-auto">
          {groupedHolidays.map((holiday) => (
            <div key={holiday.date} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex gap-1 mt-1">
                  {holiday.offices.map(office => (
                    <span key={office} className="text-2xl">{getFlagEmoji(office)}</span>
                  ))}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-lg">
                    {holiday.displayName[language] || holiday.displayName.en}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {format(parseISO(holiday.date), 'PPP')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <TypeformButton
          label={t('common.close', language) || 'Close'}
          onClick={onClose}
          variant="primary"
          autoFocus
        />
      </div>
    </TypeformStep>
  );
}

interface HistoryScreenProps {
  language: Language;
  requests: AbsenceRequest[];
  onClose: () => void;
}

function HistoryScreen({ language, requests, onClose }: HistoryScreenProps) {
  // All history sorted by start date (newest first)
  const allHistory = [...requests].sort((a, b) => {
    const dateA = parseISO(a.startDate);
    const dateB = parseISO(b.startDate);
    return dateB.getTime() - dateA.getTime();
  });

  // Check if request has large gap between creation and start date (more than 30 days)
  const hasLargeGap = (req: AbsenceRequest) => {
    const created = parseISO(req.createdAt);
    const start = parseISO(req.startDate);
    return differenceInDays(start, created) > 30;
  };

  const renderRequestCard = (req: AbsenceRequest, showWarning = false) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    return (
      <div key={req.id} className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{t(`absence.types.${req.type}`, language)}</span>
              {showWarning && <span className="text-red-600 font-bold">!!</span>}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {format(parseISO(req.startDate), 'PPP')}
              {req.endDate && req.endDate !== req.startDate && (
                <> - {format(parseISO(req.endDate), 'PPP')}</>
              )}
            </div>
            {req.note && (
              <div className="text-sm text-gray-500 mt-2">{req.note}</div>
            )}
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[req.status]}`}>
            {t(`status.${req.status}`, language)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <TypeformStep title={t('absence.allHistory', language) || 'All History'}>
      <div className="space-y-6">
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {allHistory.length > 0 ? (
            allHistory.map(req => renderRequestCard(req, hasLargeGap(req)))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('absence.noHistory', language) || 'No history available'}
            </div>
          )}
        </div>

        {/* Close Button */}
        <TypeformButton
          label={t('common.close', language) || 'Close'}
          onClick={onClose}
          variant="primary"
          autoFocus
        />
      </div>
    </TypeformStep>
  );
}

interface FeaturesScreenProps {
  language: Language;
  onClose: () => void;
}

function FeaturesScreen({ language, onClose }: FeaturesScreenProps) {
  const [featuresContent, setFeaturesContent] = useState<string>('');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Load FEATURES.md content
    fetch('/FEATURES.md')
      .then(res => res.text())
      .then(text => setFeaturesContent(text))
      .catch(err => {
        console.error('Error loading features:', err);
        setFeaturesContent('Error loading features documentation.');
      });
  }, []);

  // Focus the close button when content loads or component mounts
  useEffect(() => {
    if (closeButtonRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [featuresContent]);

  // Simple markdown-like formatting
  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold mt-6 mb-3 text-gray-900">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-gray-800">{line.substring(4)}</h3>;
      }
      if (line.startsWith('- ✅')) {
        return <div key={index} className="text-green-700 ml-4 mb-1">{line.substring(2)}</div>;
      }
      if (line.startsWith('- ⏳')) {
        return <div key={index} className="text-yellow-700 ml-4 mb-1">{line.substring(2)}</div>;
      }
      if (line.startsWith('- 🔮')) {
        return <div key={index} className="text-gray-600 ml-4 mb-1">{line.substring(2)}</div>;
      }
      if (line.startsWith('- ')) {
        return <div key={index} className="ml-4 mb-1">{line.substring(2)}</div>;
      }
      if (line.trim() === '') {
        return <div key={index} className="mb-2"></div>;
      }
      return <div key={index} className="mb-2">{line}</div>;
    });
  };

  return (
    <TypeformStep title={t('absence.features', language) || 'Features'}>
      <div className="space-y-6">
        <div className="max-h-[70vh] overflow-y-auto bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-800">
            {featuresContent ? formatMarkdown(featuresContent) : (
              <div className="text-center py-8 text-gray-500">Loading features...</div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onClose();
            }
          }}
          className="w-full px-6 py-4 rounded-lg text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 cursor-pointer"
          autoFocus
        >
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">{t('common.close', language) || 'Close'}</span>
          </div>
        </button>
      </div>
    </TypeformStep>
  );
}

interface DocumentationScreenProps {
  language: Language;
  onClose: () => void;
}

function DocumentationScreen({ language, onClose }: DocumentationScreenProps) {
  const [docsContent, setDocsContent] = useState<string>('');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Load DOCUMENTATION.md content
    fetch('/DOCUMENTATION.md')
      .then(res => res.text())
      .then(text => setDocsContent(text))
      .catch(err => {
        console.error('Error loading documentation:', err);
        setDocsContent('Error loading documentation.');
      });
  }, []);

  // Focus the close button when content loads or component mounts
  useEffect(() => {
    if (closeButtonRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [docsContent]);

  // Simple markdown-like formatting
  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');
    const result: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockIndex = 0;

    lines.forEach((line, index) => {
      // Handle code block start/end
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // End of code block
          result.push(
            <pre key={`code-${codeBlockIndex}`} className="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto">
              <code className="text-sm font-mono whitespace-pre">{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
          codeBlockIndex++;
        } else {
          // Start of code block
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        // Collect code block content
        codeBlockContent.push(line);
        return;
      }

      // Regular markdown formatting
      if (line.startsWith('## ')) {
        result.push(<h2 key={index} className="text-2xl font-bold mt-6 mb-3 text-gray-900">{line.substring(3)}</h2>);
      } else if (line.startsWith('### ')) {
        result.push(<h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-gray-800">{line.substring(4)}</h3>);
      } else if (line.startsWith('- ')) {
        result.push(<div key={index} className="ml-4 mb-1">{line.substring(2)}</div>);
      } else if (line.trim() === '') {
        result.push(<div key={index} className="mb-2"></div>);
      } else if (line.startsWith('**') && line.endsWith('**')) {
        result.push(<div key={index} className="font-semibold mb-2">{line.substring(2, line.length - 2)}</div>);
      } else {
        result.push(<div key={index} className="mb-2">{line}</div>);
      }
    });

    // Handle case where code block is not closed
    if (inCodeBlock && codeBlockContent.length > 0) {
      result.push(
        <pre key={`code-${codeBlockIndex}`} className="bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto">
          <code className="text-sm font-mono whitespace-pre">{codeBlockContent.join('\n')}</code>
        </pre>
      );
    }

    return result;
  };

  return (
    <TypeformStep title={t('absence.documentation', language) || 'Documentation'}>
      <div className="space-y-6">
        <div className="max-h-[70vh] overflow-y-auto bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-800">
            {docsContent ? formatMarkdown(docsContent) : (
              <div className="text-center py-8 text-gray-500">Loading documentation...</div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onClose();
            }
          }}
          className="w-full px-6 py-4 rounded-lg text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 cursor-pointer"
          autoFocus
        >
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">{t('common.close', language) || 'Close'}</span>
          </div>
        </button>
      </div>
    </TypeformStep>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
