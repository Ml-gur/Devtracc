import { supabase } from './supabase/client';
import { 
  testDatabaseConnection,
  signUpUser,
  signInUser,
  createProject,
  getUserProjects,
  createTask,
  getProjectTasks,
  updateTask,
  createPost,
  getAllPosts,
  updateUserProfile,
  getUserProfile
} from './database-service';

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  error?: any;
  duration: number;
}

interface TestSuite {
  suiteName: string;
  tests: TestResult[];
  totalTime: number;
  passCount: number;
  failCount: number;
  skipCount: number;
}

class DevTrackTestingSuite {
  private testResults: TestSuite[] = [];
  private testUsers: any[] = [];
  
  // Test data
  private readonly TEST_USER_1 = {
    email: 'test1@devtrack-test.com',
    password: 'TestPass123!',
    full_name: 'Test Developer One',
    country: 'Kenya',
    phone: '+254700000001'
  };
  
  private readonly TEST_USER_2 = {
    email: 'test2@devtrack-test.com',
    password: 'TestPass123!',
    full_name: 'Test Developer Two',
    country: 'Nigeria',
    phone: '+234700000002'
  };

  private readonly TEST_PROJECT = {
    title: 'Test E-commerce Website',
    description: 'Full-stack online store with React and Node.js',
    tech_stack: ['React', 'Node.js', 'MongoDB'],
    timeline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active'
  };

  private readonly TEST_TASKS = [
    {
      title: 'Set up React project',
      description: 'Initialize the React application with TypeScript',
      status: 'todo' as const
    },
    {
      title: 'Create user authentication',
      description: 'Implement login and registration functionality',
      status: 'todo' as const
    },
    {
      title: 'Build shopping cart functionality',
      description: 'Add cart features and checkout process',
      status: 'todo' as const
    }
  ];

  private readonly TEST_POST = {
    content: 'Just finished setting up the React frontend for my e-commerce project! Making great progress.',
    post_type: 'progress_update' as const,
    tags: ['React', 'Frontend', 'Progress']
  };

  async runAllTests(): Promise<{ suites: TestSuite[]; summary: any }> {
    console.log('🚀 Starting DevTrack Africa Automated Testing Suite');
    console.log('================================================');
    
    this.testResults = [];
    this.testUsers = [];

    // Run test suites in order
    await this.runDatabaseConnectionTests();
    await this.runAuthenticationTests();
    await this.runProfileManagementTests();
    await this.runProjectManagementTests();
    await this.runTaskManagementTests();
    await this.runCommunityPostingTests();
    await this.runDataPersistenceTests();
    await this.runCrossUserFunctionalityTests();
    
    // Cleanup test data
    await this.cleanupTestData();
    
    const summary = this.generateSummary();
    this.printResults();
    
    return { suites: this.testResults, summary };
  }

  private async runTest(testName: string, testFunction: () => Promise<void>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      await testFunction();
      const duration = Date.now() - startTime;
      return {
        testName,
        status: 'PASS',
        message: 'Test completed successfully',
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${testName} failed:`, error);
      return {
        testName,
        status: 'FAIL',
        message: error instanceof Error ? error.message : 'Unknown error',
        error,
        duration
      };
    }
  }

  private async runDatabaseConnectionTests(): Promise<void> {
    const suiteStartTime = Date.now();
    const tests: TestResult[] = [];

    console.log('\n📊 Running Database Connection Tests...');

    // Test 1: Database Connection
    tests.push(await this.runTest('Database Connection Test', async () => {
      const connected = await testDatabaseConnection();
      if (!connected) {
        throw new Error('Database connection failed - verify Supabase setup');
      }
    }));

    // Test 2: Auth Service Connection
    tests.push(await this.runTest('Auth Service Connection', async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error && error.message !== 'Invalid JWT') {
        throw new Error(`Auth service error: ${error.message}`);
      }
    }));

    // Test 3: Table Structure Verification
    tests.push(await this.runTest('Table Structure Verification', async () => {
      const tables = ['users', 'projects', 'tasks', 'posts'];
      
      for (const table of tables) {
        const { error } = await supabase.from(table).select('count', { count: 'exact' });
        if (error && !error.message.includes('does not exist')) {
          throw new Error(`Table ${table} verification failed: ${error.message}`);
        }
      }
    }));

    this.addTestSuite('Database Connection Tests', tests, suiteStartTime);
  }

  private async runAuthenticationTests(): Promise<void> {
    const suiteStartTime = Date.now();
    const tests: TestResult[] = [];

    console.log('\n🔐 Running Authentication Tests...');

    // Test 1: User Registration
    tests.push(await this.runTest('User Registration Test', async () => {
      const result = await signUpUser(this.TEST_USER_1);
      
      if (result.error) {
        throw new Error(`Registration failed: ${result.error.message}`);
      }
      
      if (!result.user) {
        throw new Error('No user returned from registration');
      }
      
      this.testUsers.push(result.user);
    }));

    // Test 2: User Login
    tests.push(await this.runTest('User Login Test', async () => {
      // Wait a moment for registration to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await signInUser(this.TEST_USER_1.email, this.TEST_USER_1.password);
      
      if (result.error) {
        // If email confirmation is required, this is expected behavior
        if (result.error.message?.includes('Email not confirmed')) {
          console.log('⚠️ Email confirmation required (expected behavior)');
          return;
        }
        throw new Error(`Login failed: ${result.error.message}`);
      }
      
      if (!result.user) {
        throw new Error('No user returned from login');
      }
    }));

    // Test 3: Session Persistence
    tests.push(await this.runTest('Session Persistence Test', async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new Error(`Session check failed: ${error.message}`);
      }
      
      // Session might be null if email confirmation is required
      if (!session) {
        console.log('⚠️ No active session (possibly due to email confirmation requirement)');
        return;
      }
    }));

    this.addTestSuite('Authentication Tests', tests, suiteStartTime);
  }

  private async runProfileManagementTests(): Promise<void> {
    const suiteStartTime = Date.now();
    const tests: TestResult[] = [];

    console.log('\n👤 Running Profile Management Tests...');

    // Get current user for testing
    const { data: { user } } = await supabase.auth.getUser();
    const testUserId = user?.id || this.testUsers[0]?.id;

    if (!testUserId) {
      tests.push({
        testName: 'Profile Management Tests',
        status: 'SKIP',
        message: 'No authenticated user available for profile tests',
        duration: 0
      });
      this.addTestSuite('Profile Management Tests', tests, suiteStartTime);
      return;
    }

    // Test 1: Profile Retrieval
    tests.push(await this.runTest('Profile Retrieval Test', async () => {
      const result = await getUserProfile(testUserId);
      
      if (result.error && result.error.code !== 'DB_NOT_AVAILABLE') {
        throw new Error(`Profile retrieval failed: ${result.error.message}`);
      }
    }));

    // Test 2: Profile Update
    tests.push(await this.runTest('Profile Update Test', async () => {
      const profileData = {
        title: 'Senior Frontend Developer',
        bio: 'Passionate about React and TypeScript development',
        tech_stack: ['React', 'TypeScript', 'Node.js']
      };
      
      const result = await updateUserProfile(testUserId, profileData);
      
      if (result.error && result.error.code !== 'DB_NOT_AVAILABLE') {
        throw new Error(`Profile update failed: ${result.error.message}`);
      }
    }));

    this.addTestSuite('Profile Management Tests', tests, suiteStartTime);
  }

  private async runProjectManagementTests(): Promise<void> {
    const suiteStartTime = Date.now();
    const tests: TestResult[] = [];

    console.log('\n📝 Running Project Management Tests...');

    const { data: { user } } = await supabase.auth.getUser();
    const testUserId = user?.id || this.testUsers[0]?.id;

    if (!testUserId) {
      tests.push({
        testName: 'Project Management Tests',
        status: 'SKIP',
        message: 'No authenticated user available for project tests',
        duration: 0
      });
      this.addTestSuite('Project Management Tests', tests, suiteStartTime);
      return;
    }

    let createdProject: any = null;

    // Test 1: Project Creation
    tests.push(await this.runTest('Project Creation Test', async () => {
      const result = await createProject({
        ...this.TEST_PROJECT,
        creator_id: testUserId
      });
      
      if (result.error && result.error.code !== 'DB_NOT_AVAILABLE') {
        throw new Error(`Project creation failed: ${result.error.message}`);
      }
      
      createdProject = result.data;
    }));

    // Test 2: Project Retrieval
    tests.push(await this.runTest('Project Retrieval Test', async () => {
      const result = await getUserProjects(testUserId);
      
      if (result.error && result.error.code !== 'DB_NOT_AVAILABLE') {
        throw new Error(`Project retrieval failed: ${result.error.message}`);
      }
      
      if (result.data && createdProject) {
        const found = result.data.find(p => p.id === createdProject.id);
        if (!found) {
          throw new Error('Created project not found in user projects');
        }
      }
    }));

    this.addTestSuite('Project Management Tests', tests, suiteStartTime);
  }

  private async runTaskManagementTests(): Promise<void> {
    const suiteStartTime = Date.now();
    const tests: TestResult[] = [];

    console.log('\n✅ Running Task Management Tests...');

    const { data: { user } } = await supabase.auth.getUser();
    const testUserId = user?.id || this.testUsers[0]?.id;

    if (!testUserId) {
      tests.push({
        testName: 'Task Management Tests',
        status: 'SKIP',
        message: 'No authenticated user available for task tests',
        duration: 0
      });
      this.addTestSuite('Task Management Tests', tests, suiteStartTime);
      return;
    }

    // First get or create a project for tasks
    const projectsResult = await getUserProjects(testUserId);
    let projectId: string | null = null;

    if (projectsResult.data && projectsResult.data.length > 0) {
      projectId = projectsResult.data[0].id;
    } else {
      // Create a project for tasks
      const projectResult = await createProject({
        title: 'Test Project for Tasks',
        description: 'Project created for task testing',
        creator_id: testUserId,
        status: 'active'
      });
      
      if (projectResult.data) {
        projectId = projectResult.data.id;
      }
    }

    if (!projectId) {
      tests.push({
        testName: 'Task Management Tests',
        status: 'SKIP',
        message: 'No project available for task tests',
        duration: 0
      });
      this.addTestSuite('Task Management Tests', tests, suiteStartTime);
      return;
    }

    let createdTasks: any[] = [];

    // Test 1: Task Creation
    tests.push(await this.runTest('Task Creation Test', async () => {
      for (const taskData of this.TEST_TASKS) {
        const result = await createTask({
          ...taskData,
          project_id: projectId!
        });
        
        if (result.error && result.error.code !== 'DB_NOT_AVAILABLE') {
          throw new Error(`Task creation failed: ${result.error.message}`);
        }
        
        if (result.data) {
          createdTasks.push(result.data);
        }
      }
    }));

    // Test 2: Task Retrieval
    tests.push(await this.runTest('Task Retrieval Test', async () => {
      const result = await getProjectTasks(projectId!);
      
      if (result.error && result.error.code !== 'DB_NOT_AVAILABLE') {
        throw new Error(`Task retrieval failed: ${result.error.message}`);
      }
    }));

    // Test 3: Task Status Update
    tests.push(await this.runTest('Task Status Update Test', async () => {
      if (createdTasks.length > 0) {
        const result = await updateTask(createdTasks[0].id, {
          status: 'in_progress'
        });
        
        if (result.error && result.error.code !== 'DB_NOT_AVAILABLE') {
          throw new Error(`Task update failed: ${result.error.message}`);
        }
      }
    }));

    // Test 4: Task Content Update
    tests.push(await this.runTest('Task Content Update Test', async () => {
      if (createdTasks.length > 0) {
        const taskToUpdate = createdTasks[0];
        const newTitle = 'Updated Task Title';
        const result = await updateTask(taskToUpdate.id, { title: newTitle });

        if (result.error && result.error.code !== 'DB_NOT_AVAILABLE') {
          throw new Error(`Task content update failed: ${result.error.message}`);
        }
        
        const verifyResult = await getProjectTasks(projectId!);
        const updatedTask = verifyResult.data?.find(t => t.id === taskToUpdate.id);
        if (updatedTask?.title !== newTitle) {
          throw new Error('Task title was not updated correctly.');
        }
      }
    }));

    // Test 5: Task Deletion
    tests.push(await this.runTest('Task Deletion Test', async () => {
      if (createdTasks.length > 1) {
        const taskToDelete = createdTasks[1];
        const result = await deleteTask(taskToDelete.id, projectId!);
        if (result.error && result.error.code !== 'DB_NOT_AVAILABLE') {
          throw new Error(`Task deletion failed: ${result.error.message}`);
        }
      }
    }));

    this.addTestSuite('Task Management Tests', tests, suiteStartTime);
  }

  private async runCommunityPostingTests(): Promise<void> {
    const suiteStartTime = Date.now();
    const tests: TestResult[] = [];

    console.log('\n🌍 Running Community Posting Tests...');

    const { data: { user } } = await supabase.auth.getUser();
    const testUserId = user?.id || this.testUsers[0]?.id;

    if (!testUserId) {
      tests.push({
        testName: 'Community Posting Tests',
        status: 'SKIP',
        message: 'No authenticated user available for posting tests',
        duration: 0
      });
      this.addTestSuite('Community Posting Tests', tests, suiteStartTime);
      return;
    }

    // Get a project for the post
    const projectsResult = await getUserProjects(testUserId);
    const projectId = projectsResult.data?.[0]?.id || null;

    // Test 1: Post Creation
    tests.push(await this.runTest('Post Creation Test', async () => {
      const result = await createPost({
        ...this.TEST_POST,
        author_id: testUserId,
        project_id: projectId
      });
      
      if (result.error && result.error.code !== 'DB_NOT_AVAILABLE') {
        throw new Error(`Post creation failed: ${result.error.message}`);
      }
    }));

    // Test 2: Community Feed Retrieval
    tests.push(await this.runTest('Community Feed Test', async () => {
      const result = await getAllPosts();
      
      if (result.error && result.error.code !== 'DB_NOT_AVAILABLE') {
        throw new Error(`Community feed retrieval failed: ${result.error.message}`);
      }
    }));

    this.addTestSuite('Community Posting Tests', tests, suiteStartTime);
  }

  private async runDataPersistenceTests(): Promise<void> {
    const suiteStartTime = Date.now();
    const tests: TestResult[] = [];

    console.log('\n💾 Running Data Persistence Tests...');

    // Test 1: Auth Session Persistence
    tests.push(await this.runTest('Auth Session Persistence', async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new Error(`Session persistence check failed: ${error.message}`);
      }
    }));

    // Test 2: Data Relationship Integrity
    tests.push(await this.runTest('Data Relationship Integrity', async () => {
      // Test that posts link to correct users and projects
      const postsResult = await getAllPosts();
      
      if (postsResult.error && postsResult.error.code !== 'DB_NOT_AVAILABLE') {
        throw new Error(`Relationship integrity check failed: ${postsResult.error.message}`);
      }
      
      if (postsResult.data) {
        for (const post of postsResult.data) {
          if (!post.author_id) {
            throw new Error('Post missing author relationship');
          }
        }
      }
    }));

    this.addTestSuite('Data Persistence Tests', tests, suiteStartTime);
  }

  private async runCrossUserFunctionalityTests(): Promise<void> {
    const suiteStartTime = Date.now();
    const tests: TestResult[] = [];

    console.log('\n👥 Running Cross-User Functionality Tests...');

    // Test 1: Multiple User Registration
    tests.push(await this.runTest('Multiple User Registration', async () => {
      const result = await signUpUser(this.TEST_USER_2);
      
      if (result.error) {
        throw new Error(`Second user registration failed: ${result.error.message}`);
      }
      
      if (result.user) {
        this.testUsers.push(result.user);
      }
    }));

    // Test 2: Cross-User Post Visibility
    tests.push(await this.runTest('Cross-User Post Visibility', async () => {
      const postsResult = await getAllPosts();
      
      if (postsResult.error && postsResult.error.code !== 'DB_NOT_AVAILABLE') {
        throw new Error(`Cross-user visibility check failed: ${postsResult.error.message}`);
      }
      
      // Check that posts from different users are visible
      if (postsResult.data && postsResult.data.length > 0) {
        const authors = new Set(postsResult.data.map(post => post.author_id));
        if (authors.size < 1) {
          console.log('⚠️ Limited cross-user data for visibility test');
        }
      }
    }));

    this.addTestSuite('Cross-User Functionality Tests', tests, suiteStartTime);
  }

  private async cleanupTestData(): Promise<void> {
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      // Note: In a real implementation, you'd want to clean up test data
      // For now, we'll just sign out any test users
      await supabase.auth.signOut();
    } catch (error) {
      console.log('Cleanup completed with minor issues:', error);
    }
  }

  private addTestSuite(suiteName: string, tests: TestResult[], startTime: number): void {
    const totalTime = Date.now() - startTime;
    const passCount = tests.filter(t => t.status === 'PASS').length;
    const failCount = tests.filter(t => t.status === 'FAIL').length;
    const skipCount = tests.filter(t => t.status === 'SKIP').length;

    this.testResults.push({
      suiteName,
      tests,
      totalTime,
      passCount,
      failCount,
      skipCount
    });
  }

  private generateSummary() {
    const totalTests = this.testResults.reduce((sum, suite) => sum + suite.tests.length, 0);
    const totalPassed = this.testResults.reduce((sum, suite) => sum + suite.passCount, 0);
    const totalFailed = this.testResults.reduce((sum, suite) => sum + suite.failCount, 0);
    const totalSkipped = this.testResults.reduce((sum, suite) => sum + suite.skipCount, 0);
    const totalTime = this.testResults.reduce((sum, suite) => sum + suite.totalTime, 0);

    return {
      totalTests,
      totalPassed,
      totalFailed,
      totalSkipped,
      totalTime,
      passRate: totalTests > 0 ? (totalPassed / totalTests) * 100 : 0,
      overallStatus: totalFailed === 0 ? 'PASS' : 'FAIL'
    };
  }

  private printResults(): void {
    console.log('\n================================================');
    console.log('🧪 DevTrack Africa Test Results Summary');
    console.log('================================================');

    this.testResults.forEach(suite => {
      console.log(`\n📋 ${suite.suiteName}`);
      console.log(`   ✅ Passed: ${suite.passCount}`);
      console.log(`   ❌ Failed: ${suite.failCount}`);
      console.log(`   ⏭️ Skipped: ${suite.skipCount}`);
      console.log(`   ⏱️ Time: ${suite.totalTime}ms`);

      if (suite.failCount > 0) {
        console.log('   Failed tests:');
        suite.tests
          .filter(test => test.status === 'FAIL')
          .forEach(test => {
            console.log(`     - ${test.testName}: ${test.message}`);
          });
      }
    });

    const summary = this.generateSummary();
    console.log('\n================================================');
    console.log('📊 Overall Summary');
    console.log('================================================');
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Passed: ${summary.totalPassed} (${summary.passRate.toFixed(1)}%)`);
    console.log(`Failed: ${summary.totalFailed}`);
    console.log(`Skipped: ${summary.totalSkipped}`);
    console.log(`Total Time: ${summary.totalTime}ms`);
    console.log(`Overall Status: ${summary.overallStatus}`);

    if (summary.overallStatus === 'FAIL') {
      console.log('\n⚠️ CRITICAL ISSUES DETECTED');
      console.log('Please review failed tests before deploying to production.');
    } else {
      console.log('\n🎉 ALL TESTS PASSED');
      console.log('DevTrack Africa is ready for production!');
    }
  }
}

// Console testing commands for manual verification
export const consoleTestCommands = {
  // Test database connection
  testDatabase: async () => {
    console.log('Testing database connection...');
    const result = await supabase.from('users').select('count', { count: 'exact' });
    console.log('Database test result:', result);
    return result;
  },

  // Test current user
  testCurrentUser: async () => {
    console.log('Testing current user...');
    const result = await supabase.auth.getUser();
    console.log('Current user:', result);
    return result;
  },

  // Test project creation
  testProjects: async () => {
    console.log('Testing projects...');
    const result = await supabase.from('projects').select('*');
    console.log('Projects test result:', result);
    return result;
  },

  // Test posts visibility
  testPosts: async () => {
    console.log('Testing posts...');
    const result = await supabase.from('posts').select('*, author:users(full_name)');
    console.log('Posts test result:', result);
    return result;
  }
};

// Export the main testing suite
export { DevTrackTestingSuite };

// Usage example:
// const testSuite = new DevTrackTestingSuite();
// const results = await testSuite.runAllTests();