require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { body, param, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 120, // Limit each IP to 120 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/api/', apiLimiter);
app.use('/api/auth/signin', authLimiter);
app.use('/api/auth/signup', authLimiter);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Webculus API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/*',
      lessons: '/api/lessons',
      practice: '/api/practice/*',
      user: '/api/user/*',
      dashboard: '/api/user/dashboard-stats'
    },
    docs: 'https://github.com/hsbu/TubesPAWM1-II3140'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Supabase Clients
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

if (!supabaseUrl || !supabaseKey || !supabaseServiceKey) {
  console.error("Supabase environment variables are missing!");
  console.error("Make sure SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are in your .env file.");
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error("JWT_SECRET is missing!");
  console.error("Make sure JWT_SECRET is in your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Handling validation errors from express-validator
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Authenticate users via Supabase JWT
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication token is required.' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { data: userProfile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('user_id', decoded.userId)
      .single();
    
    if (error || !userProfile) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }
    
    req.user = {
      id: userProfile.user_id,
      email: userProfile.email,
      user_metadata: {
        name: userProfile.name
      }
    };
    
    return next();
  } catch (jwtError) {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
    
    req.user = user;
    return next();
  }
};

// Finds a user profile
const findOrCreateUserProfile = async (req) => {
  if (req.user.id) {
    const { data: profileById } = await supabaseAdmin
      .from('users')
      .select('user_id, name, email')
      .eq('user_id', req.user.id)
      .single();
    
    if (profileById) return profileById;
  }
  
  let { data: userProfile } = await supabase
    .from('users')
    .select('user_id, name, email')
    .eq('auth_user_id', req.user.id)
    .single();
  
  if (userProfile) return userProfile;

  const { data: profileByEmail } = await supabaseAdmin
    .from('users')
    .select('user_id, name, email, auth_user_id')
    .eq('email', req.user.email)
    .single();
  
  if (profileByEmail) {
    if (!profileByEmail.auth_user_id || profileByEmail.auth_user_id !== req.user.id) {
      const { data: updatedProfile, error } = await supabaseAdmin
        .from('users')
        .update({ auth_user_id: req.user.id })
        .eq('user_id', profileByEmail.user_id)
        .select('user_id, name, email')
        .single();
      
      if (error) {
        console.error('Failed to link user profile:', error);
        throw new Error('Failed to link user profile.');
      }
      return updatedProfile;
    }
    return {
      user_id: profileByEmail.user_id,
      name: profileByEmail.name,
      email: profileByEmail.email
    };
  }

  const { data: newProfile, error: createError } = await supabaseAdmin
    .from('users')
    .insert({
      auth_user_id: req.user.id,
      email: req.user.email,
      name: req.user.user_metadata?.name || req.user.email.split('@')[0],
      is_active: true
    })
    .select('user_id, name, email')
    .single();

  if (createError) {
    console.error('Failed to create user profile:', createError);
    if (createError.code === '23505') {
      console.log('Profile already exists (race condition), fetching with admin client...');
      const { data: existingProfile } = await supabaseAdmin
        .from('users')
        .select('user_id, name, email')
        .eq('email', req.user.email)
        .single();
      
      if (existingProfile) {
        const { data: linkedProfile } = await supabaseAdmin
          .from('users')
          .update({ auth_user_id: req.user.id })
          .eq('user_id', existingProfile.user_id)
          .select('user_id, name, email')
          .single();
        
        return linkedProfile || existingProfile;
      }
    }
    throw new Error(`Failed to create user profile: ${createError.message}`);
  }
  return newProfile;
};

// Api Routes

// Health check
app.get('/api/health', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { error } = await supabase
      .from('lessons')
      .select('lesson_id')
      .limit(1);
    
    if (error) throw error;
    
    const responseTime = Date.now() - startTime;
    
    res.json({ 
      success: true, 
      message: 'API is running',
      status: 'healthy',
      database: 'connected',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Service unavailable',
      status: 'unhealthy',
      database: 'disconnected',
      responseTime: `${responseTime}ms`,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Auth Routes
app.post('/api/auth/signup', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: { data: { name } } 
    });
    
    if (authError) return res.status(400).json({ success: false, message: authError.message });
    if (!authData.user) return res.status(400).json({ success: false, message: "Signup failed, please try again." });

    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        email,
        name,
        is_active: true
      });
    
    if (profileError && profileError.code !== '23505') {
      return res.status(500).json({ 
        success: false, 
        message: `Signup successful but failed to create profile: ${profileError.message}` 
      });
    }
    
    res.status(201).json({ 
      success: true, 
      message: 'Signup successful. Please check your email to verify your account.', 
      data: authData 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/auth/signin', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, message: 'Signin successful', data });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Google OAuth endpoint for NextAuth
app.post('/api/auth/google', [
  body('email').isEmail().normalizeEmail(),
  body('name').notEmpty(),
], handleValidationErrors, async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    let user;
    if (fetchError && fetchError.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert([
          {
            email,
            name,
            google_id: googleId,
            is_active: true,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ success: false, message: 'Failed to create user' });
      }
      user = newUser;
    } else if (fetchError) {
      console.error('Error fetching user:', fetchError);
      return res.status(500).json({ success: false, message: 'Database error' });
    } else {
      if (!existingUser.google_id && googleId) {
        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from('users')
          .update({ google_id: googleId })
          .eq('user_id', existingUser.user_id)
          .select()
          .single();
        
        if (updateError) {
          console.error('Error updating user:', updateError);
          user = existingUser;
        } else {
          user = updatedUser;
        }
      } else {
        user = existingUser;
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      success: true, 
      message: 'Google authentication successful',
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/me', authenticateUser, async (req, res) => {
  try {
    const userProfile = await findOrCreateUserProfile(req);
    res.json({ 
      success: true, 
      data: { 
        id: userProfile.user_id, 
        name: userProfile.name, 
        email: userProfile.email 
      } 
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// User Settings Routes
app.put('/api/user/profile', authenticateUser, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email format'),
], handleValidationErrors, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userProfile = await findOrCreateUserProfile(req);
    
    if (!name && !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'No updates provided' 
      });
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    
    // Update in database
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('user_id', userProfile.user_id)
      .select('user_id, name, email')
      .single();
    
    if (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      data 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/user/change-password', authenticateUser, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], handleValidationErrors, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: req.user.email,
      password: currentPassword
    });
    
    if (signInError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }
    
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      req.user.id,
      { password: newPassword }
    );
    
    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(500).json({ 
        success: false, 
        message: updateError.message 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/user/account', authenticateUser, [
  body('password').notEmpty().withMessage('Password is required to delete account'),
], handleValidationErrors, async (req, res) => {
  try {
    const { password } = req.body;
    const userProfile = await findOrCreateUserProfile(req);
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: req.user.email,
      password: password
    });
    
    if (signInError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is incorrect' 
      });
    }
    
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ is_active: false })
      .eq('user_id', userProfile.user_id);
    
    if (updateError) {
      console.error('Deactivate account error:', updateError);
      return res.status(500).json({ 
        success: false, 
        message: updateError.message 
      });
    }
    
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(req.user.id);
    
    if (deleteAuthError) {
      console.error('Delete auth user error:', deleteAuthError);
    }
    
    res.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dashboard Stats Routes
app.get('/api/dashboard/stats', authenticateUser, async (req, res) => {
  try {
    const userProfile = await findOrCreateUserProfile(req);
    const userId = userProfile.user_id;

    // Get total lessons count
    const { count: totalLessons } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true });

    // Get completed lessons count
    const { count: completedLessons } = await supabase
      .from('user_lesson_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    // Get total problems solved (attempts)
    const { count: totalProblems } = await supabase
      .from('practice_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Calculate accuracy
    const { data: correctAttempts } = await supabase
      .from('practice_attempts')
      .select('is_correct', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_correct', true);
    
    const accuracy = totalProblems > 0 
      ? Math.round((correctAttempts?.length || 0) / totalProblems * 100) 
      : 0;

    // Calculate streak
    const { data: recentAttempts } = await supabase
      .from('practice_attempts')
      .select('attempted_at')
      .eq('user_id', userId)
      .order('attempted_at', { ascending: false })
      .limit(30);

    let streak = 0;
    if (recentAttempts && recentAttempts.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const attemptDates = new Set(
        recentAttempts.map(a => {
          const date = new Date(a.attempted_at);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        })
      );

      let currentDate = today.getTime();
      while (attemptDates.has(currentDate)) {
        streak++;
        currentDate -= 24 * 60 * 60 * 1000; // Go back 1 day
      }
    }

    // Get lesson progress
    const { data: lessonProgress } = await supabase
      .from('user_lesson_progress')
      .select(`
        lesson_id,
        completion_percentage,
        lessons!lesson_id (
          title
        )
      `)
      .eq('user_id', userId);

    const formattedLessonProgress = (lessonProgress || []).map(lp => ({
      name: lp.lessons?.title || 'Unknown',
      completed: lp.completion_percentage || 0
    }));

    // Get weekly accuracy
    const weeklyAccuracy = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const { data: dayAttempts } = await supabase
        .from('practice_attempts')
        .select('is_correct')
        .eq('user_id', userId)
        .gte('attempted_at', date.toISOString())
        .lt('attempted_at', nextDay.toISOString());

      const dayAccuracy = dayAttempts && dayAttempts.length > 0
        ? Math.round(dayAttempts.filter(a => a.is_correct).length / dayAttempts.length * 100)
        : 0;

      weeklyAccuracy.push({
        day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        accuracy: dayAccuracy
      });
    }

    const { data: recentActivityData } = await supabase
      .from('practice_attempts')
      .select(`
        attempt_id,
        is_correct,
        attempted_at,
        practice_problems!inner (
          topic,
          lessons!inner (
            title
          )
        )
      `)
      .eq('user_id', userProfile.user_id)
      .order('attempted_at', { ascending: false })
      .limit(10);

    const recentActivity = (recentActivityData || []).map(activity => ({
      lesson: activity.practice_problems?.lessons?.title || 'Unknown',
      topic: activity.practice_problems?.topic || 'Unknown',
      score: activity.is_correct ? 'Correct' : 'Incorrect',
      status: 'Completed',
      attempted_at: activity.attempted_at
    }));

    res.json({
      success: true,
      data: {
        stats: {
          completedLessons: completedLessons || 0,
          totalLessons: totalLessons || 0,
          totalProblems: totalProblems || 0,
          accuracy,
          streak
        },
        lessonProgress: formattedLessonProgress,
        weeklyAccuracy,
        recentActivity: recentActivity
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Lessons Routes
app.get('/api/lessons', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('lesson_id, title, created_at')
      .order('lesson_id');
    
    if (error) return res.status(500).json({ success: false, message: error.message });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/lessons/:slug', [
  param('slug')
    .trim()
    .notEmpty()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid slug format')
], handleValidationErrors, async (req, res) => {
  try {
    res.status(404).json({ 
      success: false, 
      message: 'This endpoint is not available. Lessons are loaded from static files.' 
    });
  } catch (error) {
    console.error('Get lesson by slug error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Practice Problems Routes
app.get('/api/practice/:lessonId', authenticateUser, [
  param('lessonId')
    .isInt({ min: 1 })
    .withMessage('Lesson ID must be a positive integer')
], handleValidationErrors, async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const { data, error } = await supabase
      .from('practice_problems')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order_index');
    
    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get practice problems error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Get user's previous attempts for a specific lesson
app.get('/api/practice/attempts/:lessonId', authenticateUser, async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (isNaN(parseInt(lessonId, 10))) {
      return res.status(400).json({ success: false, message: 'Invalid lesson ID.' });
    }
    
    const userProfile = await findOrCreateUserProfile(req);
    
    // Get all correct answers
    const { data, error } = await supabase
      .from('practice_attempts')
      .select(`
        practice_id,
        is_correct,
        user_answer,
        attempted_at,
        practice_problems!inner (
          practice_id,
          lesson_id,
          question,
          correct_answer
        )
      `)
      .eq('user_id', userProfile.user_id)
      .eq('practice_problems.lesson_id', lessonId)
      .order('attempted_at', { ascending: false });
    
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    
    // Get correct answers
    const uniqueAttempts = new Map();
    (data || []).forEach(attempt => {
      if (!uniqueAttempts.has(attempt.practice_id)) {
        uniqueAttempts.set(attempt.practice_id, {
          practice_id: attempt.practice_id,
          is_correct: attempt.is_correct,
          user_answer: attempt.user_answer,
          correct_answer: attempt.practice_problems?.correct_answer,
          attempted_at: attempt.attempted_at
        });
      }
    });
    
    res.json({ 
      success: true, 
      data: Array.from(uniqueAttempts.values())
    });
  } catch (error) {
    console.error('Get practice attempts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Practice Attempts Routes
app.post('/api/practice/attempt', authenticateUser, [
  body('practiceId').isInt(),
  body('userAnswer').notEmpty(),
  body('timeTaken').isInt({ min: 0 }),
], handleValidationErrors, async (req, res) => {
  try {
    const { practiceId, userAnswer, timeTaken } = req.body;
    const userProfile = await findOrCreateUserProfile(req);

    const { data: problem, error: problemError } = await supabase
      .from('practice_problems')
      .select('correct_answer')
      .eq('practice_id', practiceId)
      .single();
    
    if (problemError || !problem) {
      return res.status(404).json({ success: false, message: 'Practice problem not found.' });
    }

    const isCorrect = (problem.correct_answer === userAnswer);
    const { data: attempt, error: attemptError } = await supabase
      .from('practice_attempts')
      .insert({
        user_id: userProfile.user_id,
        practice_id: practiceId,
        user_answer: userAnswer,
        is_correct: isCorrect,
        time_taken: timeTaken,
      })
      .select()
      .single();

    if (attemptError) throw new Error(attemptError.message);
    
    res.status(201).json({ 
      success: true, 
      data: { ...attempt, correct_answer: problem.correct_answer } 
    });
  } catch (error) {
    console.error('Practice attempt error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// User Progress Routes
app.get('/api/user/progress', authenticateUser, async (req, res) => {
  try {
    const userProfile = await findOrCreateUserProfile(req);
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select(`
        *,
        lessons!lesson_id (
          title
        )
      `)
      .eq('user_id', userProfile.user_id);
    
    if (error) throw new Error(error.message);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/user/progress', authenticateUser, [
  body('lessonId').isInt(),
  body('status').isIn(['not_started', 'in_progress', 'completed']),
  body('completionPercentage').isFloat({ min: 0, max: 100 }),
], handleValidationErrors, async (req, res) => {
  try {
    const { lessonId, status, completionPercentage } = req.body;
    const userProfile = await findOrCreateUserProfile(req);

    const progressData = {
      user_id: userProfile.user_id,
      lesson_id: lessonId,
      status,
      completion_percentage: completionPercentage,
      last_accessed: new Date().toISOString(),
    };
    
    if (status === 'completed' && completionPercentage === 100) {
      progressData.completed_at = new Date().toISOString();
    }
    if (status === 'in_progress') {
      progressData.started_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('user_lesson_progress')
      .upsert(progressData, { onConflict: 'user_id,lesson_id' })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Update user progress error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Calculus Academy API running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  });
}

module.exports = app;