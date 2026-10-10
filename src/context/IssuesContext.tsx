import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Issue, IssueStatus } from '@/lib/types';
import { mockIssues } from '@/lib/mockData';
import { categorizeIssue, assignPriority, generateTitle } from '@/lib/aiLogic';
import { db } from '@/lib/firebaseClient';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

interface IssuesContextType {
  issues: Issue[];
  addIssue: (issue: Omit<Issue, 'id' | 'category' | 'priority' | 'status' | 'reportedAt' | 'updatedAt'>) => Issue;
  updateIssueStatus: (id: string, status: IssueStatus) => void;
  getIssueById: (id: string) => Issue | undefined;
}

const IssuesContext = createContext<IssuesContextType | undefined>(undefined);

export function IssuesProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>(mockIssues);

  useEffect(() => {
    // If Firestore `db` is not initialized, keep mock data
    if (!db) return;

    const col = collection(db, 'issues');
    const q = query(col, orderBy('reportedAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs: Issue[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          title: data.title,
          description: data.description,
          category: data.category || 'roads',
          priority: data.priority || 'low',
          status: data.status || 'reported',
          location: data.location || { address: '', lat: 0, lng: 0 },
          imageUrl: data.imageUrl || null,
          reportedBy: data.reportedBy || 'Unknown',
          reportedAt: data.reportedAt ? data.reportedAt.toDate() : new Date(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
          // include aiAnalysis if present (security rules will already restrict it)
          aiAnalysis: data.aiAnalysis || null,
        } as Issue;
      });
      setIssues(docs);
    });

    return () => unsub();
  }, []);
  const addIssue = (issueData: Omit<Issue, 'id' | 'category' | 'priority' | 'status' | 'reportedAt' | 'updatedAt'>): Issue => {
    // AI-powered categorization and priority assignment
    const category = categorizeIssue(issueData.description);
    const priority = assignPriority(issueData.description);
    const title = issueData.title || generateTitle(issueData.description, category);

    const newIssue: Issue = {
      ...issueData,
      id: Date.now().toString(),
      title,
      category,
      priority,
      status: 'reported',
      reportedAt: new Date(),
      updatedAt: new Date(),
    };

    setIssues(prev => [newIssue, ...prev]);
    return newIssue;
  };

  const updateIssueStatus = (id: string, status: IssueStatus) => {
    setIssues(prev =>
      prev.map(issue =>
        issue.id === id
          ? { ...issue, status, updatedAt: new Date() }
          : issue
      )
    );
  };

  const getIssueById = (id: string) => {
    return issues.find(issue => issue.id === id);
  };

  return (
    <IssuesContext.Provider value={{ issues, addIssue, updateIssueStatus, getIssueById }}>
      {children}
    </IssuesContext.Provider>
  );
}

export function useIssues() {
  const context = useContext(IssuesContext);
  if (context === undefined) {
    throw new Error('useIssues must be used within an IssuesProvider');
  }
  return context;
}
