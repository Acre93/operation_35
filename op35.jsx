import React, { useState, useEffect } from 'react';

const getCurrentDate = () => new Date().toISOString().split('T')[0];

// Metabolic Efficiency Calculator Component
const MetabolicEfficiency = ({ dailyMetrics, profile }) => {
  const calculateMetabolicScore = () => {
    const recentDays = Object.keys(dailyMetrics || {})
      .filter(date => new Date(date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .sort();
    
    if (recentDays.length === 0) {
      return { 
        score: 50, 
        factors: {
          sleep: { score: 50, impact: 'high' },
          nutrition: { score: 50, impact: 'high' },
          protein: { score: 50, impact: 'medium' },
          activity: { score: 50, impact: 'medium' }
        }, 
        recommendations: ['Start logging daily metrics to get personalized recommendations'],
        avgData: { sleepHours: 7, calories: 2000, protein: 100, steps: 5000 }
      };
    }
    
    const avgData = recentDays.reduce((acc, date) => {
      const day = dailyMetrics[date] || {};
      return {
        sleepHours: acc.sleepHours + (parseFloat(day.sleepHours) || 7),
        calories: acc.calories + (parseFloat(day.calories) || 2000),
        protein: acc.protein + (parseFloat(day.protein) || 100),
        steps: acc.steps + (parseFloat(day.steps) || 5000)
      };
    }, { sleepHours: 0, calories: 0, protein: 0, steps: 0 });
    
    Object.keys(avgData).forEach(key => {
      avgData[key] = avgData[key] / recentDays.length;
    });
    
    const factors = {};
    
    const sleepScore = Math.min(100, Math.max(0, avgData.sleepHours >= 8 ? 100 : avgData.sleepHours * 12.5));
    factors.sleep = { score: sleepScore, impact: 'high' };
    
    const targetCalories = 2000;
    const calorieDeficit = targetCalories - avgData.calories;
    const calorieScore = Math.min(100, Math.max(0, calorieDeficit > 0 && calorieDeficit <= 500 ? 100 : 70));
    factors.nutrition = { score: calorieScore, impact: 'high' };
    
    const proteinScore = Math.min(100, (avgData.protein / 150) * 100);
    factors.protein = { score: proteinScore, impact: 'medium' };
    
    const activityScore = Math.min(100, (avgData.steps / 10000) * 100);
    factors.activity = { score: activityScore, impact: 'medium' };
    
    const overallScore = Math.round(
      factors.sleep.score * 0.3 +
      factors.nutrition.score * 0.3 +
      factors.protein.score * 0.2 +
      factors.activity.score * 0.2
    );
    
    const recommendations = [];
    if (factors.sleep.score < 70) recommendations.push("🛏️ Prioritize 8+ hours quality sleep");
    if (factors.nutrition.score < 70) recommendations.push("🍎 Optimize caloric deficit (300-500 cal)");
    if (factors.protein.score < 70) recommendations.push("🥩 Increase protein intake");
    if (factors.activity.score < 70) recommendations.push("🚶 Aim for 10,000+ steps daily");
    
    return { score: overallScore, factors, recommendations, avgData };
  };
  
  const { score, factors, recommendations, avgData } = calculateMetabolicScore();
  
  const getScoreColor = (score) => {
    if (score >= 85) return '#28a745';
    if (score >= 70) return '#ffc107';
    if (score >= 55) return '#fd7e14';
    return '#dc3545';
  };
  
  const getScoreText = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Fair';
    return 'Needs Attention';
  };
  
  return (
    <div style={{ 
      background: 'white', 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '20px',
      marginBottom: '20px'
    }}>
      <h3>⚡ Metabolic Efficiency Score</h3>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '20px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          color: getScoreColor(score),
          marginRight: '20px'
        }}>
          {score}
        </div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
            {getScoreText(score)} Metabolic Health
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Based on 7-day average of key metabolic factors
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>🔍 Factor Analysis</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {Object.entries(factors).map(([key, data]) => (
            <div key={key} style={{ 
              padding: '10px', 
              border: '1px solid #eee', 
              borderRadius: '4px',
              background: data.score >= 70 ? '#d4edda' : data.score >= 55 ? '#fff3cd' : '#f8d7da'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{key}</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{Math.round(data.score)}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Impact: {data.impact}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>📊 7-Day Averages</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '14px' }}>
          <div><strong>Sleep:</strong> {avgData.sleepHours ? avgData.sleepHours.toFixed(1) : '0'}h</div>
          <div><strong>Calories:</strong> {Math.round(avgData.calories || 0)}</div>
          <div><strong>Protein:</strong> {Math.round(avgData.protein || 0)}g</div>
          <div><strong>Steps:</strong> {Math.round(avgData.steps || 0).toLocaleString()}</div>
        </div>
      </div>
      
      {recommendations.length > 0 && (
        <div>
          <h4>💡 Recommendations</h4>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            {recommendations.map((rec, idx) => (
              <li key={idx} style={{ marginBottom: '5px' }}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Progress Chart Component
const ProgressChart = ({ dailyMetrics, profile }) => {
  const actualData = Object.keys(dailyMetrics || {})
    .filter(date => dailyMetrics[date] && dailyMetrics[date].weight)
    .map(date => ({
      date,
      weight: parseFloat(dailyMetrics[date].weight)
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
      <h3>📈 Weight Progress</h3>
      <div style={{ marginBottom: '15px', fontSize: '14px' }}>
        <p><strong>Data Points Logged:</strong> {actualData.length}</p>
        {actualData.length > 0 && (
          <p><strong>Latest Weight:</strong> {actualData[actualData.length - 1].weight} kg</p>
        )}
      </div>
      
      <div style={{ 
        width: '100%', 
        height: '200px', 
        border: '1px solid #f0f0f0',
        background: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>Progress Visualization</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {actualData.length === 0 ? 
              'Start logging weight data to see your progress' :
              `Tracking ${actualData.length} data points`
            }
          </div>
        </div>
      </div>
    </div>
  );
};

// Compliance Ring Component
const ComplianceRing = ({ label, value }) => {
  const radius = 40;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div style={{ textAlign: 'center' }}>
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#e6e6e6"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#007bff"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="12" fill="#333">
          {Math.round(value)}%
        </text>
      </svg>
      <p style={{ fontSize: '12px', margin: '5px 0' }}>{label}</p>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ dailyMetrics, profile, workouts }) => {
  const today = getCurrentDate();
  const todayMetrics = dailyMetrics[today] || {};

  const cardStyle = {
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    margin: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  return (
    <div>
      <h2>📊 Dashboard</h2>
      
      <MetabolicEfficiency dailyMetrics={dailyMetrics} profile={profile} />
      
      <ProgressChart dailyMetrics={dailyMetrics} profile={profile} />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={cardStyle}>
          <h3>🎯 Current Progress</h3>
          <div style={{ fontSize: '14px' }}>
            <p><strong>Target Weight:</strong> 95 kg</p>
            <p><strong>Target Body Fat:</strong> 15%</p>
            <p><strong>Target LBM:</strong> 95 kg</p>
          </div>
        </div>

        <div style={cardStyle}>
          <h3>📋 Today's Metrics</h3>
          <div style={{ fontSize: '14px' }}>
            <p><strong>Weight:</strong> {todayMetrics.weight || 'Not logged'}</p>
            <p><strong>Sleep:</strong> {todayMetrics.sleepHours ? `${todayMetrics.sleepHours}h` : 'Not logged'}</p>
            <p><strong>Steps:</strong> {todayMetrics.steps || 'Not logged'}</p>
            <p><strong>Calories:</strong> {todayMetrics.calories || 'Not logged'}</p>
          </div>
        </div>

        <div style={cardStyle}>
          <h3>🎯 Compliance Score</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <ComplianceRing label="Sleep" value={todayMetrics.sleepHours >= 8 ? 100 : (todayMetrics.sleepHours || 0) * 12.5} />
            <ComplianceRing label="Nutrition" value={todayMetrics.calories ? 100 : 0} />
            <ComplianceRing label="Movement" value={todayMetrics.steps >= 10000 ? 100 : Math.min(100, (todayMetrics.steps || 0) / 100)} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Daily Check-in Component
const DailyCheckin = ({ dailyMetrics, setDailyMetrics }) => {
  const today = getCurrentDate();
  const [todayData, setTodayData] = useState(() => {
    return dailyMetrics[today] || {};
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (dailyMetrics[today] && dailyMetrics[today].submittedAt) {
      setIsSubmitted(true);
    }
  }, [dailyMetrics, today]);

  const handleInputChange = (field, value) => {
    setTodayData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setIsSaving(true);
    
    const submissionData = {
      ...todayData,
      submittedAt: new Date().toISOString(),
      date: today
    };
    
    setDailyMetrics(prev => ({ 
      ...prev, 
      [today]: submissionData 
    }));
    
    setIsSubmitted(true);
    
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  const handleEdit = () => {
    setIsSubmitted(false);
  };

  const calculateCompleteness = () => {
    const requiredFields = ['weight', 'sleepHours', 'calories', 'steps'];
    const filledRequired = requiredFields.filter(field => todayData[field] && todayData[field] !== '').length;
    return Math.round((filledRequired / requiredFields.length) * 100);
  };

  const completeness = calculateCompleteness();
  const canSubmit = completeness >= 75;

  const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: isSubmitted ? '#f8f9fa' : 'white'
  };

  const sectionStyle = {
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px'
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📝 Daily Check-in - {new Date(today).toLocaleDateString()}</h2>
        {isSubmitted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>✅ Submitted</span>
            <button 
              onClick={handleEdit}
              style={{ 
                padding: '5px 10px', 
                background: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Edit
            </button>
          </div>
        )}
      </div>

      <div style={{ 
        background: '#f8f9fa', 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        padding: '15px', 
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <strong>Completion: {completeness}%</strong>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Required: Weight, Sleep Hours, Calories, Steps
          </div>
        </div>
        <div style={{ width: '100px', background: '#e9ecef', borderRadius: '10px', height: '10px' }}>
          <div 
            style={{ 
              width: `${completeness}%`, 
              background: completeness >= 75 ? '#28a745' : completeness >= 50 ? '#ffc107' : '#dc3545', 
              height: '10px', 
              borderRadius: '10px'
            }}
          />
        </div>
      </div>
      
      <div style={sectionStyle}>
        <h3>🌅 Daily Metrics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label>Current Weight (kg) *</label>
            <input
              type="number"
              step="0.1"
              style={inputStyle}
              value={todayData.weight || ''}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              disabled={isSubmitted}
            />
          </div>
          <div>
            <label>Sleep Hours *</label>
            <input
              type="number"
              step="0.5"
              style={inputStyle}
              value={todayData.sleepHours || ''}
              onChange={(e) => handleInputChange('sleepHours', e.target.value)}
              disabled={isSubmitted}
            />
          </div>
          <div>
            <label>Calories *</label>
            <input
              type="number"
              style={inputStyle}
              value={todayData.calories || ''}
              onChange={(e) => handleInputChange('calories', e.target.value)}
              disabled={isSubmitted}
            />
          </div>
          <div>
            <label>Steps *</label>
            <input
              type="number"
              style={inputStyle}
              value={todayData.steps || ''}
              onChange={(e) => handleInputChange('steps', e.target.value)}
              disabled={isSubmitted}
            />
          </div>
          <div>
            <label>Protein (g)</label>
            <input
              type="number"
              style={inputStyle}
              value={todayData.protein || ''}
              onChange={(e) => handleInputChange('protein', e.target.value)}
              disabled={isSubmitted}
            />
          </div>
          <div>
            <label>Flow Score (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              style={inputStyle}
              value={todayData.flowScore || ''}
              onChange={(e) => handleInputChange('flowScore', e.target.value)}
              disabled={isSubmitted}
            />
          </div>
        </div>
      </div>

      {!isSubmitted && (
        <div style={{ 
          background: 'white', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '20px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <button 
            onClick={handleSubmit}
            disabled={isSaving || !canSubmit}
            style={{ 
              padding: '15px 30px', 
              background: canSubmit ? '#28a745' : '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold',
              minWidth: '200px'
            }}
          >
            {isSaving ? '💾 Saving...' : `📊 Submit (${completeness}%)`}
          </button>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            {!canSubmit ? 
              'Fill in at least 3 of the 4 required fields to submit' :
              'Ready to submit! This will update your dashboard.'
            }
          </div>
        </div>
      )}

      {isSubmitted && (
        <div style={{ 
          background: '#d4edda', 
          border: '1px solid #c3e6cb', 
          borderRadius: '8px', 
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h4 style={{ color: '#155724', margin: '0 0 10px 0' }}>✅ Daily Check-in Submitted!</h4>
          <p style={{ margin: '0', color: '#155724', fontSize: '14px' }}>
            Your data has been saved and will update your metabolic efficiency score.
          </p>
        </div>
      )}
    </div>
  );
};

// Workout Tracker Component
const WorkoutTracker = () => {
  const [workouts, setWorkouts] = useState(() => {
    const saved = localStorage.getItem('op35-workouts');
    return saved ? JSON.parse(saved) : {
      exercises: {
        deadlift: { current1RM: 100, sets: [], target: 190, lastWorked: null },
        squat: { current1RM: 80, sets: [], target: 150, lastWorked: null },
        bench: { current1RM: 70, sets: [], target: 120, lastWorked: null },
        pullup: { current1RM: 0, sets: [], target: 25, lastWorked: null },
        row: { current1RM: 60, sets: [], target: 100, lastWorked: null },
        ohp: { current1RM: 50, sets: [], target: 80, lastWorked: null }
      },
      weeklyPlan: {},
      completedWorkouts: {}
    };
  });
  
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());

  useEffect(() => {
    localStorage.setItem('op35-workouts', JSON.stringify(workouts));
  }, [workouts]);

  const generateWeeklyPlan = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    
    const weekKey = startOfWeek.toISOString().split('T')[0];
    
    if (workouts.weeklyPlan && workouts.weeklyPlan[weekKey]) {
      return workouts.weeklyPlan[weekKey];
    }

    const plan = {
      monday: {
        name: "Push Power",
        type: "strength",
        exercises: [
          { name: 'bench', sets: 5, reps: 3, intensity: 0.87 },
          { name: 'ohp', sets: 4, reps: 5, intensity: 0.82 },
          { name: 'accessory', sets: 3, reps: 8, description: 'Dips' }
        ],
        estimatedTime: 45
      },
      tuesday: {
        name: "Pull Power",
        type: "strength", 
        exercises: [
          { name: 'deadlift', sets: 5, reps: 3, intensity: 0.87 },
          { name: 'pullup', sets: 4, reps: 5, intensity: 0.8 },
          { name: 'row', sets: 4, reps: 5, intensity: 0.82 }
        ],
        estimatedTime: 50
      },
      wednesday: {
        name: "Active Recovery",
        type: "recovery",
        exercises: [
          { name: 'walk', duration: 30, description: 'Light walking' },
          { name: 'mobility', duration: 15, description: 'Stretching' }
        ],
        estimatedTime: 45
      },
      thursday: {
        name: "Legs Power", 
        type: "strength",
        exercises: [
          { name: 'squat', sets: 5, reps: 3, intensity: 0.87 },
          { name: 'deadlift', sets: 3, reps: 5, intensity: 0.8, variant: 'stiff-leg' },
          { name: 'accessory', sets: 3, reps: 10, description: 'Lunges' }
        ],
        estimatedTime: 55
      },
      friday: {
        name: "Push Volume",
        type: "hypertrophy",
        exercises: [
          { name: 'bench', sets: 4, reps: 8, intensity: 0.75 },
          { name: 'ohp', sets: 4, reps: 8, intensity: 0.75 },
          { name: 'accessory', sets: 3, reps: 12, description: 'Tricep work' }
        ],
        estimatedTime: 40
      },
      saturday: {
        name: "Pull Volume",
        type: "hypertrophy",
        exercises: [
          { name: 'row', sets: 4, reps: 8, intensity: 0.75 },
          { name: 'pullup', sets: 4, reps: 8, intensity: 0.75 },
          { name: 'accessory', sets: 3, reps: 12, description: 'Bicep work' }
        ],
        estimatedTime: 40
      },
      sunday: {
        name: "Rest Day",
        type: "rest",
        exercises: [],
        estimatedTime: 0
      }
    };

    const newWeeklyPlan = { ...workouts.weeklyPlan, [weekKey]: plan };
    setWorkouts(prev => ({ ...prev, weeklyPlan: newWeeklyPlan }));
    
    return plan;
  };

  const currentWeekPlan = generateWeeklyPlan();

  const getWeeklySummary = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }

    const completedDays = weekDates.filter(date => 
      workouts.completedWorkouts && workouts.completedWorkouts[date]
    ).length;

    const totalSets = weekDates.reduce((total, date) => {
      const workout = workouts.completedWorkouts && workouts.completedWorkouts[date];
      return total + (workout ? (workout.totalSets || 0) : 0);
    }, 0);

    return {
      completedDays,
      totalDays: 5,
      totalSets
    };
  };

  const logSet = (exerciseName, reps, weight) => {
    if (!exerciseName || !reps || !weight) return;
    
    const newSet = {
      date: selectedDate,
      reps: parseInt(reps),
      weight: parseFloat(weight),
      timestamp: new Date().toISOString()
    };

    setWorkouts(prev => {
      const updated = { ...prev };
      if (!updated.exercises[exerciseName]) {
        updated.exercises[exerciseName] = { current1RM: 0, sets: [], target: 100, lastWorked: null };
      }
      if (!updated.exercises[exerciseName].sets) {
        updated.exercises[exerciseName].sets = [];
      }
      
      updated.exercises[exerciseName].sets.push(newSet);

      const estimated1RM = parseFloat(weight) * (1 + parseInt(reps) / 30);
      if (estimated1RM > (updated.exercises[exerciseName].current1RM || 0)) {
        updated.exercises[exerciseName].current1RM = Math.round(estimated1RM);
      }

      updated.exercises[exerciseName].lastWorked = selectedDate;
      return updated;
    });
  };

  const completeWorkout = (dayName) => {
    const workout = currentWeekPlan && currentWeekPlan[dayName];
    if (!workout) return;

    const completedWorkout = {
      name: workout.name,
      type: workout.type,
      completedAt: new Date().toISOString(),
      totalSets: workout.exercises ? workout.exercises.reduce((total, ex) => total + (ex.sets || 0), 0) : 0
    };

    setWorkouts(prev => ({
      ...prev,
      completedWorkouts: {
        ...prev.completedWorkouts,
        [selectedDate]: completedWorkout
      }
    }));
  };

  const summary = getWeeklySummary();
  const selectedDayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todaysWorkout = currentWeekPlan && currentWeekPlan[selectedDayName];
  const isCompleted = workouts.completedWorkouts && workouts.completedWorkouts[selectedDate];

  const sectionStyle = {
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px'
  };

  const exerciseCardStyle = {
    border: '1px solid #eee',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '10px',
    background: '#f8f9fa'
  };

  return (
    <div>
      <h2>💪 Workout Tracker</h2>
      
      <div style={sectionStyle}>
        <h3>📊 This Week's Training</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {summary.completedDays}/{summary.totalDays} workouts
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
            <span><strong>{summary.totalSets}</strong> sets</span>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '15px' }}>
          {currentWeekPlan && Object.entries(currentWeekPlan).map(([day, workout]) => {
            const date = new Date();
            const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day);
            date.setDate(date.getDate() - date.getDay() + dayIndex);
            const dateStr = date.toISOString().split('T')[0];
            const isCompleted = workouts.completedWorkouts && workouts.completedWorkouts[dateStr];
            
            return (
              <div
                key={day}
                style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  borderRadius: '6px',
                  background: isCompleted ? '#28a745' : 
                            workout.type === 'rest' ? '#e9ecef' :
                            workout.type === 'recovery' ? '#ffc107' : '#007bff',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedDate(dateStr)}
              >
                <div style={{ fontWeight: 'bold' }}>{day.slice(0, 3)}</div>
                <div>{date.getDate()}</div>
                <div style={{ fontSize: '10px', marginTop: '2px' }}>
                  {isCompleted ? '✓' : workout.type === 'rest' ? '—' : (workout.estimatedTime || 0) + 'min'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={sectionStyle}>
        <h3>🎯 Current Strength Levels</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          {workouts.exercises && Object.entries(workouts.exercises).map(([name, data]) => {
            const progress = ((data.current1RM || 0) / (data.target || 100)) * 100;
            
            return (
              <div key={name} style={{ 
                textAlign: 'center', 
                padding: '15px', 
                background: '#f8f9fa', 
                borderRadius: '6px',
                border: '1px solid #ddd'
              }}>
                <h4 style={{ textTransform: 'capitalize', margin: '0 0 10px 0' }}>{name}</h4>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {data.current1RM || 0} kg
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                  Target: {data.target || 100} kg ({Math.round(progress)}%)
                </div>
                <div style={{ width: '100%', background: '#e9ecef', borderRadius: '10px', height: '6px' }}>
                  <div 
                    style={{ 
                      width: `${Math.min(progress, 100)}%`, 
                      background: progress >= 100 ? '#28a745' : '#007bff', 
                      height: '6px', 
                      borderRadius: '10px' 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={sectionStyle}>
        <h3>📅 Select Workout Date</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ 
            padding: '8px', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            marginRight: '15px'
          }}
        />
        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
          {todaysWorkout ? todaysWorkout.name : 'No workout planned'}
        </span>
      </div>

      {todaysWorkout && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>🏋️ {todaysWorkout.name}</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '12px',
                background: todaysWorkout.type === 'strength' ? '#007bff' : 
                          todaysWorkout.type === 'hypertrophy' ? '#28a745' : '#ffc107',
                color: 'white'
              }}>
                {todaysWorkout.type}
              </span>
              <span style={{ fontSize: '14px', color: '#666' }}>
                ~{todaysWorkout.estimatedTime || 0} min
              </span>
              {!isCompleted && (
                <button
                  onClick={() => completeWorkout(selectedDayName)}
                  style={{
                    padding: '8px 16px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Mark Complete
                </button>
              )}
              {isCompleted && (
                <span style={{ color: '#28a745', fontWeight: 'bold' }}>✅ Completed</span>
              )}
            </div>
          </div>

          {todaysWorkout.type === 'rest' && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>😴</div>
              <h4>Rest Day</h4>
              <p>Take today to recover. Your muscles grow during rest!</p>
            </div>
          )}

          {todaysWorkout.type === 'recovery' && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🚶‍♂️</div>
              <h4>Active Recovery</h4>
              <p>Light movement to promote blood flow and recovery.</p>
              <ul style={{ textAlign: 'left', display: 'inline-block' }}>
                {todaysWorkout.exercises && todaysWorkout.exercises.map((ex, idx) => (
                  <li key={idx}>{ex.description || ex.name}: {ex.duration || 0} minutes</li>
                ))}
              </ul>
            </div>
          )}

          {(todaysWorkout.type === 'strength' || todaysWorkout.type === 'hypertrophy') && todaysWorkout.exercises && (
            <div>
              {todaysWorkout.exercises.map((exercise, idx) => {
                if (exercise.name === 'accessory') {
                  return (
                    <div key={idx} style={exerciseCardStyle}>
                      <h4>Accessory Work - {exercise.sets || 3}×{exercise.reps || 8}</h4>
                      <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>
                        {exercise.description || 'Accessory movement'}
                      </p>
                    </div>
                  );
                }

                const exerciseData = workouts.exercises && workouts.exercises[exercise.name];
                if (!exerciseData) {
                  return (
                    <div key={idx} style={exerciseCardStyle}>
                      <h4 style={{ textTransform: 'capitalize' }}>{exercise.name}</h4>
                      <p style={{ color: '#999' }}>Exercise data not found</p>
                    </div>
                  );
                }

                const workingWeight = Math.round((exerciseData.current1RM || 0) * (exercise.intensity || 0.7));
                
                return (
                  <div key={idx} style={exerciseCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ textTransform: 'capitalize', margin: 0 }}>{exercise.name}</h4>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {Math.round((exercise.intensity || 0.7) * 100)}% of 1RM
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <strong>{exercise.sets || 0} sets × {exercise.reps || 0} reps @ {workingWeight} kg</strong>
                      {exercise.variant && (
                        <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                          ({exercise.variant})
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="Reps"
                        style={{ width: '60px', padding: '4px', border: '1px solid #ddd', borderRadius: '3px' }}
                        id={`reps-${exercise.name}-${idx}`}
                      />
                      <input
                        type="number"
                        placeholder="Weight"
                        defaultValue={workingWeight}
                        style={{ width: '70px', padding: '4px', border: '1px solid #ddd', borderRadius: '3px' }}
                        id={`weight-${exercise.name}-${idx}`}
                      />
                      <button
                        onClick={() => {
                          const repsEl = document.getElementById(`reps-${exercise.name}-${idx}`);
                          const weightEl = document.getElementById(`weight-${exercise.name}-${idx}`);
                          if (repsEl && weightEl) {
                            const reps = repsEl.value;
                            const weight = weightEl.value;
                            if (reps && weight) {
                              logSet(exercise.name, reps, weight);
                              repsEl.value = '';
                            }
                          }
                        }}
                        style={{
                          padding: '4px 12px',
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Log Set
                      </button>
                    </div>

                    <div style={{ marginTop: '10px', fontSize: '12px' }}>
                      {exerciseData.sets && exerciseData.sets.slice(-3).reverse().map((set, setIdx) => (
                        <div key={setIdx} style={{ color: '#666', marginBottom: '2px' }}>
                          {set.reps}×{set.weight}kg ({new Date(set.timestamp).toLocaleDateString()})
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ProfileManager = () => {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('op35-profile');
    return saved ? JSON.parse(saved) : {
      age: 31,
      height: 185,
      startWeight: 115,
      currentWeight: 115,
      targetWeight: 95,
      currentBF: 30,
      targetBF: 15,
      leanBodyMass: 80,
      targetLBM: 95
    };
  });

  useEffect(() => {
    localStorage.setItem('op35-profile', JSON.stringify(profile));
  }, [profile]);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: parseFloat(value) || value }));
  };

  const sectionStyle = {
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  };

  return (
    <div>
      <h2>👤 Profile Manager</h2>
      
      <div style={sectionStyle}>
        <h3>Basic Info</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label>Age</label>
            <input
              type="number"
              style={inputStyle}
              value={profile.age}
              onChange={(e) => handleChange('age', e.target.value)}
            />
          </div>
          <div>
            <label>Height (cm)</label>
            <input
              type="number"
              style={inputStyle}
              value={profile.height}
              onChange={(e) => handleChange('height', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h3>Body Composition</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label>Current Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              style={inputStyle}
              value={profile.currentWeight}
              onChange={(e) => handleChange('currentWeight', e.target.value)}
            />
          </div>
          <div>
            <label>Target Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              style={inputStyle}
              value={profile.targetWeight}
              onChange={(e) => handleChange('targetWeight', e.target.value)}
            />
          </div>
          <div>
            <label>Current Body Fat (%)</label>
            <input
              type="number"
              step="0.1"
              style={inputStyle}
              value={profile.currentBF}
              onChange={(e) => handleChange('currentBF', e.target.value)}
            />
          </div>
          <div>
            <label>Target Body Fat (%)</label>
            <input
              type="number"
              step="0.1"
              style={inputStyle}
              value={profile.targetBF}
              onChange={(e) => handleChange('targetBF', e.target.value)}
            />
          </div>
          <div>
            <label>Lean Body Mass (kg)</label>
            <input
              type="number"
              step="0.1"
              style={inputStyle}
              value={profile.leanBodyMass}
              onChange={(e) => handleChange('leanBodyMass', e.target.value)}
            />
          </div>
          <div>
            <label>Target Lean Body Mass (kg)</label>
            <input
              type="number"
              step="0.1"
              style={inputStyle}
              value={profile.targetLBM}
              onChange={(e) => handleChange('targetLBM', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h3>Progress Summary</h3>
        <div style={{ fontSize: '14px' }}>
          <p><strong>Weight to lose:</strong> {(profile.currentWeight - profile.targetWeight).toFixed(1)} kg</p>
          <p><strong>Body fat to lose:</strong> {(profile.currentBF - profile.targetBF).toFixed(1)}%</p>
          <p><strong>Muscle to gain:</strong> {(profile.targetLBM - profile.leanBodyMass).toFixed(1)} kg</p>
          <p><strong>BMI (current):</strong> {(profile.currentWeight / Math.pow(profile.height / 100, 2)).toFixed(1)}</p>
          <p><strong>BMI (target):</strong> {(profile.targetWeight / Math.pow(profile.height / 100, 2)).toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
};

const ReviewSystem = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>📚 Review System</h2>
    <p>Spaced review system coming soon...</p>
  </div>
);

const SecurityModule = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>🔒 Security Module</h2>
    <p>Security checklist coming soon...</p>
  </div>
);

const Settings = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>⚙️ Settings</h2>
    <p>Settings panel coming soon...</p>
  </div>
);

const Op35Bot = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('op35-profile');
    return saved ? JSON.parse(saved) : {
      age: 31,
      height: 185,
      startWeight: 115,
      currentWeight: 115,
      targetWeight: 95,
      currentBF: 30,
      targetBF: 15,
      leanBodyMass: 80,
      targetLBM: 95
    };
  });

  const [dailyMetrics, setDailyMetrics] = useState(() => {
    const saved = localStorage.getItem('op35-daily-metrics');
    return saved ? JSON.parse(saved) : {};
  });

  const [workouts, setWorkouts] = useState(() => {
    const saved = localStorage.getItem('op35-workouts');
    return saved ? JSON.parse(saved) : {
      exercises: {
        deadlift: { current1RM: 100, sets: [], target: 190 }
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('op35-profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('op35-daily-metrics', JSON.stringify(dailyMetrics));
  }, [dailyMetrics]);

  useEffect(() => {
    localStorage.setItem('op35-workouts', JSON.stringify(workouts));
  }, [workouts]);

  const tabStyle = {
    padding: '10px 20px',
    margin: '0 2px',
    border: '1px solid #ddd',
    background: 'white',
    cursor: 'pointer',
    borderRadius: '5px 5px 0 0'
  };

  const activeTabStyle = {
    ...tabStyle,
    background: '#007bff',
    color: 'white'
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#007bff', marginBottom: '10px' }}>🎯 Operation 35</h1>
        <p style={{ color: '#666', fontSize: '16px' }}>Your Personal Life Optimization Assistant</p>
      </header>

      <nav style={{ marginBottom: '30px', borderBottom: '1px solid #ddd' }}>
        {['dashboard', 'daily-checkin', 'workouts', 'profile', 'reviews', 'security', 'settings'].map(tab => (
          <button
            key={tab}
            style={activeTab === tab ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
          </button>
        ))}
      </nav>

      <main>
        {activeTab === 'dashboard' && <Dashboard dailyMetrics={dailyMetrics} profile={profile} workouts={workouts} />}
        {activeTab === 'daily-checkin' && <DailyCheckin dailyMetrics={dailyMetrics} setDailyMetrics={setDailyMetrics} />}
        {activeTab === 'workouts' && <WorkoutTracker />}
        {activeTab === 'profile' && <ProfileManager />}
        {activeTab === 'reviews' && <ReviewSystem />}
        {activeTab === 'security' && <SecurityModule />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
};

export default Op35Bot;
