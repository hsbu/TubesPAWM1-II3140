'use client';

import { useState, useEffect } from 'react';
import { apiClient, Lesson, PracticeProblem, UserProgress } from '@/lib/api';

export function useLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getLessons();
        
        if (response.success) {
          setLessons(response.data);
        } else {
          setError('Failed to fetch lessons');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch lessons');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const refetch = async () => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getLessons();
        
        if (response.success) {
          setLessons(response.data);
        } else {
          setError('Failed to fetch lessons');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch lessons');
      } finally {
        setLoading(false);
      }
    };

    await fetchLessons();
  };

  return { lessons, loading, error, refetch };
}

// Hook for fetching a single lesson by slug
export function useLesson(slug: string) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getLessonBySlug(slug);
        
        if (response.success) {
          setLesson(response.data);
        } else {
          setError('Lesson not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch lesson');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [slug]);

  return { lesson, loading, error };
}

// Hook for fetching practice problems for a lesson
export function usePracticeProblems(lessonId: number | null) {
  const [problems, setProblems] = useState<PracticeProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProblems = async () => {
      if (lessonId === null || typeof lessonId !== 'number' || !Number.isInteger(lessonId)) {
        setLoading(false);
        setProblems([]);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getPracticeProblems(lessonId);
        
        if (response.success) {
          setProblems(response.data);
        } else {
          setError(response.message || 'Failed to fetch practice problems');
        }
      } catch (err: any) {
        console.error("usePracticeProblems error:", err);
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [lessonId]);

  const refetch = () => {
    // This is a placeholder. A real implementation would call fetchProblems().
    // To avoid stale closures, you might need to use useCallback for fetchProblems.
    const fetchProblems = async () => {
      if (lessonId === null || typeof lessonId !== 'number' || !Number.isInteger(lessonId)) {
        setLoading(false);
        setProblems([]);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getPracticeProblems(lessonId);
        if (response.success) {
          setProblems(response.data);
        } else {
          setError(response.message || 'Failed to fetch practice problems');
        }
      } catch (err: any) {
        console.error("usePracticeProblems error:", err);
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  };

  return { problems, loading, error, refetch };
}

// Hook for user progress
export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getUserProgress();
      
      if (response.success) {
        setProgress(response.data);
      } else {
        setError('Failed to fetch progress');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const updateProgress = async (lessonId: number, status: UserProgress['status'], completionPercentage: number) => {
    try {
      const response = await apiClient.updateUserProgress({
        lessonId,
        status,
        completionPercentage
      });

      if (response.success) {
        // Update local state
        setProgress(prev => {
          const existing = prev.find(p => p.lesson_id === lessonId);
          if (existing) {
            return prev.map(p => 
              p.lesson_id === lessonId 
                ? { ...p, status, completion_percentage: completionPercentage }
                : p
            );
          } else {
            return [...prev, response.data];
          }
        });
        return response.data;
      } else {
        throw new Error('Failed to update progress');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
      throw err;
    }
  };

  const refetch = async () => {
    await fetchProgress();
  };

  return { progress, loading, error, updateProgress, refetch };
}

// Hook for submitting practice attempts
export function usePracticeAttempt() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAttempt = async (practiceId: number, userAnswer: string, timeTaken: number) => {
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await apiClient.submitPracticeAttempt({
        practiceId,
        userAnswer,
        timeTaken
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to submit attempt');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit attempt';
      setError(errorMessage);
      // Don't re-throw the error, just return null to indicate failure
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitAttempt, submitting, error };
}