import React, { createContext, useContext, useState } from 'react';

export type ViewType =
  | 'landing'
  | 'login'
  | 'register'
  | 'forgot-password'
  // Student views
  | 'student-dashboard'
  | 'student-questions'
  | 'student-coding'
  | 'student-submissions'
  // Teacher views
  | 'teacher-dashboard'
  | 'teacher-questions'
  | 'teacher-students'
  | 'submissions'
  | 'submission-detail'
  | 'similarity'
  | 'review-queue'
  | 'clusters'
  | 'timeline'
  // Admin views
  | 'admin-dashboard'
  | 'admin-questions'
  | 'admin-assignments'
  | 'admin-users'
  | 'assignments'
  | 'students'
  | 'reports'
  | 'settings'
  | 'profile';

export interface ToastItem {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
}

interface AppContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedSubmissionId: string;
  setSelectedSubmissionId: (id: string) => void;
  selectedQuestionId: string;
  setSelectedQuestionId: (id: string) => void;
  similaritySelection: {
    submissionAId: string;
    submissionBId: string;
  };
  setSimilaritySelection: (sel: { submissionAId: string; submissionBId: string }) => void;
  selectedClusterId: string;
  setSelectedClusterId: (id: string) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  navigateToSubmission: (id: string) => void;
  navigateToSimilarity: (submissionAId: string, submissionBId: string) => void;
  navigateToCluster: (clusterId: string) => void;
  navigateToCoding: (questionId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('SUB-1042');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('Q-0001');
  const [similaritySelection, setSimilaritySelection] = useState({
    submissionAId: 'SUB-1042',
    submissionBId: 'SUB-1049'
  });
  const [selectedClusterId, setSelectedClusterId] = useState<string>('CLUSTER-A');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([
    {
      id: 'init-toast',
      type: 'info',
      title: 'ROX AI Integrity Platform',
      message: 'Active assessment session initialized for Computer Science Dept.'
    }
  ]);

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateToSubmission = (id: string) => {
    setSelectedSubmissionId(id);
    setCurrentView('submission-detail');
  };

  const navigateToSimilarity = (submissionAId: string, submissionBId: string) => {
    setSimilaritySelection({ submissionAId, submissionBId });
    setCurrentView('similarity');
  };

  const navigateToCluster = (clusterId: string) => {
    setSelectedClusterId(clusterId);
    setCurrentView('clusters');
  };

  const navigateToCoding = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setCurrentView('student-coding');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedSubmissionId,
        setSelectedSubmissionId,
        selectedQuestionId,
        setSelectedQuestionId,
        similaritySelection,
        setSimilaritySelection,
        selectedClusterId,
        setSelectedClusterId,
        selectedStudentId,
        setSelectedStudentId,
        toasts,
        addToast,
        removeToast,
        navigateToSubmission,
        navigateToSimilarity,
        navigateToCluster,
        navigateToCoding
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
