import chalk from 'chalk';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

export class TestRunner {
  private results: TestResult[] = [];

  async runTest(name: string, testFn: () => Promise<void> | void): Promise<void> {
    const startTime = Date.now();
    console.log(chalk.blue(`🧪 Running test: ${name}`));
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.results.push({ name, passed: true, duration });
      console.log(chalk.green(`✅ ${name} - PASSED (${duration}ms)`));
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.results.push({ name, passed: false, error: errorMessage, duration });
      console.log(chalk.red(`❌ ${name} - FAILED (${duration}ms): ${errorMessage}`));
    }
  }

  printSummary(): void {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n' + '='.repeat(60));
    console.log(chalk.bold('TEST SUMMARY'));
    console.log('='.repeat(60));
    console.log(`Total Tests: ${this.results.length}`);
    console.log(chalk.green(`Passed: ${passed}`));
    console.log(chalk.red(`Failed: ${failed}`));
    console.log(`Total Duration: ${totalDuration}ms`);
    
    if (failed > 0) {
      console.log('\n' + chalk.red('FAILED TESTS:'));
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(chalk.red(`  - ${result.name}: ${result.error}`));
      });
    }
  }

  getResults(): TestResult[] {
    return [...this.results];
  }

  hasFailures(): boolean {
    return this.results.some(r => !r.passed);
  }
}