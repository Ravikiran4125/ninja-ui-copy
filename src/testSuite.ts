import dotenv from 'dotenv';
import { runBillingCalculatorTests } from './utils/__tests__/billingCalculator.test.js';
import { runOpenAIUtilsTests } from './utils/__tests__/openaiUtils.test.js';
import { runShurikenTests } from './core/__tests__/shuriken.test.js';
import { TestRunner } from './utils/testRunner.js';
import chalk from 'chalk';

// Load environment variables
dotenv.config();

async function runAllTests(): Promise<void> {
  console.log(chalk.bold.blue('🧪 OpenAI Teaching Package - Test Suite'));
  console.log('='.repeat(60));

  const mainTestRunner = new TestRunner();

  await mainTestRunner.runTest('Billing Calculator Tests', async () => {
    await runBillingCalculatorTests();
  });

  await mainTestRunner.runTest('OpenAI Utils Tests', async () => {
    await runOpenAIUtilsTests();
  });

  await mainTestRunner.runTest('Shuriken Tests', async () => {
    await runShurikenTests();
  });

  console.log('\n' + '='.repeat(60));
  console.log(chalk.bold.blue('OVERALL TEST SUITE SUMMARY'));
  console.log('='.repeat(60));
  
  mainTestRunner.printSummary();

  if (mainTestRunner.hasFailures()) {
    console.log(chalk.red('\n❌ Test suite failed. Please fix the failing tests.'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All tests passed successfully!'));
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(error => {
    console.error(chalk.red('❌ Test suite execution failed:'), error);
    process.exit(1);
  });
}

export { runAllTests };